import os from 'os';
import path from 'path';
import Conf from 'conf';
import type { Config, ConfigOptions } from './types.js';

/**
 * Configuration manager for standup-scribe preferences
 * Uses the conf package to persist settings across runs
 */
class ConfigManager {
  private conf: Conf<Config>;

  constructor() {
    this.conf = new Conf<Config>({
      projectName: 'standup-scribe',
      schema: {
        author: {
          type: 'string',
          default: '',
        },
        dirs: {
          type: 'array',
          items: { type: 'string' },
          default: [process.cwd(), os.homedir()],
        },
        days: {
          type: 'number',
          default: 1,
          minimum: 1,
        },
        depth: {
          type: 'number',
          default: 3,
          minimum: 1,
        },
      },
    });
  }

  /**
   * Get the current configuration
   */
  getConfig(): Config {
    return {
      author: this.conf.get('author') || '',
      dirs: this.conf.get('dirs') || [process.cwd(), os.homedir()],
      days: this.conf.get('days') || 1,
      depth: this.conf.get('depth') || 3,
    };
  }

  /**
   * Update configuration with provided options
   */
  setConfig(options: ConfigOptions): void {
    if (options.author !== undefined) {
      this.conf.set('author', options.author);
    }
    if (options.dirs !== undefined) {
      this.conf.set('dirs', options.dirs);
    }
    if (options.days !== undefined) {
      this.conf.set('days', options.days);
    }
    if (options.depth !== undefined) {
      this.conf.set('depth', options.depth);
    }
  }

  /**
   * Reset configuration to defaults
   */
  reset(): void {
    this.conf.clear();
  }

  /**
   * Get the path to the config file
   */
  getConfigPath(): string {
    return this.conf.path;
  }

  /**
   * Expand ~ and $HOME in paths
   */
  expandPath(dirPath: string): string {
    if (dirPath.startsWith('~')) {
      return path.join(os.homedir(), dirPath.slice(1));
    }
    if (dirPath.startsWith('$HOME')) {
      return path.join(os.homedir(), dirPath.slice(5));
    }
    return dirPath;
  }
}

export const configManager = new ConfigManager();
