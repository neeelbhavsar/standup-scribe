import { describe, it, expect } from 'vitest';
import { estimateTimeSpent, formatMinutes, parseTimeString } from '../src/estimator.js';
import type { Commit } from '../src/types.js';
import dayjs from 'dayjs';

describe('estimator', () => {
  describe('estimateTimeSpent', () => {
    it('should return 0 for empty commits', () => {
      expect(estimateTimeSpent([])).toBe(0);
    });

    it('should return 30 minutes for single commit', () => {
      const commits: Commit[] = [
        {
          hash: 'abc1234',
          message: 'feat: test',
          author: { name: 'John', email: 'john@example.com' },
          timestamp: dayjs().toISOString(),
          branch: 'main',
        },
      ];

      expect(estimateTimeSpent(commits)).toBe(30);
    });

    it('should estimate time for multiple commits with small gaps', () => {
      const baseTime = dayjs('2024-04-13T10:00:00Z');
      const commits: Commit[] = [
        {
          hash: 'abc1234',
          message: 'feat: test 1',
          author: { name: 'John', email: 'john@example.com' },
          timestamp: baseTime.toISOString(),
          branch: 'main',
        },
        {
          hash: 'def5678',
          message: 'feat: test 2',
          author: { name: 'John', email: 'john@example.com' },
          timestamp: baseTime.add(30, 'minute').toISOString(),
          branch: 'main',
        },
      ];

      const minutes = estimateTimeSpent(commits);
      // 30 (ramp-up) + 30 (gap) = 60
      expect(minutes).toBe(60);
    });

    it('should add 30 min break time for gaps >= 2 hours', () => {
      const baseTime = dayjs('2024-04-13T10:00:00Z');
      const commits: Commit[] = [
        {
          hash: 'abc1234',
          message: 'feat: test 1',
          author: { name: 'John', email: 'john@example.com' },
          timestamp: baseTime.toISOString(),
          branch: 'main',
        },
        {
          hash: 'def5678',
          message: 'feat: test 2',
          author: { name: 'John', email: 'john@example.com' },
          timestamp: baseTime.add(3, 'hour').toISOString(),
          branch: 'main',
        },
      ];

      const minutes = estimateTimeSpent(commits);
      // 30 (ramp-up) + 30 (break) = 60
      expect(minutes).toBe(60);
    });

    it('should add ramp-up time for each new day', () => {
      const baseTime = dayjs('2024-04-13T10:00:00Z');
      const commits: Commit[] = [
        {
          hash: 'abc1234',
          message: 'feat: test 1',
          author: { name: 'John', email: 'john@example.com' },
          timestamp: baseTime.toISOString(),
          branch: 'main',
        },
        {
          hash: 'def5678',
          message: 'feat: test 2',
          author: { name: 'John', email: 'john@example.com' },
          timestamp: baseTime.add(1, 'day').toISOString(),
          branch: 'main',
        },
      ];

      const minutes = estimateTimeSpent(commits);
      // 30 (day 1 ramp-up) + 30 (break/gap) + 30 (day 2 ramp-up) = 90
      expect(minutes).toBe(90);
    });
  });

  describe('formatMinutes', () => {
    it('should format 0 minutes', () => {
      expect(formatMinutes(0)).toBe('~0m');
    });

    it('should format minutes only', () => {
      expect(formatMinutes(45)).toBe('~45m');
    });

    it('should format hours only', () => {
      expect(formatMinutes(120)).toBe('~2h');
    });

    it('should format hours and minutes', () => {
      expect(formatMinutes(135)).toBe('~2h 15m');
    });

    it('should format large durations', () => {
      expect(formatMinutes(485)).toBe('~8h 5m');
    });
  });

  describe('parseTimeString', () => {
    it('should parse minutes only', () => {
      expect(parseTimeString('45m')).toBe(45);
    });

    it('should parse hours only', () => {
      expect(parseTimeString('2h')).toBe(120);
    });

    it('should parse hours and minutes', () => {
      expect(parseTimeString('2h 15m')).toBe(135);
    });

    it('should handle tilde prefix', () => {
      expect(parseTimeString('~2h 15m')).toBe(135);
    });
  });
});
