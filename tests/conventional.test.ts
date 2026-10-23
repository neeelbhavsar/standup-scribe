import { describe, it, expect } from 'vitest';
import { getCommitType, groupCommitsByType } from '../src/conventional.js';
import type { Commit } from '../src/types.js';

const commit = (message: string): Commit => ({
  hash: 'abc1234',
  message,
  author: { name: 'John Doe', email: 'john@example.com' },
  timestamp: '2026-10-24T10:00:00.000Z',
  branch: 'main',
});

describe('conventional', () => {
  describe('getCommitType', () => {
    it('should detect conventional commit types', () => {
      expect(getCommitType('feat: add login')).toBe('feat');
      expect(getCommitType('fix(api): handle null')).toBe('fix');
      expect(getCommitType('feat(ui)!: redesign nav')).toBe('feat');
      expect(getCommitType('Chore: bump deps')).toBe('chore');
    });

    it('should return "other" for non-conventional messages', () => {
      expect(getCommitType('update readme')).toBe('other');
      expect(getCommitType('feat add login')).toBe('other');
      expect(getCommitType('wip: half done')).toBe('other');
      expect(getCommitType("Merge branch 'feature'")).toBe('other');
    });
  });

  describe('groupCommitsByType', () => {
    it('should group commits in display order and drop empty groups', () => {
      const groups = groupCommitsByType([
        commit('chore: bump deps'),
        commit('fix: crash on start'),
        commit('random message'),
        commit('feat: add login'),
        commit('feat(api): add routes'),
        commit('ci: cache node_modules'),
        commit('build: switch to tsup'),
      ]);

      expect(groups.map((g) => g.label)).toEqual([
        'Features',
        'Fixes',
        'Build & CI',
        'Chores',
        'Other',
      ]);
      expect(groups[0].commits.map((c) => c.message)).toEqual([
        'feat: add login',
        'feat(api): add routes',
      ]);
      expect(groups[2].commits).toHaveLength(2);
    });

    it('should return no groups for no commits', () => {
      expect(groupCommitsByType([])).toEqual([]);
    });
  });
});
