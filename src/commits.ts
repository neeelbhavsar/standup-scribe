import { simpleGit, SimpleGit } from 'simple-git';
import dayjs from 'dayjs';
import type { Commit, StandupOptions } from './types.js';

/**
 * Fetch commits from a single git repository
 * Filters by date range, author, and optionally branch
 */
export async function getCommitsFromRepo(
  repoPath: string,
  options: StandupOptions,
): Promise<Commit[]> {
  const git: SimpleGit = simpleGit(repoPath);

  try {
    // Check if repo has any commits
    const log = await git.log({ maxCount: 1 });
    if (!log.total) {
      return [];
    }
  } catch {
    // Repo might be mid-clone or in a bad state
    return [];
  }

  // Calculate date range
  const days = options.days || 1;
  const endDate = dayjs();
  const startDate = endDate.subtract(days, 'day');

  // Build git log options
  const gitLogOptions: any = {
    '--all': null, // Search all branches
    '--date': 'iso-strict',
  };

  // Add date filters
  gitLogOptions['--since'] = startDate.toISOString();
  gitLogOptions['--until'] = endDate.toISOString();

  // Add branch filter if specified
  if (options.branch) {
    // Will be added to the command differently
  }

  // Add author filter if not showing all authors
  if (!options.allAuthors && options.author) {
    gitLogOptions['--author'] = options.author;
  }

  try {
    const log = await git.log(gitLogOptions);

    const commits: Commit[] = log.all
      .map((commit) => ({
        hash: commit.hash.substring(0, 7),
        message: commit.message,
        author: {
          name: commit.author_name || 'Unknown',
          email: commit.author_email || 'unknown@example.com',
        },
        timestamp: commit.date || new Date().toISOString(),
        branch: commit.refs ? extractBranchFromRefs(commit.refs) : 'unknown',
      }))
      .filter((commit) => {
        // Additional filtering by branch if needed
        if (options.branch && commit.branch !== options.branch) {
          return false;
        }
        return true;
      });

    return commits;
  } catch (error) {
    // Handle git command errors gracefully
    return [];
  }
}

/**
 * Extract branch name from git refs string
 * Example: "HEAD -> main, origin/main" => "main"
 */
function extractBranchFromRefs(refs: string): string {
  const headMatch = refs.match(/HEAD -> ([^,]+)/);
  if (headMatch) {
    return headMatch[1].trim();
  }

  const parts = refs.split(',').map((s) => s.trim());
  if (parts.length > 0) {
    // Return first non-origin ref
    const nonOrigin = parts.find((p) => !p.startsWith('origin/'));
    if (nonOrigin) {
      return nonOrigin.replace(/^(HEAD -> )?/, '');
    }
    // Fall back to first ref minus origin/
    return parts[0].replace('origin/', '');
  }

  return 'unknown';
}

/**
 * Get current user from git config
 * Falls back to environment variables if not set
 */
export async function getCurrentUser(repoPath: string = '.'): Promise<string> {
  const git: SimpleGit = simpleGit(repoPath);

  try {
    const name = await git.getConfig('user.name');
    if (name && name.value) {
      return name.value;
    }
  } catch {
    // Continue to fallback
  }

  // Fallback to environment
  if (process.env.GIT_AUTHOR_NAME) {
    return process.env.GIT_AUTHOR_NAME;
  }
  if (process.env.USER) {
    return process.env.USER;
  }
  if (process.env.USERNAME) {
    return process.env.USERNAME;
  }

  return 'Unknown';
}

/**
 * Check if git is installed and available
 */
export async function isGitAvailable(): Promise<boolean> {
  try {
    const git: SimpleGit = simpleGit();
    await git.version();
    return true;
  } catch {
    return false;
  }
}
