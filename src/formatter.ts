import chalk from 'chalk';
import dayjs from 'dayjs';
import type { Repository, StandupResult } from './types.js';
import { formatMinutes } from './estimator.js';
import { groupCommitsByType } from './conventional.js';

export interface FormatOptions {
  groupByType?: boolean; // Group commits under Features / Fixes / Chores / ...
}

/**
 * Check if output should be colorized
 * Disable colors in quiet mode or when stdout is not a TTY
 */
function shouldColorize(quiet: boolean | undefined): boolean {
  return !quiet && process.stdout.isTTY;
}

/**
 * Format the complete standup output for terminal display
 */
export function formatStandupOutput(
  result: StandupResult,
  quiet: boolean = false,
  options: FormatOptions = {},
): string {
  const colorize = shouldColorize(quiet);
  const lines: string[] = [];

  // Header
  const startDate = dayjs(result.startDate).format('ddd MMM DD');
  const endDate = dayjs(result.endDate).format('ddd MMM DD');
  const period = `${startDate} to ${endDate}`;

  const divider = colorize ? chalk.dim('─'.repeat(50)) : '─'.repeat(50);
  lines.push('');
  lines.push(divider);

  const title = colorize
    ? chalk.bold(`  standup-scribe — ${period}`)
    : `  standup-scribe — ${period}`;
  lines.push(title);

  const authorText = `Author: ${result.author}  |  Repos scanned: ${result.reposScanned ?? result.repos.length}`;
  const authorLine = colorize ? chalk.dim(authorText) : authorText;
  lines.push(`  ${authorLine}`);

  lines.push(divider);
  lines.push('');

  // Repositories
  for (const repo of result.repos) {
    lines.push(formatRepository(repo, colorize, options));
  }

  // Summary footer
  lines.push('');
  lines.push(divider);

  const totalText = `  Total: ${result.totalCommits} commit${result.totalCommits !== 1 ? 's' : ''} across ${result.repos.length} repo${result.repos.length !== 1 ? 's' : ''}`;
  const totalLine = colorize ? chalk.bold(totalText) : totalText;
  lines.push(totalLine);

  const estimatedText = `  Estimated total time: ${formatMinutes(result.totalMinutes)}`;
  const estimatedLine = colorize ? chalk.green(estimatedText) : estimatedText;
  lines.push(estimatedLine);

  lines.push(divider);
  lines.push('');

  return lines.join('\n');
}

/**
 * Format a single repository section
 */
function formatRepository(
  repo: Repository,
  colorize: boolean,
  options: FormatOptions,
): string {
  const lines: string[] = [];

  // Repo name and path
  const nameText = colorize ? chalk.bold.blue(` ${repo.name}`) : ` ${repo.name}`;
  const pathText = colorize ? chalk.dim(`  ${repo.path}`) : `  ${repo.path}`;

  lines.push(nameText);
  lines.push(pathText);

  // Commits
  if (options.groupByType) {
    for (const group of groupCommitsByType(repo.commits)) {
      lines.push(colorize ? chalk.magenta(`  ${group.label}`) : `  ${group.label}`);
      for (const commit of group.commits) {
        lines.push(`  ${formatCommit(commit, colorize)}`);
      }
    }
  } else {
    for (const commit of repo.commits) {
      lines.push(formatCommit(commit, colorize));
    }
  }

  // Time estimate
  const estimateText = `  Estimated time: ${formatMinutes(repo.estimatedMinutes)}  (${repo.commits.length} commit${repo.commits.length !== 1 ? 's' : ''})`;
  const estimateLine = colorize ? chalk.green(estimateText) : estimateText;
  lines.push(estimateLine);

  lines.push('');

  return lines.join('\n');
}

/**
 * Format a single commit line
 */
function formatCommit(commit: any, colorize: boolean): string {
  const time = commit.time || dayjs(commit.timestamp).format('HH:mm');
  const timeText = colorize ? chalk.dim(`[${time}]`) : `[${time}]`;
  const hashText = colorize ? chalk.yellow(commit.hash) : commit.hash;
  const messageText = commit.message;

  return `  ${timeText}  ${hashText}  ${messageText}`;
}

/**
 * Format commit list for markdown export
 */
export function formatCommitForMarkdown(commit: any): string {
  const time = commit.time || dayjs(commit.timestamp).format('HH:mm');
  return `- \`${commit.hash}\` ${commit.message} *(\`${time}\`)*`;
}

/**
 * Colorize a text string
 */
export const color = {
  repo: (text: string) => chalk.bold.blue(text),
  hash: (text: string) => chalk.yellow(text),
  path: (text: string) => chalk.dim(text),
  time: (text: string) => chalk.dim(text),
  estimate: (text: string) => chalk.green(text),
  divider: (text: string) => chalk.dim(text),
  bold: (text: string) => chalk.bold(text),
  dim: (text: string) => chalk.dim(text),
};

/**
 * Format error message
 */
export function formatError(message: string, quiet: boolean = false): string {
  if (quiet || !shouldColorize(quiet)) {
    return `Error: ${message}`;
  }
  return chalk.red.bold(`Error: ${message}`);
}

/**
 * Format success message
 */
export function formatSuccess(message: string, quiet: boolean = false): string {
  if (quiet || !shouldColorize(quiet)) {
    return message;
  }
  return chalk.green(message);
}

/**
 * Format info message
 */
export function formatInfo(message: string, quiet: boolean = false): string {
  if (quiet || !shouldColorize(quiet)) {
    return message;
  }
  return chalk.blue(message);
}
