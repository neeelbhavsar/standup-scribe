# standup-scribe

> Summarize your git commits across all local repositories for daily standups, weekly reviews, and accurate timesheets.

[![npm version](https://img.shields.io/npm/v/standup-scribe.svg)](https://www.npmjs.com/package/standup-scribe)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![Downloads](https://img.shields.io/npm/dm/standup-scribe.svg)](https://www.npmjs.com/package/standup-scribe)

## Features

✅ **Scan multiple repositories** — Recursively find all git repos in your workspace  
✅ **Filter by date & author** — Show commits from the last N days, by author or team  
✅ **Time estimation** — Automatically estimate hours spent based on commit timestamps  
✅ **Export formats** — Terminal output, markdown, JSON, CSV for docs and timesheets  
✅ **Save preferences** — Remember your author, directories, and defaults  
✅ **CI-safe** — Quiet mode, no spinners, machine-readable JSON output  
✅ **Cross-platform** — Works on macOS, Linux, Windows

## Installation

```bash
npm install -g standup-scribe
```

Or use with `npx` (no installation needed):

```bash
npx standup-scribe
```

## Quick Start

### Show your commits from the last 2 days

```bash
standup-scribe --days 2
```

### Show commits from the whole team (all authors)

```bash
standup-scribe --all-authors --days 7
```

### Save your preferences

```bash
standup-scribe config --author "John Doe" --dir ~/projects --dir ~/work
```

### Export to markdown for your standup notes

```bash
standup-scribe --output markdown --file standup.md
```

## CLI Usage

### Main Command

```bash
standup-scribe [options]
```

| Option | Default | Description |
|--------|---------|-------------|
| `--days <N>` | `1` | Number of days to look back |
| `-a, --author <name>` | (from git config) | Filter by author name |
| `--all-authors` | — | Show commits from all authors (team standup) |
| `--branch <name>` | — | Filter by branch name |
| `--dir <path>` | (current + home) | Scan directory (can be used multiple times) |
| `--depth <N>` | `3` | Max depth for directory scanning |
| `-o, --output <format>` | `terminal` | Output format: `terminal`, `markdown`, `json`, `csv` |
| `-f, --file <path>` | — | Save output to file |
| `-q, --quiet` | — | Suppress spinners and colors (for CI/scripts) |

### Config Command

```bash
standup-scribe config [options]
```

| Option | Description |
|--------|-------------|
| `--show` | Display current configuration |
| `--reset` | Reset to defaults |
| `--author <name>` | Set default author |
| `--dir <path>` | Set default scan directories |
| `--days <N>` | Set default days to look back |
| `--depth <N>` | Set default scan depth |

> 📋 Looking for copy-paste recipes (daily/weekly reports, scheduling, sharing to Slack/email)? See [STANDUP-COMMANDS.md](./STANDUP-COMMANDS.md).

## Usage Examples

### Personal standup (last 2 days, your commits)

```bash
$ standup-scribe --days 2
────────────────────────────────────────────
  standup-scribe — Mon Apr 12 to Tue Apr 13
  Author: John Doe  |  Repos scanned: 6
────────────────────────────────────────────

 fake-api-server  ~/projects/fake-api-server
  [09:14]  abc1234  feat: add CRUD route generator
  [10:32]  def5678  fix: handle missing schema fields
  [11:05]  ghi9012  chore: add vitest config
  Estimated time: ~2h 15m  (3 commits)

 my-portfolio  ~/projects/my-portfolio
  [14:20]  jkl3456  feat: dark mode toggle
  [16:45]  mno7890  fix: mobile nav overflow
  Estimated time: ~1h 30m  (2 commits)

────────────────────────────────────────────
  Total: 5 commits across 2 repos
  Estimated total time: ~3h 45m
────────────────────────────────────────────
```

### Team standup (all authors, last week)

```bash
standup-scribe --all-authors --days 7 --output markdown --file standup.md
```

This creates a file like:

```markdown
## Standup — April 13, 2024
**Author:** All  
**Period:** Last 7 days

### fake-api-server
- `abc1234` feat: add CRUD route generator *(09:14)*
- `def5678` fix: handle missing schema fields *(10:32)*
> Estimated time: ~2h 15m

### my-portfolio
- `jkl3456` feat: dark mode toggle *(14:20)*
> Estimated time: ~1h 30m

---
**Total:** 3 commits · ~3h 45m
```

### Save preferences and use defaults

```bash
# First time: save your details
standup-scribe config --author "Jane Smith" --dir ~/projects --dir ~/work --days 1

# Later: just run the command
standup-scribe
# Uses your saved author, directories, and 1-day lookback
```

### JSON export for scripts

```bash
standup-scribe --output json --file report.json
```

Output:

```json
{
  "generatedAt": "2024-04-13T18:30:00.000Z",
  "author": "John Doe",
  "period": "Last 1 day",
  "totalCommits": 5,
  "totalMinutes": 225,
  "totalFormatted": "~3h 45m",
  "repos": [
    {
      "name": "fake-api-server",
      "path": "/home/john/projects/fake-api-server",
      "commits": [
        {
          "hash": "abc1234",
          "message": "feat: add CRUD route generator",
          "author": {
            "name": "John Doe",
            "email": "john@example.com"
          },
          "timestamp": "2024-04-13T09:14:00.000Z",
          "branch": "main"
        }
      ],
      "estimatedMinutes": 135,
      "estimatedFormatted": "~2h 15m"
    }
  ]
}
```

### Quiet mode for CI/automation

```bash
standup-scribe --quiet --output json --file report.json
# No spinners, no colors, just the output
```

## Programmatic API

Use `standup-scribe` as a library in your Node.js scripts:

```typescript
import { getStandup, formatMinutes } from 'standup-scribe';

const result = await getStandup({
  dirs: ['~/projects', '~/work'],
  author: 'John Doe',
  days: 2,
  branch: 'main',
});

console.log(`Found ${result.totalCommits} commits`);
console.log(`Estimated time: ${formatMinutes(result.totalMinutes)}`);

result.repos.forEach(repo => {
  console.log(`${repo.name}: ${repo.commits.length} commits`);
});
```

### API Types

```typescript
interface StandupResult {
  repos: Repository[];
  totalCommits: number;
  totalMinutes: number;
  author: string;
  startDate: string;        // ISO 8601
  endDate: string;          // ISO 8601
  allAuthors: boolean;
}

interface Repository {
  name: string;
  path: string;
  commits: Commit[];
  estimatedMinutes: number;
}

interface Commit {
  hash: string;             // 7-char short hash
  message: string;
  author: { name: string; email: string };
  timestamp: string;        // ISO 8601
  branch: string;
}

interface StandupOptions {
  dirs?: string[];
  author?: string;
  days?: number;
  depth?: number;
  branch?: string;
  allAuthors?: boolean;
  quiet?: boolean;
}
```

## How Time Estimation Works

The time estimator uses commit timestamps to calculate work duration:

1. **Sort commits** by timestamp (ascending)
2. **First commit of the day** → Add 30 min ramp-up time
3. **Gap between commits:**
   - `< 2 hours` → Count as active work time
   - `≥ 2 hours` → Assume a break, count as 30 min
4. **Total** = sum of all active time + ramp-up + breaks

**Example:**
- 10:00 AM: Commit 1 → +30 min (ramp-up)
- 10:45 AM: Commit 2 → +45 min (gap)
- 1:30 PM: Commit 3 → +30 min (break, gap > 2 hours)
- **Total: ~2h 15m**

## Config File Location

Your preferences are saved in:

| OS | Path |
|----|------|
| macOS / Linux | `~/.config/standup-scribe/config.json` |
| Windows | `%APPDATA%\standup-scribe\config.json` |

View or reset it:

```bash
standup-scribe config --show
standup-scribe config --reset
```

## FAQ

### Q: Why are some repos missing?

Check the scan depth and directories:

```bash
# Increase scan depth (default: 3)
standup-scribe --depth 5

# Scan specific directory
standup-scribe --dir ~/myrepos

# Check your saved config
standup-scribe config --show
```

### Q: How do I include my home directory?

By default, the scanner looks in `cwd` (current directory) and `$HOME`. To scan explicitly:

```bash
standup-scribe --dir ~ --days 7
```

Or save it to config:

```bash
standup-scribe config --dir ~
```

### Q: Why does the estimate seem wrong?

The estimator assumes:
- You work continuously between commits (< 2 hours apart)
- Gaps ≥ 2 hours are breaks
- Each day starts with 30 min ramp-up

For more accurate estimates, commit more frequently (even work-in-progress commits).

### Q: How do I filter by team member?

Use `--all-authors` to show everyone, or filter by name:

```bash
standup-scribe --author "Jane Smith" --days 7
```

### Q: Can I use this in CI/automation?

Yes! Use `--quiet` and `--output json`:

```bash
standup-scribe --quiet --all-authors --days 7 --output json > standup.json
```

Perfect for automated reports, Slack bots, or timesheet systems.

### Q: What if git is not installed?

You'll get a clear error:

```
Error: Git is not installed or not available in your PATH. 
Please install Git to use standup-scribe.
```

### Q: How do I scan multiple separate directories?

Use multiple `--dir` flags:

```bash
standup-scribe --dir ~/projects --dir ~/work --dir ~/personal
```

Or save them to config:

```bash
standup-scribe config --dir ~/projects --dir ~/work --dir ~/personal
standup-scribe
```

## Contributing

Contributions welcome! Please:

1. Fork [neeelbhavsar/standup-scribe](https://github.com/neeelbhavsar/standup-scribe)
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Add tests for your changes
4. Run `npm run build && npm test`
5. Commit with a clear message
6. Open a pull request

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev

# Run linter
npm run lint
```

## License

MIT © 2026 [Neel Bhavsar](https://github.com/neeelbhavsar) — see [LICENSE](./LICENSE)

## Changelog

### 1.0.0 (Unreleased)

- ✨ Initial release
- 🎯 Scan multiple repos with recursive directory search
- ⏱️ Automatic time estimation based on commit gaps
- 📊 Multiple export formats (terminal, markdown, JSON, CSV)
- 🔧 User preferences and config management
- 📦 Both CLI and programmatic API
- ✅ Comprehensive test suite
- 🚀 Production-ready with TypeScript strict mode
