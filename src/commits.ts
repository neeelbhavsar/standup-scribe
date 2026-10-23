import { simpleGit, SimpleGit } from 'simple-git';
import type { Commit, DateRange, StandupOptions } from './types.js';
import { resolveDateRange } from './dates.js';

const LOG_FORMAT = {
  hash: '%H',
  date: '%aI',
  message: '%s',
  author_name: '%an',
  author_email: '%ae',
  source: '%S',
};

/**
 * Fetch commits from a single git repository
 * Filters by date range, author, branch, merges, and excluded message patterns
 */
export async function getCommitsFromRepo(
  repoPath: string,
  options: StandupOptions,
  range: DateRange = resolveDateRange(options),
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

  // Build git log options (insertion order is the argument order)
  const gitLogOptions: Record<string, string | null> = {
    '--source': null, // Report the ref each commit was reached from (%S)
    '--since': range.start.toISOString(),
    '--until': range.end.toISOString(),
  };

  if (options.branch) {
    const ref = await resolveBranchRef(git, options.branch);
    if (!ref) {
      // Branch doesn't exist in this repo
      return [];
    }
    gitLogOptions[ref] = null;
  } else {
    // Search all branches, but skip stash entries
    gitLogOptions['--exclude=refs/stash'] = null;
    gitLogOptions['--all'] = null;
  }

  if (options.excludeMerges) {
    gitLogOptions['--no-merges'] = null;
  }

  // Add author filter if not showing all authors
  if (!options.allAuthors && options.author) {
    gitLogOptions['--author'] = options.author;
  }

  const excludePatterns = compileExcludePatterns(options.exclude);

  try {
    const log = await git.log<typeof LOG_FORMAT>({ ...gitLogOptions, format: LOG_FORMAT });

    return log.all
      .filter((commit) => !excludePatterns.some((pattern) => pattern.test(commit.message)))
      .map((commit) => ({
        hash: commit.hash.substring(0, 7),
        message: commit.message,
        author: {
          name: commit.author_name || 'Unknown',
          email: commit.author_email || 'unknown@example.com',
        },
        timestamp: commit.date || new Date().toISOString(),
        branch: options.branch || branchFromSource(commit.source),
      }));
  } catch {
    // Handle git command errors gracefully
    return [];
  }
}

/**
 * Compile --exclude patterns into case-insensitive regular expressions
 * Throws a readable error for invalid patterns
 */
export function compileExcludePatterns(patterns: string[] = []): RegExp[] {
  return patterns.map((pattern) => {
    try {
      return new RegExp(pattern, 'i');
    } catch {
      throw new Error(`Invalid --exclude pattern "${pattern}". It must be a valid regular expression.`);
    }
  });
}

/**
 * Find the full ref for a branch name: local branch first, then origin, then any revision
 * Returns null if the branch doesn't exist in this repo
 */
async function resolveBranchRef(git: SimpleGit, branch: string): Promise<string | null> {
  const candidates = [`refs/heads/${branch}`, `refs/remotes/origin/${branch}`, branch];

  for (const ref of candidates) {
    try {
      await git.raw(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]);
      return ref;
    } catch {
      // Try the next candidate
    }
  }

  return null;
}

/**
 * Turn a --source ref into a branch name
 * Example: "refs/heads/main" => "main", "refs/remotes/origin/feature/x" => "feature/x"
 */
export function branchFromSource(source: string | undefined): string {
  const ref = (source || '').trim();
  if (!ref) {
    return 'unknown';
  }

  return ref
    .replace(/^refs\/heads\//, '')
    .replace(/^refs\/remotes\/[^/]+\//, '')
    .replace(/^refs\/tags\//, '');
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
