import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { scanForGitRepos, validateGitRepo } from '../src/scanner.js';

describe('scanner', () => {
  let testDir: string;

  beforeEach(() => {
    // Create a temporary test directory
    testDir = path.join(process.cwd(), '.test-repos-' + Date.now());
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should return empty array for non-existent directory', async () => {
    const result = await scanForGitRepos({
      dirs: [path.join(testDir, 'nonexistent')],
      depth: 3,
    });

    expect(result).toEqual([]);
  });

  it('should find git repositories', async () => {
    // Create a fake git repo
    const repo1Dir = path.join(testDir, 'repo1');
    const gitDir = path.join(repo1Dir, '.git');
    fs.mkdirSync(repo1Dir, { recursive: true });
    fs.mkdirSync(gitDir, { recursive: true });

    const result = await scanForGitRepos({
      dirs: [testDir],
      depth: 3,
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('repo1');
    expect(result[0].path).toBe(repo1Dir);
  });

  it('should not scan inside git repositories', async () => {
    // Create a git repo with nested dir structure
    const repo1Dir = path.join(testDir, 'repo1');
    const gitDir = path.join(repo1Dir, '.git');
    const nestedDir = path.join(repo1Dir, 'nested', 'deep');
    const nestedGit = path.join(nestedDir, '.git');

    fs.mkdirSync(repo1Dir, { recursive: true });
    fs.mkdirSync(gitDir, { recursive: true });
    fs.mkdirSync(nestedDir, { recursive: true });
    fs.mkdirSync(nestedGit, { recursive: true });

    const result = await scanForGitRepos({
      dirs: [testDir],
      depth: 3,
    });

    // Should only find repo1, not the nested one
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('repo1');
  });

  it('should respect max depth', async () => {
    // Create nested directories
    const level1 = path.join(testDir, 'level1');
    const level2 = path.join(level1, 'level2');
    const level3 = path.join(level2, 'level3');
    const level4 = path.join(level3, 'level4');

    const gitDir4 = path.join(level4, '.git');

    fs.mkdirSync(level4, { recursive: true });
    fs.mkdirSync(gitDir4, { recursive: true });

    // With depth=2, should not find repo at depth 4
    const result = await scanForGitRepos({
      dirs: [testDir],
      depth: 2,
    });

    expect(result.length).toBe(0);
  });

  it('should skip node_modules and hidden directories', async () => {
    // Create repo structure with excluded dirs
    const repo1 = path.join(testDir, 'repo1');
    const nodeModules = path.join(repo1, 'node_modules');
    const hidden = path.join(repo1, '.hidden');
    const normalDir = path.join(repo1, 'src');

    const gitDir1 = path.join(repo1, '.git');
    const gitNodeModules = path.join(nodeModules, '.git');
    const gitHidden = path.join(hidden, '.git');
    const gitNormal = path.join(normalDir, '.git');

    fs.mkdirSync(repo1, { recursive: true });
    fs.mkdirSync(gitDir1, { recursive: true });
    fs.mkdirSync(nodeModules, { recursive: true });
    fs.mkdirSync(gitNodeModules, { recursive: true });
    fs.mkdirSync(hidden, { recursive: true });
    fs.mkdirSync(gitHidden, { recursive: true });
    fs.mkdirSync(normalDir, { recursive: true });
    fs.mkdirSync(gitNormal, { recursive: true });

    const result = await scanForGitRepos({
      dirs: [testDir],
      depth: 3,
    });

    // Should only find repo1
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('repo1');
  });

  it('should validate git repo', () => {
    const repo1Dir = path.join(testDir, 'repo1');
    const gitDir = path.join(repo1Dir, '.git');

    fs.mkdirSync(repo1Dir, { recursive: true });
    fs.mkdirSync(gitDir, { recursive: true });

    expect(validateGitRepo(repo1Dir)).toBe(true);
  });

  it('should return false for non-git directory', () => {
    const repo1Dir = path.join(testDir, 'repo1');
    fs.mkdirSync(repo1Dir, { recursive: true });

    expect(validateGitRepo(repo1Dir)).toBe(false);
  });
});
