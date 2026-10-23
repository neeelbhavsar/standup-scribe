import type { Commit, CommitGroup } from './types.js';

const CONVENTIONAL_PATTERN = /^(\w+)(?:\([^)]*\))?(!)?:\s/;

/**
 * Display order and labels for conventional commit types
 * Anything not listed here is grouped under "Other"
 */
const TYPE_LABELS: Array<[string, string]> = [
  ['feat', 'Features'],
  ['fix', 'Fixes'],
  ['perf', 'Performance'],
  ['refactor', 'Refactoring'],
  ['docs', 'Documentation'],
  ['test', 'Tests'],
  ['build', 'Build & CI'],
  ['ci', 'Build & CI'],
  ['style', 'Style'],
  ['chore', 'Chores'],
  ['revert', 'Reverts'],
];

const KNOWN_TYPES = new Map(TYPE_LABELS);

/**
 * Get the conventional commit type of a message
 * Example: "feat(api)!: add routes" => "feat"; "update readme" => "other"
 */
export function getCommitType(message: string): string {
  const match = message.match(CONVENTIONAL_PATTERN);
  if (!match) {
    return 'other';
  }

  const type = match[1].toLowerCase();
  return KNOWN_TYPES.has(type) ? type : 'other';
}

/**
 * Group commits by conventional commit type, in display order
 * Empty groups are left out
 */
export function groupCommitsByType(commits: Commit[]): CommitGroup[] {
  const groups = new Map<string, CommitGroup>();

  for (const [, label] of TYPE_LABELS) {
    if (!groups.has(label)) {
      groups.set(label, { label, commits: [] });
    }
  }
  groups.set('Other', { label: 'Other', commits: [] });

  for (const commit of commits) {
    const label = KNOWN_TYPES.get(getCommitType(commit.message)) || 'Other';
    groups.get(label)!.commits.push(commit);
  }

  return [...groups.values()].filter((group) => group.commits.length > 0);
}
