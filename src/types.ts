/**
 * All TypeScript types and interfaces for standup-scribe
 */

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
}

export interface StandupOptions {
  dirs?: string[];
  author?: string;
  days?: number;
  depth?: number;
  branch?: string;
  allAuthors?: boolean;
  quiet?: boolean;
  output?: 'terminal' | 'markdown' | 'json';
  file?: string;
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
}

export interface Config {
  author: string;
  dirs: string[];
  days: number;
  depth: number;
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
}

export interface ExportJsonOptions {
  author: string;
  period: string;
  repos: Repository[];
  totalCommits: number;
  totalMinutes: number;
  generatedAt: string;
}
