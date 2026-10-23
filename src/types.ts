/**
 * All TypeScript types and interfaces for standup-scribe
 */

import type { Dayjs } from 'dayjs';

export interface Commit {
  hash: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  timestamp: string; // ISO 8601
  branch: string;
  time?: string; // HH:MM format (calculated during formatting)
}

export interface Repository {
  name: string;
  path: string;
  commits: Commit[];
  estimatedMinutes: number;
}

export interface StandupResult {
  repos: Repository[];
  totalCommits: number;
  totalMinutes: number;
  author: string;
  startDate: string;
  endDate: string;
  allAuthors: boolean;
  period?: string; // Human-readable range, e.g. "Last 2 days" or "Since Fri Oct 23"
  reposScanned?: number; // Repos found, including those with no matching commits
}

export interface StandupOptions {
  dirs?: string[];
  author?: string;
  days?: number;
  since?: string; // "today", "yesterday" (previous workday), or YYYY-MM-DD
  until?: string; // "today", "yesterday", or YYYY-MM-DD (inclusive)
  week?: boolean; // Monday of this week until now
  lastWeek?: boolean; // Monday to Sunday of last week
  depth?: number;
  branch?: string;
  allAuthors?: boolean;
  excludeMerges?: boolean;
  exclude?: string[]; // Regex patterns; matching commit messages are hidden
  quiet?: boolean;
  output?: 'terminal' | 'markdown' | 'json' | 'csv';
  file?: string;
}

export interface DateRange {
  start: Dayjs;
  end: Dayjs;
  label: string;
}

export interface CommitGroup {
  label: string;
  commits: Commit[];
}

export interface ScannerOptions {
  dirs: string[];
  depth: number;
}

export interface ScanResult {
  name: string;
  path: string;
}

export interface ConfigOptions {
  author?: string;
  dirs?: string[];
  days?: number;
  depth?: number;
  exclude?: string[];
}

export interface Config {
  author: string;
  dirs: string[];
  days: number;
  depth: number;
  exclude: string[];
}

export interface TimeBreakdown {
  repoPath: string;
  minutes: number;
}

export interface EstimateResult {
  totalMinutes: number;
  breakdown: TimeBreakdown[];
}

export interface ExportMarkdownOptions {
  author: string;
  period: string;
  repos: Repository[];
  totalCommits: number;
  totalMinutes: number;
  groupByType?: boolean;
}

export interface ExportJsonOptions {
  author: string;
  period: string;
  repos: Repository[];
  totalCommits: number;
  totalMinutes: number;
  generatedAt: string;
}
