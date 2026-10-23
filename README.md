<h1 align="center">standup-scribe</h1>

<p align="center">
  <strong>Stop scrolling <code>git log</code> before standup.</strong><br>
  One command turns yesterday's commits across every repo into a clean, grouped summary, ready to paste into Slack.
</p>

<p align="center">
  <a href="https://github.com/neeelbhavsar/standup-scribe/actions/workflows/ci.yml"><img src="https://github.com/neeelbhavsar/standup-scribe/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/standup-scribe"><img src="https://img.shields.io/npm/v/standup-scribe.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/standup-scribe"><img src="https://img.shields.io/npm/dm/standup-scribe.svg" alt="npm downloads"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg" alt="Node.js 18+"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

<p align="center">
  <img src="docs/demo.gif" alt="standup-scribe turning Friday's commits across two repos into a grouped summary, then copying it as Markdown for Slack" width="800">
</p>

<details>
<summary>See the output as text</summary>

```console
$ npx standup-scribe --since yesterday --group --exclude ^wip

  standup-scribe — Fri Oct 23 to Mon Oct 26
  Author: Alex Rivera  |  Repos scanned: 2

 payments-api
  Features
    [09:12]  6378cfa  feat(checkout): add Apple Pay support
  Fixes
    [10:04]  ebbcaed  fix: retry webhook delivery on 502
  Tests
    [10:41]  80a8c2e  test: cover refund edge cases
  Estimated time: ~1h 59m  (3 commits)

 web-dashboard
  Features
    [14:05]  f2f0c15  feat: export invoices as CSV
  Fixes
    [14:52]  0d7bc1f  fix(ui): date picker off by one day
  Documentation
    [16:20]  352f8cd  docs: add dashboard setup guide
  Chores
    [15:37]  4da4c86  chore(deps): bump vite to 6.0
  Estimated time: ~2h 45m  (4 commits)

  Total: 7 commits across 2 repos
  Estimated total time: ~4h 44m
```

</details>

## Why standup-scribe?

- **It's Monday and you can't remember Friday.** `--since yesterday` means the previous *workday*, so Monday shows Friday.
- **Your work is spread over five repos.** It finds every git repo under your folders and reads them all at once.
- **`git log` is noisy.** Merges, `wip` commits and dependency bumps are one flag away from disappearing.
- **You need it in Slack, a doc, or a timesheet.** Copy it to the clipboard, or export it as Markdown, JSON or CSV with time estimates.
- **Zero setup.** No accounts, no tokens, nothing leaves your machine. It only reads your local git history.

## Features

✅ **Scan multiple repositories** — Recursively find all git repos in your workspace  
✅ **Filter by date, author & branch** — Last N days, since your last workday, this week, or any date range  
✅ **Monday-proof** — `--since yesterday` skips the weekend and shows Friday's work  
✅ **Grouped by type** — `--group` sorts commits into Features, Fixes, Chores, … using conventional commits  
✅ **Noise filters** — Hide merge commits and anything matching a pattern (`wip`, `chore(deps)`, …)  
✅ **Time estimation** — Automatically estimate hours spent based on commit timestamps  
✅ **Export formats** — Terminal output, markdown, JSON, CSV for docs and timesheets  
✅ **Copy to clipboard** — `--copy` puts your standup on the clipboard, ready to paste into Slack  
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

### Monday morning: everything since Friday, grouped, on your clipboard

```bash
standup-scribe --since yesterday --group --no-merges --copy
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
| `-d, --days <N>` | `1` (or saved config) | Number of days to look back |
| `-s, --since <when>` | — | Start date: `today`, `yesterday` (previous **workday**), or `YYYY-MM-DD` |
| `-u, --until <when>` | now | End date, inclusive: `today`, `yesterday`, or `YYYY-MM-DD` |
| `-w, --week` | — | This week so far (since Monday) |
| `--last-week` | — | Last week, Monday to Sunday |
| `-a, --author <name>` | (from git config) | Filter by author name |
| `--all-authors` | — | Show commits from all authors (team standup) |
| `--branch <name>` | — | Only commits reachable from this branch (local, or `origin/<name>`) |
| `--no-merges` | — | Hide merge commits |
| `-x, --exclude <pattern>` | — | Hide commits whose message matches this regex (case-insensitive, repeatable) |
| `-g, --group` | — | Group commits by type: Features, Fixes, Chores, … |
| `--dir <path>` | (current + home) | Scan directory (can be used multiple times) |
| `--depth <N>` | `3` (or saved config) | Max depth for directory scanning |
| `-o, --output <format>` | `terminal` | Output format: `terminal`, `markdown`, `json`, `csv` |
| `-f, --file <path>` | — | Save output to file |
| `-c, --copy` | — | Copy the output to the clipboard (terminal output is copied without colors) |
| `-q, --quiet` | — | Suppress spinners and colors (for CI/scripts) |

**Date options:** `--week` / `--last-week` take priority over `--since` / `--until`, which take priority over `--days`.

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
| `--exclude <pattern>` | Set default commit-message patterns to hide (repeatable; replaces the saved list) |
| `--clear-exclude` | Remove all saved exclude patterns |

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
          "type": "feat",
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

Use `standup-scribe` as a library in your Node.js scripts. It's an ES module: use `import`. On Node 22+, `require()` also works.

```typescript
import { getStandup, formatMinutes } from 'standup-scribe';

const result = await getStandup({
  dirs: ['~/projects', '~/work'],
  author: 'John Doe',
  since: 'yesterday',       // previous workday — Friday on a Monday
  branch: 'main',
  excludeMerges: true,
  exclude: ['^wip', 'chore\\(deps\\)'],
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
  period?: string;          // e.g. "Last 2 days", "Since Fri Oct 23", "This week"
  reposScanned?: number;    // repos found, including ones with no matching commits
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
  since?: string;           // "today", "yesterday" (previous workday), or YYYY-MM-DD
  until?: string;           // same formats, inclusive
  week?: boolean;           // since Monday
  lastWeek?: boolean;       // last Monday to Sunday
  depth?: number;
  branch?: string;
  allAuthors?: boolean;
  excludeMerges?: boolean;
  exclude?: string[];       // regex patterns matched against commit messages
  quiet?: boolean;
}
```

Also exported: `groupCommitsByType`, `getCommitType`, `resolveDateRange`, `copyToClipboard`, plus the formatters and exporters.

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
| macOS | `~/Library/Preferences/standup-scribe-nodejs/config.json` |
| Linux | `~/.config/standup-scribe-nodejs/config.json` |
| Windows | `%APPDATA%\standup-scribe-nodejs\Config\config.json` |

Run `standup-scribe config --show` to see the exact path on your machine.

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

### Q: It's Monday — how do I see Friday's work?

Use `--since yesterday`. "Yesterday" means the previous **workday**, so on a Monday (or over the weekend) it starts from Friday:

```bash
standup-scribe --since yesterday
```

### Q: How do I hide merge commits, WIP commits, or dependency bumps?

```bash
standup-scribe --no-merges --exclude "^wip" --exclude "chore\(deps\)"
```

Patterns are case-insensitive regular expressions matched against the commit message. Save the ones you always want hidden:

```bash
standup-scribe config --exclude "^wip" --exclude "chore\(deps\)"
standup-scribe config --clear-exclude   # remove them again
```

### Q: `--copy` says it couldn't copy to the clipboard

On macOS and Windows it uses the built-in `pbcopy` / `clip`. On Linux, install one of `wl-clipboard` (Wayland), `xclip`, or `xsel`.

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

Contributions are welcome, from typo fixes to new features! See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, the project layout, and the pull request checklist. Issues labelled [`good first issue`](https://github.com/neeelbhavsar/standup-scribe/labels/good%20first%20issue) are a great place to start.

If standup-scribe saves you time, a ⭐ on GitHub helps other developers find it.

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

### 1.1.0 (Unreleased)

- 📅 `--since` / `--until`, `--week`, and `--last-week` date ranges; `yesterday` means the previous workday, so Monday shows Friday
- 🗂️ `--group` organizes commits by conventional commit type (Features, Fixes, Chores, …); JSON and CSV now include each commit's `type`
- 🧹 `--no-merges` and `--exclude <pattern>` hide noise; exclude patterns can be saved with `config --exclude`
- 📋 `--copy` copies the report to the clipboard (Unicode-safe on Windows)
- 🐛 `--branch` now returns every commit on the branch, not just the latest one, and every commit gets a branch label
- 🐛 Repeating `--dir` now scans every directory instead of only the last one
- 🐛 Saved `days`, `depth`, and `author` from config are no longer overridden by CLI defaults
- 🐛 "No repositories found" is no longer shown when repos were found but had no commits in range
- 🐛 Stash entries no longer appear as commits
- 📦 The package is now ESM-only. The previous CommonJS build crashed on load because its dependencies are ESM-only
- 🤝 CI on Linux, macOS and Windows; automatic npm publishing on GitHub releases; contributing guide and issue templates

### 1.0.0 (2026-10-24)

- ✨ Initial release
- 🎯 Scan multiple repos with recursive directory search
- ⏱️ Automatic time estimation based on commit gaps
- 📊 Multiple export formats (terminal, markdown, JSON, CSV)
- 🔧 User preferences and config management
- 📦 Both CLI and programmatic API
- ✅ Comprehensive test suite
- 🚀 Production-ready with TypeScript strict mode
