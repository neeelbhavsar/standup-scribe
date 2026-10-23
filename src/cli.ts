#!/usr/bin/env node

import { Command } from 'commander';
import ora from 'ora';
import { getStandup } from './index.js';
import { formatStandupOutput, formatError, formatInfo } from './formatter.js';
import { exportToMarkdown, exportToJson, exportToCsv, exportStandup } from './exporter.js';
import { configManager } from './config.js';
import type { StandupOptions } from './types.js';

const pkg = {
  version: '1.0.0',
  name: 'standup-scribe',
};

const program = new Command();

program
  .name(pkg.name)
  .description('Summarize git commits across repos for standups and timesheets')
  .version(pkg.version);

// Main standup command
program
  .command('standup', { isDefault: true })
  .option('-d, --days <number>', 'number of days to look back', '1')
  .option('-a, --author <name>', 'filter by author name')
  .option('--all-authors', 'show commits from all authors (team standup)')
  .option('--branch <name>', 'filter by branch name')
  .option('--dir <path>', 'scan directory for repos (can be used multiple times)', [])
  .option('--depth <number>', 'max depth for directory scan', '3')
  .option('-o, --output <format>', 'output format (terminal, markdown, json, csv)', 'terminal')
  .option('-f, --file <path>', 'save output to file')
  .option('-q, --quiet', 'suppress spinners and colors')
  .action(handleStandupCommand);

// Config command
program
  .command('config')
  .option('--show', 'display current configuration')
  .option('--reset', 'reset to defaults')
  .option('--author <name>', 'set default author')
  .option('--dir <path>', 'set default scan directories (can be used multiple times)', [])
  .option('--days <number>', 'set default days to look back')
  .option('--depth <number>', 'set default scan depth')
  .action(handleConfigCommand);

// Parse arguments
program.parse(process.argv);

/**
 * Handle the standup command
 */
async function handleStandupCommand(options: any) {
  const spinner = ora();

  try {
    if (!options.quiet) {
      spinner.start('Scanning repositories...');
    }

    // Build options object
    const standupOptions: StandupOptions = {
      days: parseInt(options.days, 10),
      author: options.author,
      branch: options.branch,
      allAuthors: options.allAuthors,
      depth: parseInt(options.depth, 10),
      output: options.output,
      file: options.file,
      quiet: options.quiet,
    };

    // Handle multiple --dir flags
    if (options.dir && (Array.isArray(options.dir) ? options.dir.length > 0 : options.dir)) {
      // Ensure it's always an array (single value might come as string)
      standupOptions.dirs = Array.isArray(options.dir) ? options.dir : [options.dir];
    }

    // Fetch standup data
    const result = await getStandup(standupOptions);

    if (!options.quiet) {
      spinner.succeed('Repositories scanned');
    }

    // Handle no results
    if (result.repos.length === 0) {
      if (!options.quiet) {
        console.log('');
        console.log(
          formatInfo(
            'No repositories found in the specified directories.',
            options.quiet,
          ),
        );
        console.log(
          formatInfo(
            'Tip: Use --dir to specify directories to scan.',
            options.quiet,
          ),
        );
        console.log('');
      }
      process.exit(0);
    }

    // Handle no commits in range
    if (result.totalCommits === 0) {
      if (!options.quiet) {
        console.log('');
        console.log(
          formatInfo(
            `No commits found for author "${result.author}" in the last ${options.days} day${options.days !== '1' ? 's' : ''}.`,
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
      const period = `Last ${options.days} day${options.days !== '1' ? 's' : ''}`;
      output = exportToMarkdown({
        author: result.author,
        period,
        repos: result.repos,
        totalCommits: result.totalCommits,
        totalMinutes: result.totalMinutes,
      });
    } else if (options.output === 'json') {
      output = exportToJson({
        author: result.author,
        period: `Last ${options.days} day${options.days !== '1' ? 's' : ''}`,
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
      output = formatStandupOutput(result, options.quiet);
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
  } catch (error) {
    spinner.fail();
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
    if (options.days) updates.days = parseInt(options.days, 10);
    if (options.depth) updates.depth = parseInt(options.depth, 10);
    if (options.dir && options.dir.length > 0) updates.dirs = options.dir;

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
