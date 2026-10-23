import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { simpleGit, SimpleGit } from 'simple-git';
import { getCommitsFromRepo, branchFromSource, compileExcludePatterns } from '../src/commits.js';
import { resolveDateRange } from '../src/dates.js';
import type { DateRange } from '../src/types.js';

describe('commits', () => {
  let repoDir: string;
  let range: DateRange;

  /**
   * Build a repo shaped like:
   *
   *   main:      feat: initial ── chore: wip stuff ── docs: feature-y docs ── Merge feature-y
   *   feature-x:                  └─ fix: feature x fix
   */
  beforeAll(async () => {
    repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'standup-scribe-commits-'));
    const git: SimpleGit = simpleGit(repoDir);

    await git.raw(['init', '-b', 'main']);
    await git.addConfig('user.name', 'Test User');
    await git.addConfig('user.email', 'test@example.com');
    await git.addConfig('commit.gpgsign', 'false');

    const commit = (message: string) => git.commit(message, [], { '--allow-empty': null });

    await commit('feat: initial');
    await commit('chore: wip stuff');

    await git.checkoutLocalBranch('feature-x');
    await commit('fix: feature x fix');

    await git.checkout('main');
    await git.checkoutLocalBranch('feature-y');
    await commit('docs: feature-y docs');

    await git.checkout('main');
    await git.merge(['--no-ff', 'feature-y', '-m', "Merge branch 'feature-y'"]);
    await git.deleteLocalBranch('feature-y');

    // Resolve after committing so every commit falls before the range end
    range = resolveDateRange({ days: 7 });
  });

  afterAll(() => {
    fs.rmSync(repoDir, { recursive: true, force: true });
  });

  const messages = (commits: { message: string }[]) => commits.map((c) => c.message).sort();

  it('should return commits from all branches with a branch label on every commit', async () => {
    const commits = await getCommitsFromRepo(repoDir, { allAuthors: true }, range);

    expect(messages(commits)).toEqual(
      messages([
        { message: 'feat: initial' },
        { message: 'chore: wip stuff' },
        { message: 'fix: feature x fix' },
        { message: 'docs: feature-y docs' },
        { message: "Merge branch 'feature-y'" },
      ]),
    );
    expect(commits.find((c) => c.message === 'fix: feature x fix')?.branch).toBe('feature-x');
    expect(commits.find((c) => c.message === 'feat: initial')?.branch).not.toBe('unknown');
  });

  it('should return every commit on --branch, not just the tip', async () => {
    const commits = await getCommitsFromRepo(repoDir, { allAuthors: true, branch: 'main' }, range);

    expect(commits).toHaveLength(4);
    expect(messages(commits)).not.toContain('fix: feature x fix');
    expect(commits.every((c) => c.branch === 'main')).toBe(true);
  });

  it('should include history shared with the base branch on a feature branch', async () => {
    const commits = await getCommitsFromRepo(
      repoDir,
      { allAuthors: true, branch: 'feature-x' },
      range,
    );

    expect(messages(commits)).toEqual(
      messages([
        { message: 'feat: initial' },
        { message: 'chore: wip stuff' },
        { message: 'fix: feature x fix' },
      ]),
    );
  });

  it('should return nothing for a branch that does not exist', async () => {
    const commits = await getCommitsFromRepo(repoDir, { allAuthors: true, branch: 'nope' }, range);
    expect(commits).toEqual([]);
  });

  it('should hide merge commits with excludeMerges', async () => {
    const commits = await getCommitsFromRepo(
      repoDir,
      { allAuthors: true, excludeMerges: true },
      range,
    );

    expect(commits).toHaveLength(4);
    expect(messages(commits)).not.toContain("Merge branch 'feature-y'");
  });

  it('should hide commits matching exclude patterns, case-insensitively', async () => {
    const commits = await getCommitsFromRepo(
      repoDir,
      { allAuthors: true, exclude: ['^CHORE', '^merge branch'] },
      range,
    );

    expect(messages(commits)).toEqual(
      messages([
        { message: 'feat: initial' },
        { message: 'fix: feature x fix' },
        { message: 'docs: feature-y docs' },
      ]),
    );
  });

  it('should filter by author', async () => {
    const mine = await getCommitsFromRepo(repoDir, { author: 'Test User' }, range);
    const theirs = await getCommitsFromRepo(repoDir, { author: 'Someone Else' }, range);

    expect(mine).toHaveLength(5);
    expect(theirs).toEqual([]);
  });

  describe('branchFromSource', () => {
    it('should strip ref prefixes', () => {
      expect(branchFromSource('refs/heads/main')).toBe('main');
      expect(branchFromSource('refs/remotes/origin/feature/login')).toBe('feature/login');
      expect(branchFromSource('refs/tags/v1.0.0')).toBe('v1.0.0');
      expect(branchFromSource('')).toBe('unknown');
      expect(branchFromSource(undefined)).toBe('unknown');
    });
  });

  describe('compileExcludePatterns', () => {
    it('should throw a readable error for invalid regex', () => {
      expect(() => compileExcludePatterns(['(unclosed'])).toThrow(/Invalid --exclude pattern/);
    });
  });
});
