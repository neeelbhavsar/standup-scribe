import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import type { Repository, ExportMarkdownOptions, ExportJsonOptions } from './types.js';
import { formatMinutes } from './estimator.js';

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

    for (const commit of repo.commits) {
      const time = dayjs(commit.timestamp).format('HH:mm');
      lines.push(`- \`${commit.hash}\` ${commit.message} *(\`${time}\`)*`);
    }

    lines.push('');
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
  lines.push('Repo,Commit Hash,Message,Author,Timestamp,Estimated Minutes');

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
 * Copy text to clipboard (requires platform-specific handling)
 */
export async function copyToClipboard(text: string): Promise<void> {
  // This is a basic implementation. In a real app, you might use
  // the 'clipboardy' or 'copy-paste' package
  try {
    const platform = process.platform;

    if (platform === 'darwin') {
      // macOS
      const proc = require('child_process').spawn('pbcopy');
      proc.stdin.write(text);
      proc.stdin.end();
    } else if (platform === 'win32') {
      // Windows - use clip.exe
      const proc = require('child_process').spawn('clip');
      proc.stdin.write(text);
      proc.stdin.end();
    } else if (platform === 'linux') {
      // Linux - try xclip or xsel
      const proc = require('child_process').spawn('xclip', ['-selection', 'clipboard']);
      proc.stdin.write(text);
      proc.stdin.end();
    }
  } catch {
    // Silently fail if clipboard is not available
    return;
  }
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
