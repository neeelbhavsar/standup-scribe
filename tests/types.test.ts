import { describe, it, expect } from 'vitest';
import type { Commit, Repository, StandupResult } from '../src/types.js';

describe('TypeScript types', () => {
  it('should create valid Commit object', () => {
    const commit: Commit = {
      hash: 'abc1234',
      message: 'feat: add new feature',
      author: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      timestamp: '2024-04-13T10:30:00.000Z',
      branch: 'main',
    };

    expect(commit.hash).toBe('abc1234');
    expect(commit.message).toContain('feat:');
  });

  it('should create valid Repository object', () => {
    const repo: Repository = {
      name: 'my-project',
      path: '/path/to/my-project',
      commits: [],
      estimatedMinutes: 120,
    };

    expect(repo.name).toBe('my-project');
    expect(repo.estimatedMinutes).toBe(120);
  });

  it('should create valid StandupResult object', () => {
    const result: StandupResult = {
      repos: [],
      totalCommits: 0,
      totalMinutes: 0,
      author: 'John Doe',
      startDate: '2024-04-12T00:00:00.000Z',
      endDate: '2024-04-13T23:59:59.999Z',
      allAuthors: false,
    };

    expect(result.author).toBe('John Doe');
    expect(result.totalCommits).toBe(0);
  });
});
