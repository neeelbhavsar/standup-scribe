# 🎯 standup-scribe — Command Reference for Daily Reports

## Quick Start (Copy & Paste)

### Option 1: Show in Terminal (Best for Daily Meetings)
```bash
standup-scribe --dir ~/projects/my-app --all-authors --days 1
```

### Option 2: Save as Markdown (Best for Email/Slack)
```bash
standup-scribe --dir ~/projects/my-app --all-authors --days 1 \
  --output markdown --file ~/standup-$(date +%Y-%m-%d).md
```

### Option 3: Schedule It
Run it automatically every morning — see [Automated Daily Reports](#automated-daily-reports).

---

## Full Command Options

### Basic Syntax
```bash
standup-scribe [options]
```

### Common Options

| Option | Value | Description |
|--------|-------|-------------|
| `--dir <path>` | `~/projects/my-app` | Project directory to scan |
| `--days <N>` | `1`, `7`, `30` | Days to look back (default: 1) |
| `--all-authors` | flag | Show commits from all team members |
| `--author <name>` | `"Your Name"` | Filter by specific author |
| `--output <format>` | `terminal`, `markdown`, `json`, `csv` | Output format |
| `--file <path>` | `~/report.md` | Save to file |
| `--quiet` | flag | No spinners/colors (for scripts) |
| `--branch <name>` | `main`, `develop` | Filter by branch |

---

## Common Use Cases

### 1. **Daily Standup (Best for meetings)**
```bash
standup-scribe --dir ~/projects/my-app --all-authors --days 1
```
- Shows colorful terminal output with spinners
- Perfect for reading aloud in meetings
- Real-time activity summary

---

### 2. **Email Report (Best for stakeholders)**
```bash
standup-scribe --dir ~/projects/my-app --all-authors --days 1 \
  --output markdown --file ~/standup-$(date +%Y-%m-%d).md
```
Creates file: `standup-2026-04-14.md`

**Share:** Copy content to email body or attachment

---

### 3. **Weekly Summary (For Project Manager)**
```bash
standup-scribe --dir ~/projects/my-app --all-authors --days 7 \
  --output markdown --file ~/weekly-standup.md
```

---

### 4. **Team Member Report (Individual Performance)**
```bash
standup-scribe --dir ~/projects/my-app --author "Jane Smith" --days 7
```

---

### 5. **CI/Automation (For integrations)**
```bash
standup-scribe --dir ~/projects/my-app --all-authors --days 1 \
  --output json --quiet > report.json
```

---

## Report Formats

### Terminal Output (Default)
```
✨ Shows:
  • Colorized commit list
  • Time estimates per repo
  • Author names
  • Commit messages with times
  • Total statistics
```

### Markdown Output
```
✨ Best for:
  • Email distribution
  • Slack posting
  • Documentation
  • README updates
  
📄 File: `standup-2026-04-14.md`
```

### JSON Output
```
✨ Best for:
  • API integrations
  • Automated processing
  • Data analysis
  • Dashboard updates
  
📊 File: `standup-2026-04-14.json`
```

### CSV Output
```
✨ Best for:
  • Excel/Google Sheets
  • Spreadsheet analysis
  • Timesheet imports
  
📈 File: `standup-2026-04-14.csv`
```

---

## Automated Daily Reports

### Option 1: Manual Command (Run Each Morning)
```bash
# In your terminal, run:
standup-scribe --dir ~/projects/my-app --all-authors --days 1 \
  --output markdown --file ~/reports/standup-$(date +%Y-%m-%d).md
```

### Option 2: Windows Task Scheduler
1. Create batch file: `daily-standup.bat`
```batch
@echo off
REM Requires standup-scribe installed globally (npm install -g standup-scribe)
standup-scribe --dir D:\projects\my-app --all-authors --days 1 ^
  --output markdown --file C:\Users\%USERNAME%\standup-reports\standup-%DATE:~10,4%-%DATE:~4,2%-%DATE:~7,2%.md
pause
```

2. Schedule via Windows Task Scheduler
   - Trigger: Daily at 9 AM
   - Action: Run batch file

### Option 3: Cron Job (Mac/Linux)
```bash
# Edit cron: crontab -e
# Run daily at 9 AM
0 9 * * * standup-scribe --dir ~/projects/my-app --all-authors --days 1 \
  --output markdown --file $HOME/reports/standup-$(date +\%Y-\%m-\%d).md
```

---

## Share Reports with Team

### 📧 Email
```bash
# Generate and email
standup-scribe --dir ~/projects/my-app --all-authors --days 1 \
  --output markdown --file ~/standup.md

# Then email ~/standup.md to team@example.com
```

### 💬 Slack
```bash
# Generate markdown
standup-scribe --dir ~/projects/my-app --all-authors --days 1 \
  --output markdown --file ~/standup.md

# Copy content to Slack #standup channel
# 1. Open the markdown file
# 2. Copy all content (Ctrl+A, Ctrl+C)
# 3. Paste in Slack message
```

### 📊 Project Management Tool
```bash
# Generate JSON
standup-scribe --dir ~/projects/my-app --all-authors --days 1 \
  --output json --file ~/standup.json

# Upload to your project management tool (Jira, Asana, etc.)
```

---

## Config Management

### Save Your Preferences
```bash
# Set default author
standup-scribe config --author "Your Name"

# Set default project directory
standup-scribe config --dir ~/projects/my-app

# Set default days to look back
standup-scribe config --days 1
```

### View Current Config
```bash
standup-scribe config --show
```

### Reset Config
```bash
standup-scribe config --reset
```

---

## Examples for Different Roles

### 👨‍💼 Project Manager
```bash
# Weekly team progress
standup-scribe --dir ~/projects/my-app --all-authors --days 7 \
  --output markdown --file weekly-report-$(date +%Y-W%V).md
```

### 👨‍💻 Team Lead
```bash
# Daily standup for meeting
standup-scribe --dir ~/projects/my-app --all-authors --days 1
```

### 📊 Client/Stakeholder
```bash
# Professional markdown report
standup-scribe --dir ~/projects/my-app --all-authors --days 1 \
  --output markdown --file client-standup-$(date +%Y-%m-%d).md
```

### 🤖 CI/Automation
```bash
# Machine-readable JSON for API
standup-scribe --dir ~/projects/my-app --all-authors --days 1 \
  --output json --quiet > /var/data/standup.json
```

---

## Troubleshooting

### Command Not Found
```bash
# Make sure standup-scribe is installed globally
npm install -g standup-scribe

# Or use local version
cd /path/to/standup-scribe
npm link
```

### No Repos Found
```bash
# Make sure --dir points to correct location
standup-scribe --dir ~/projects/my-app --all-authors --days 1

# Check if it's a git repo
cd ~/projects/my-app
git status
```

### No Commits Found
```bash
# Try with more days
standup-scribe --dir ~/projects/my-app --all-authors --days 30

# Or check specific author
standup-scribe --dir ~/projects/my-app --author "Your Name" --days 7
```

---

## Tips & Tricks

1. **Create Alias** - Make it shorter:
   ```bash
   alias standup='standup-scribe --dir ~/projects/my-app --all-authors --days 1'
   
   # Then just run:
   standup
   ```

2. **Auto-open in Editor**:
   ```bash
   standup-scribe --dir ~/projects/my-app --all-authors --days 1 \
     --output markdown --file ~/standup.md && code ~/standup.md
   ```

3. **Append to Daily Log**:
   ```bash
   standup-scribe --dir ~/projects/my-app --all-authors --days 1 \
     --output markdown --quiet >> ~/standup-log.md
   ```

4. **Get Just Statistics**:
   ```bash
   standup-scribe --dir ~/projects/my-app --all-authors --days 1 --quiet
   ```

---

## Questions?

For help with any command:
```bash
standup-scribe --help
standup-scribe config --help
```

Check out: [standup-scribe README](./README.md)
