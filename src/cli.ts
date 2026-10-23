#!/usr/bin/env node

import { Command } from 'commander';
import ora from 'ora';
import { getStandup } from './index.js';
import { formatStandupOutput, formatError, formatInfo } from './formatter.js';
import {
  exportToMarkdown,
  exportToJson,
  exportToCsv,
  exportStandup,
  copyToClipboard,
} from './exporter.js';
import { configManager } from './config.js';
import { compileExcludePatterns } from './commits.js';
import type { StandupOptions } from './types.js';

const pkg = {
  version: '1.1.0',
  name: 'standup-scribe',
};

const OUTPUT_FORMATS = ['terminal', 'markdown', 'json', 'csv'];

/**
 * Collect repeated options (e.g. --dir a --dir b) into an array
 */
function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}

/**
 * Parse a positive integer option, failing with a readable message
 */
function parsePositiveInt(value: string, flag: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${flag} must be a whole number of 1 or more (got "${value}").`);
  }
  return parsed;
}

const program = new Command();

program
  .name(pkg.name)
  .description('Summarize git commits across repos for standups and timesheets')
  .version(pkg.version);

// Main standup command
program
  .command('standup', { isDefault: true })
  .option('-d, --days <number>', 'number of days to look back (default: 1, or saved config)')
  .option('-s, --since <when>', 'start date: "today", "yesterday" (previous workday), or YYYY-MM-DD')
  .option('-u, --until <when>', 'end date, inclusive: "today", "yesterday", or YYYY-MM-DD')
  .option('-w, --week', 'this week so far (since Monday)')
  .option('--last-week', 'last week (Monday to Sunday)')
  .option('-a, --author <name>', 'filter by author name')
  .option('--all-authors', 'show commits from all authors (team standup)')
  .option('--branch <name>', 'only show commits reachable from this branch')
  .option('--no-merges', 'hide merge commits')
  .option('-x, --exclude <pattern>', 'hide commits whose message matches this regex (repeatable)', collect, [])
  .option('-g, --group', 'group commits by type (Features, Fixes, Chores, ...)')
  .option('--dir <path>', 'scan directory for repos (repeatable)', collect, [])
  .option('--depth <number>', 'max depth for directory scan (default: 3, or saved config)')
  .option('-o, --output <format>', 'output format (terminal, markdown, json, csv)', 'terminal')
  .option('-f, --file <path>', 'save output to file')
  .option('-c, --copy', 'copy the output to the clipboard')
  .option('-q, --quiet', 'suppress spinners and colors')
  .action(handleStandupCommand);

// Config command
program
  .command('config')
  .option('--show', 'display current configuration')
  .option('--reset', 'reset to defaults')
  .option('--author <name>', 'set default author')
  .option('--dir <path>', 'set default scan directories (repeatable)', collect, [])
  .option('--days <number>', 'set default days to look back')
  .option('--depth <number>', 'set default scan depth')
  .option('--exclude <pattern>', 'set default commit message patterns to hide (repeatable)', collect, [])
  .option('--clear-exclude', 'remove all saved exclude patterns')
  .action(handleConfigCommand);

// Parse arguments
program.parse(process.argv);

/**
 * Handle the standup command
 */
async function handleStandupCommand(options: any) {
  const spinner = ora();

  try {
    if (!OUTPUT_FORMATS.includes(options.output)) {
      throw new Error(
        `Unknown output format "${options.output}". Use one of: ${OUTPUT_FORMATS.join(', ')}.`,
      );
    }

    // Build options object
    const standupOptions: StandupOptions = {
      days: options.days !== undefined ? parsePositiveInt(options.days, '--days') : undefined,
      since: options.since,
      until: options.until,
      week: options.week,
      lastWeek: options.lastWeek,
      author: options.author,
      branch: options.branch,
      allAuthors: options.allAuthors,
      excludeMerges: options.merges === false,
      exclude: options.exclude,
      depth: options.depth !== undefined ? parsePositiveInt(options.depth, '--depth') : undefined,
      output: options.output,
      file: options.file,
      quiet: options.quiet,
    };

    if (options.dir.length > 0) {
      standupOptions.dirs = options.dir;
    }

    if (!options.quiet) {
      spinner.start('Scanning repositories...');
    }

    // Fetch standup data
    const result = await getStandup(standupOptions);
    const period = result.period || '';

    if (!options.quiet) {
      spinner.succeed('Repositories scanned');
    }

    // Handle no repositories found
    if (result.reposScanned === 0) {
      if (!options.quiet) {
        console.log('');
        console.log(formatInfo('No repositories found in the specified directories.', options.quiet));
        console.log(formatInfo('Tip: Use --dir to specify directories to scan.', options.quiet));
        console.log('');
      }
      process.exit(0);
    }

    // Handle no commits in range
    if (result.totalCommits === 0) {
      if (!options.quiet) {
        const who = result.allAuthors ? 'any author' : `author "${result.author}"`;
        console.log('');
        console.log(
          formatInfo(
            `No commits found for ${who} (${period.toLowerCase()}) across ${result.reposScanned} repo${result.reposScanned !== 1 ? 's' : ''}.`,
            options.quiet,
          ),
        );
        console.log('');
      }
      process.exit(0);
    }

    // Format output based on requested format
    let output: string;

    if (options.output === 'markdown') {
      output = exportToMarkdown({
        author: result.author,
        period,
        repos: result.repos,
        totalCommits: result.totalCommits,
        totalMinutes: result.totalMinutes,
        groupByType: options.group,
      });
    } else if (options.output === 'json') {
      output = exportToJson({
        author: result.author,
        period,
        repos: result.repos,
        totalCommits: result.totalCommits,
        totalMinutes: result.totalMinutes,
        generatedAt: new Date().toISOString(),
      });
    } else if (options.output === 'csv') {
      output = exportToCsv({
        author: result.author,
        repos: result.repos,
        totalCommits: result.totalCommits,
        totalMinutes: result.totalMinutes,
      });
    } else {
      // Terminal format (default)
      output = formatStandupOutput(result, options.quiet, { groupByType: options.group });
    }

    // Save to file if requested
    if (options.file) {
      if (!options.quiet) {
        spinner.start('Saving to file...');
      }

      const exportResult = await exportStandup(options.output, options.file, output);

      if (exportResult.success) {
        if (!options.quiet) {
          spinner.succeed(`Saved to ${exportResult.path}`);
        }
      } else {
        if (!options.quiet) {
          spinner.fail(exportResult.error);
        }
        process.exit(1);
      }
    } else {
      // Print to stdout
      console.log(output);
    }

    // Copy to clipboard if requested (terminal output is copied without colors)
    if (options.copy) {
      const text =
        options.output === 'terminal'
          ? formatStandupOutput(result, true, { groupByType: options.group }).trim()
          : output;
      const copied = await copyToClipboard(text);

      if (copied) {
        if (!options.quiet) {
          spinner.succeed('Copied to clipboard');
        }
      } else {
        const hint = process.platform === 'linux' ? ' Install wl-clipboard, xclip, or xsel.' : '';
        console.error(formatError(`Could not copy to clipboard.${hint}`, options.quiet));
      }
    }
  } catch (error) {
    spinner.stop();
    console.error(formatError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      options.quiet,
    ));
    process.exit(1);
  }
}

/**
 * Handle the config command
 */
async function handleConfigCommand(options: any) {
  try {
    // Show current config
    if (options.show) {
      const config = configManager.getConfig();
      console.log('Current configuration:');
      console.log(`  Author: ${config.author || '(not set)'}`);
      console.log(`  Directories: ${config.dirs.join(', ')}`);
      console.log(`  Default days: ${config.days}`);
      console.log(`  Scan depth: ${config.depth}`);
      console.log(`  Exclude patterns: ${config.exclude.length ? config.exclude.join(', ') : '(none)'}`);
      console.log(`  Config file: ${configManager.getConfigPath()}`);
      return;
    }

    // Reset config
    if (options.reset) {
      configManager.reset();
      console.log('Configuration reset to defaults');
      return;
    }

    // Update config
    const updates: any = {};
    if (options.author) updates.author = options.author;
    if (options.days) updates.days = parsePositiveInt(options.days, '--days');
    if (options.depth) updates.depth = parsePositiveInt(options.depth, '--depth');
    if (options.dir.length > 0) updates.dirs = options.dir;
    if (options.clearExclude) updates.exclude = [];
    if (options.exclude.length > 0) {
      compileExcludePatterns(options.exclude);
      updates.exclude = options.exclude;
    }

    if (Object.keys(updates).length === 0) {
      console.log('No configuration options specified. Use --show to view current config.');
      return;
    }

    configManager.setConfig(updates);
    console.log('Configuration updated:');
    if (updates.author) console.log(`  Author: ${updates.author}`);
    if (updates.dirs) console.log(`  Directories: ${updates.dirs.join(', ')}`);
    if (updates.days) console.log(`  Default days: ${updates.days}`);
    if (updates.depth) console.log(`  Scan depth: ${updates.depth}`);
    if (updates.exclude) {
      console.log(`  Exclude patterns: ${updates.exclude.length ? updates.exclude.join(', ') : '(none)'}`);
    }
  } catch (error) {
    console.error(
      formatError(
        error instanceof Error ? error.message : 'Failed to update configuration',
        false,
      ),
    );
    process.exit(1);
  }
}

// Handle signals
process.on('SIGINT', () => {
  console.log('');
  process.exit(0);
});
