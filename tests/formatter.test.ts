import { describe, it, expect } from 'vitest';
import { formatStandupOutput, formatError, formatSuccess, formatInfo } from '../src/formatter.js';
import type { StandupResult } from '../src/types.js';
import dayjs from 'dayjs';

describe('formatter', () => {
  describe('formatStandupOutput', () => {
    it('should format empty standup result', () => {
      const result: StandupResult = {
        repos: [],
        totalCommits: 0,
        totalMinutes: 0,
        author: 'John Doe',
        startDate: dayjs().subtract(1, 'day').toISOString(),
        endDate: dayjs().toISOString(),
        allAuthors: false,
      };

      const output = formatStandupOutput(result, true);

      expect(output).toContain('standup-scribe');
      expect(output).toContain('John Doe');
      expect(output).toContain('0 commits');
    });

    it('should format standup with repositories', () => {
      const result: StandupResult = {
        repos: [
          {
            name: 'my-project',
            path: '/path/to/my-project',
            estimatedMinutes: 120,
            commits: [
              {
                hash: 'abc1234',
                message: 'feat: add feature',
                author: { name: 'John Doe', email: 'john@example.com' },
                timestamp: dayjs().toISOString(),
                branch: 'main',
              },
            ],
          },
        ],
        totalCommits: 1,
        totalMinutes: 120,
        author: 'John Doe',
        startDate: dayjs().subtract(1, 'day').toISOString(),
        endDate: dayjs().toISOString(),
        allAuthors: false,
      };

      const output = formatStandupOutput(result, true);

      expect(output).toContain('my-project');
      expect(output).toContain('feat: add feature');
      expect(output).toContain('~2h');
      expect(output).toContain('1 commit');
    });

    it('should include plural forms for multiple commits', () => {
      const result: StandupResult = {
        repos: [
          {
            name: 'project',
            path: '/path',
            estimatedMinutes: 120,
            commits: [
              {
                hash: 'abc1234',
                message: 'feat 1',
                author: { name: 'John', email: 'john@example.com' },
                timestamp: dayjs().toISOString(),
                branch: 'main',
              },
              {
                hash: 'def5678',
                message: 'feat 2',
                author: { name: 'John', email: 'john@example.com' },
                timestamp: dayjs().toISOString(),
                branch: 'main',
              },
            ],
          },
        ],
        totalCommits: 2,
        totalMinutes: 120,
        author: 'John',
        startDate: dayjs().subtract(1, 'day').toISOString(),
        endDate: dayjs().toISOString(),
        allAuthors: false,
      };

      const output = formatStandupOutput(result, true);

      expect(output).toContain('2 commits');
    });

    it('should not colorize in quiet mode', () => {
      const result: StandupResult = {
        repos: [],
        totalCommits: 0,
        totalMinutes: 0,
        author: 'John',
        startDate: dayjs().subtract(1, 'day').toISOString(),
        endDate: dayjs().toISOString(),
        allAuthors: false,
      };

      const output = formatStandupOutput(result, true);

      // ANSI color codes should not be present in quiet mode
      expect(output).not.toMatch(/\u001b\[\d+m/);
    });
  });

  describe('formatError', () => {
    it('should format error message', () => {
      const error = formatError('Something went wrong', true);
      expect(error).toContain('Error:');
      expect(error).toContain('Something went wrong');
    });
  });

  describe('formatSuccess', () => {
    it('should format success message', () => {
      const message = formatSuccess('Operation successful', true);
      expect(message).toBe('Operation successful');
    });
  });

  describe('formatInfo', () => {
    it('should format info message', () => {
      const message = formatInfo('Here is some info', true);
      expect(message).toBe('Here is some info');
    });
  });
});
