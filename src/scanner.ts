import fs from 'fs';
import path from 'path';
import type { ScanResult, ScannerOptions } from './types.js';

/**
 * Recursively scan directories for git repositories
 * Skips node_modules, hidden folders, and respects max depth
 */
export async function scanForGitRepos(options: ScannerOptions): Promise<ScanResult[]> {
  const { dirs, depth } = options;
  const repos = new Map<string, ScanResult>();

  for (const dir of dirs) {
    const repos_found = await scanDirectory(dir, 0, depth);
    for (const repo of repos_found) {
      repos.set(repo.path, repo);
    }
  }

  return Array.from(repos.values()).sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Recursively scan a single directory for git repos
 */
async function scanDirectory(
  dir: string,
  currentDepth: number,
  maxDepth: number,
): Promise<ScanResult[]> {
  const results: ScanResult[] = [];

  // Check if this directory itself is a git repo
  if (isGitRepo(dir)) {
    const name = path.basename(dir);
    results.push({ name, path: dir });
    // Don't scan inside a git repo
    return results;
  }

  // Respect max depth
  if (currentDepth >= maxDepth) {
    return results;
  }

  // Try to read directory
  let entries: string[] = [];
  try {
    entries = await fs.promises.readdir(dir);
  } catch {
    // Permission denied or path doesn't exist - skip silently
    return results;
  }

  // Scan subdirectories
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);

    // Skip hidden directories and common exclusions
    if (entry.startsWith('.') || entry === 'node_modules') {
      continue;
    }

    let isDirectory = false;
    try {
      const stat = await fs.promises.stat(fullPath);
      isDirectory = stat.isDirectory();
    } catch {
      // Skip if we can't stat it
      continue;
    }

    if (isDirectory) {
      const subRepos = await scanDirectory(fullPath, currentDepth + 1, maxDepth);
      results.push(...subRepos);
    }
  }

  return results;
}

/**
 * Check if a directory contains a .git folder (is a git repo)
 */
function isGitRepo(dir: string): boolean {
  try {
    const gitPath = path.join(dir, '.git');
    const stat = fs.statSync(gitPath);
    return stat.isDirectory() || stat.isFile(); // .git can be file (worktrees) or dir
  } catch {
    return false;
  }
}

/**
 * Validate that a path is a valid git repository
 */
export function validateGitRepo(dir: string): boolean {
  return isGitRepo(dir);
}
