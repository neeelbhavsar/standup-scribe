import { describe, it, expect } from 'vitest';
import { exportToMarkdown, exportToJson, exportToCsv } from '../src/exporter.js';
import type { Repository } from '../src/types.js';
import dayjs from 'dayjs';

describe('exporter', () => {
  const mockRepos: Repository[] = [
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
  ];

  describe('exportToMarkdown', () => {
    it('should export standup to markdown', () => {
      const markdown = exportToMarkdown({
        author: 'John Doe',
        period: 'Last 1 day',
        repos: mockRepos,
        totalCommits: 1,
        totalMinutes: 120,
      });

      expect(markdown).toContain('## Standup');
      expect(markdown).toContain('**Author:** John Doe');
      expect(markdown).toContain('**Period:** Last 1 day');
      expect(markdown).toContain('### my-project');
      expect(markdown).toContain('feat: add feature');
      expect(markdown).toContain('~2h');
      expect(markdown).toContain('1 commit');
    });

    it('should include correct markdown formatting', () => {
      const markdown = exportToMarkdown({
        author: 'John',
        period: 'Last 1 day',
        repos: mockRepos,
        totalCommits: 1,
        totalMinutes: 120,
      });

      expect(markdown).toMatch(/`abc1234`/);
      expect(markdown).toContain('> Estimated time:');
    });
  });

  describe('exportToJson', () => {
    it('should export standup to JSON', () => {
      const json = exportToJson({
        author: 'John Doe',
        period: 'Last 1 day',
        repos: mockRepos,
        totalCommits: 1,
        totalMinutes: 120,
        generatedAt: new Date().toISOString(),
      });

      const parsed = JSON.parse(json);
      expect(parsed.author).toBe('John Doe');
      expect(parsed.totalCommits).toBe(1);
      expect(parsed.totalMinutes).toBe(120);
      expect(parsed.repos.length).toBe(1);
      expect(parsed.repos[0].name).toBe('my-project');
    });

    it('should include formatted time estimates in JSON', () => {
      const json = exportToJson({
        author: 'John',
        period: 'Last 1 day',
        repos: mockRepos,
        totalCommits: 1,
        totalMinutes: 135,
        generatedAt: new Date().toISOString(),
      });

      const parsed = JSON.parse(json);
      expect(parsed.totalFormatted).toBe('~2h 15m');
    });
  });

  describe('exportToCsv', () => {
    it('should export standup to CSV', () => {
      const csv = exportToCsv({
        author: 'John Doe',
        repos: mockRepos,
        totalCommits: 1,
        totalMinutes: 120,
      });

      expect(csv).toContain('Repo,Commit Hash,Message,Author,Timestamp');
      expect(csv).toContain('my-project');
      expect(csv).toContain('abc1234');
      expect(csv).toContain('feat: add feature');
    });

    it('should escape CSV special characters', () => {
      const reposWithQuotes: Repository[] = [
        {
          name: 'test-project',
          path: '/path',
          estimatedMinutes: 60,
          commits: [
            {
              hash: 'abc1234',
              message: 'feat: add "quoted" feature',
              author: { name: 'John "Doe"', email: 'john@example.com' },
              timestamp: dayjs().toISOString(),
              branch: 'main',
            },
          ],
        },
      ];

      const csv = exportToCsv({
        author: 'John Doe',
        repos: reposWithQuotes,
        totalCommits: 1,
        totalMinutes: 60,
      });

      // Quotes should be escaped
      expect(csv).toContain('""');
    });
  });
});
