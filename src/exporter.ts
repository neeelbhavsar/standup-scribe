import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import dayjs from 'dayjs';
import type { Commit, Repository, ExportMarkdownOptions, ExportJsonOptions } from './types.js';
import { formatMinutes } from './estimator.js';
import { getCommitType, groupCommitsByType } from './conventional.js';

/**
 * Export standup to markdown format
 */
export function exportToMarkdown(options: ExportMarkdownOptions): string {
  const lines: string[] = [];

  // Header
  const today = dayjs().format('MMMM DD, YYYY');
  lines.push(`## Standup — ${today}`);
  lines.push('');

  lines.push(`**Author:** ${options.author}`);
  lines.push(`**Period:** ${options.period}`);
  lines.push('');

  // Repositories
  for (const repo of options.repos) {
    lines.push(`### ${repo.name}`);
    lines.push('');

    if (options.groupByType) {
      for (const group of groupCommitsByType(repo.commits)) {
        lines.push(`**${group.label}**`);
        lines.push('');
        lines.push(...group.commits.map(formatMarkdownCommit));
        lines.push('');
      }
    } else {
      lines.push(...repo.commits.map(formatMarkdownCommit));
      lines.push('');
    }

    lines.push(`> Estimated time: ${formatMinutes(repo.estimatedMinutes)}`);
    lines.push('');
  }

  // Summary
  lines.push('---');
  lines.push('');
  lines.push(
    `**Total:** ${options.totalCommits} commit${options.totalCommits !== 1 ? 's' : ''} · ${formatMinutes(options.totalMinutes)}`,
  );

  return lines.join('\n');
}

function formatMarkdownCommit(commit: Commit): string {
  const time = dayjs(commit.timestamp).format('HH:mm');
  return `- \`${commit.hash}\` ${commit.message} *(\`${time}\`)*`;
}

/**
 * Export standup to JSON format
 */
export function exportToJson(options: ExportJsonOptions): string {
  const data = {
    generatedAt: options.generatedAt,
    author: options.author,
    period: options.period,
    totalCommits: options.totalCommits,
    totalMinutes: options.totalMinutes,
    totalFormatted: formatMinutes(options.totalMinutes),
    repos: options.repos.map((repo) => ({
      name: repo.name,
      path: repo.path,
      commits: repo.commits.map((commit) => ({
        hash: commit.hash,
        message: commit.message,
        type: getCommitType(commit.message),
        author: commit.author,
        timestamp: commit.timestamp,
        branch: commit.branch,
      })),
      estimatedMinutes: repo.estimatedMinutes,
      estimatedFormatted: formatMinutes(repo.estimatedMinutes),
    })),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Export to CSV format (simple implementation)
 */
export function exportToCsv(options: {
  author: string;
  repos: Repository[];
  totalCommits: number;
  totalMinutes: number;
}): string {
  const lines: string[] = [];

  // Header
  lines.push('Repo,Commit Hash,Message,Author,Timestamp,Estimated Minutes,Branch,Type');

  // Data rows
  for (const repo of options.repos) {
    for (const commit of repo.commits) {
      const row = [
        repo.name,
        commit.hash,
        `"${commit.message.replace(/"/g, '""')}"`,
        `"${commit.author.name}"`,
        commit.timestamp,
        repo.estimatedMinutes,
        `"${commit.branch.replace(/"/g, '""')}"`,
        getCommitType(commit.message),
      ].join(',');
      lines.push(row);
    }
  }

  return lines.join('\n');
}

/**
 * Save content to file
 */
export async function saveToFile(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);

  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await fs.promises.writeFile(filePath, content, 'utf-8');
}

/**
 * Clipboard commands to try, per platform, in order
 */
function clipboardCommands(): Array<{ command: string; args: string[] }> {
  if (process.platform === 'darwin') {
    return [{ command: 'pbcopy', args: [] }];
  }
  if (process.platform === 'win32') {
    return [{ command: 'clip', args: [] }];
  }
  return [
    { command: 'wl-copy', args: [] },
    { command: 'xclip', args: ['-selection', 'clipboard'] },
    { command: 'xsel', args: ['--clipboard', '--input'] },
  ];
}

/**
 * Pipe text into a clipboard command; resolves true if it exited cleanly
 */
function pipeToCommand(command: string, args: string[], input: Buffer): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, { stdio: ['pipe', 'ignore', 'ignore'] });
    proc.on('error', () => resolve(false)); // e.g. command not installed
    proc.on('close', (code) => resolve(code === 0));
    proc.stdin.on('error', () => resolve(false));
    proc.stdin.end(input);
  });
}

/**
 * Copy text to the system clipboard
 * Returns false if no clipboard tool is available (e.g. xclip missing on Linux)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // clip.exe garbles non-ASCII text (—, ·, emoji) unless it is sent as UTF-16LE
  const input = Buffer.from(text, process.platform === 'win32' ? 'utf16le' : 'utf-8');

  for (const { command, args } of clipboardCommands()) {
    if (await pipeToCommand(command, args, input)) {
      return true;
    }
  }

  return false;
}

/**
 * Determine export format and save
 */
export async function exportStandup(
  format: string,
  filePath: string | undefined,
  content: string,
): Promise<{ success: boolean; path?: string; error?: string }> {
  if (!filePath) {
    return { success: false, error: 'File path is required for export' };
  }

  try {
    await saveToFile(filePath, content);
    return { success: true, path: path.resolve(filePath) };
  } catch (error) {
    return {
      success: false,
      error: `Failed to export to ${format}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
