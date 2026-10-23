import dayjs from 'dayjs';
import type { Commit, EstimateResult, TimeBreakdown } from './types.js';

/**
 * Estimate time spent based on commit timestamps
 * Algorithm:
 * - Sort commits by timestamp ascending
 * - Gap between consecutive commits:
 *   - < 2 hours = count as active work time
 *   - >= 2 hours = assume a break, count as 30 min for that gap
 * - First commit of day: add 30 min before it (ramp-up time)
 * - Return total minutes
 */
export function estimateTimeSpent(commits: Commit[]): number {
  if (commits.length === 0) {
    return 0;
  }

  if (commits.length === 1) {
    // Single commit = 30 min
    return 30;
  }

  // Sort commits by timestamp ascending
  const sorted = [...commits].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  let totalMinutes = 0;
  let lastDate: string | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const commit = sorted[i];
    const currentDate = dayjs(commit.timestamp).format('YYYY-MM-DD');

    // First commit of the day: add 30 min ramp-up time
    if (lastDate !== currentDate) {
      totalMinutes += 30;
      lastDate = currentDate;
    }

    // If not the last commit, calculate gap to next commit
    if (i < sorted.length - 1) {
      const nextCommit = sorted[i + 1];
      const currentTime = dayjs(commit.timestamp);
      const nextTime = dayjs(nextCommit.timestamp);

      const gapMinutes = nextTime.diff(currentTime, 'minute');

      // If gap < 2 hours, count it as active work
      // If gap >= 2 hours, count 30 min (assume break)
      if (gapMinutes < 120) {
        totalMinutes += gapMinutes;
      } else {
        totalMinutes += 30;
      }
    }
  }

  return totalMinutes;
}

/**
 * Format minutes as a human-readable time string
 * Example: 135 minutes => "~2h 15m"
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 1) {
    return '~0m';
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `~${mins}m`;
  }

  if (mins === 0) {
    return `~${hours}h`;
  }

  return `~${hours}h ${mins}m`;
}

/**
 * Parse a time string back to minutes
 * Example: "2h 15m" => 135
 */
export function parseTimeString(timeStr: string): number {
  let minutes = 0;

  const hourMatch = timeStr.match(/(\d+)h/);
  if (hourMatch) {
    minutes += parseInt(hourMatch[1], 10) * 60;
  }

  const minMatch = timeStr.match(/(\d+)m/);
  if (minMatch) {
    minutes += parseInt(minMatch[1], 10);
  }

  return minutes;
}

/**
 * Build time breakdown per repository
 */
export function buildTimeBreakdown(
  repoPath: string,
  commits: Commit[],
): TimeBreakdown {
  const minutes = estimateTimeSpent(commits);
  return { repoPath, minutes };
}

/**
 * Build complete estimate result
 */
export function buildEstimateResult(
  reposWithCommits: Array<{ path: string; commits: Commit[] }>,
): EstimateResult {
  const breakdown: TimeBreakdown[] = [];
  let totalMinutes = 0;

  for (const { path, commits } of reposWithCommits) {
    const breakdown_item = buildTimeBreakdown(path, commits);
    breakdown.push(breakdown_item);
    totalMinutes += breakdown_item.minutes;
  }

  return { totalMinutes, breakdown };
}
