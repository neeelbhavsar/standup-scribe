import dayjs from 'dayjs';
import type { StandupOptions, StandupResult, Repository } from './types.js';
import { scanForGitRepos } from './scanner.js';
import { getCommitsFromRepo, getCurrentUser, isGitAvailable } from './commits.js';
import { estimateTimeSpent } from './estimator.js';
import { configManager } from './config.js';

/**
 * Main API function to get standup data
 * Scans directories for git repos, fetches commits, estimates time
 *
 * @example
 * const result = await getStandup({
 *   dirs: ['~/projects'],
 *   author: 'John Doe',
 *   days: 2,
 * });
 * console.log(result.repos);
 */
export async function getStandup(userOptions: StandupOptions = {}): Promise<StandupResult> {
  // Check if git is available
  const gitAvailable = await isGitAvailable();
  if (!gitAvailable) {
    throw new Error(
      'Git is not installed or not available in your PATH. Please install Git to use standup-scribe.',
    );
  }

  // Load saved config and merge with provided options
  const savedConfig = configManager.getConfig();
  const dirs = userOptions.dirs || savedConfig.dirs;
  const author = userOptions.author || savedConfig.author;
  const days = userOptions.days ?? savedConfig.days;
  const depth = userOptions.depth ?? savedConfig.depth;
  const allAuthors = userOptions.allAuthors || false;

  // Expand home directory in paths
  const expandedDirs = dirs.map((dir) => configManager.expandPath(dir));

  // Get current user if author not specified
  let finalAuthor = author;
  if (!finalAuthor) {
    finalAuthor = await getCurrentUser();
  }

  // Scan for repositories
  const scanResults = await scanForGitRepos({
    dirs: expandedDirs,
    depth,
  });

  if (scanResults.length === 0) {
    return {
      repos: [],
      totalCommits: 0,
      totalMinutes: 0,
      author: finalAuthor,
      startDate: dayjs().subtract(days, 'day').toISOString(),
      endDate: dayjs().toISOString(),
      allAuthors,
    };
  }

  // Fetch commits from each repository
  const repositories: Repository[] = [];

  for (const scanResult of scanResults) {
    const commits = await getCommitsFromRepo(scanResult.path, {
      author: finalAuthor,
      days,
      allAuthors,
      ...userOptions,
    });

    if (commits.length > 0) {
      const estimatedMinutes = estimateTimeSpent(commits);
      repositories.push({
        name: scanResult.name,
        path: scanResult.path,
        commits,
        estimatedMinutes,
      });
    }
  }

  // Calculate totals
  const totalCommits = repositories.reduce((sum, repo) => sum + repo.commits.length, 0);
  const totalMinutes = repositories.reduce((sum, repo) => sum + repo.estimatedMinutes, 0);

  // Calculate date range
  const startDate = dayjs().subtract(days, 'day');
  const endDate = dayjs();

  return {
    repos: repositories,
    totalCommits,
    totalMinutes,
    author: finalAuthor,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    allAuthors,
  };
}

// Export types for TypeScript users
export type {
  Commit,
  Repository,
  StandupResult,
  StandupOptions
} from './types.js';

// Export utility functions
export { formatMinutes, parseTimeString } from './estimator.js';
export { formatStandupOutput } from './formatter.js';
export { exportToMarkdown, exportToJson, exportToCsv } from './exporter.js';
export { configManager } from './config.js';
export { scanForGitRepos } from './scanner.js';
export { getCommitsFromRepo, getCurrentUser } from './commits.js';
