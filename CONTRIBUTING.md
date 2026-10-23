# Contributing to standup-scribe

Thanks for helping make standups less painful! Bug reports, feature ideas, docs fixes, and code are all welcome.

## Ways to help

- 🐛 **Report a bug**: [open a bug report](https://github.com/neeelbhavsar/standup-scribe/issues/new?template=bug_report.yml)
- 💡 **Suggest a feature**: [open a feature request](https://github.com/neeelbhavsar/standup-scribe/issues/new?template=feature_request.yml)
- 🧑‍💻 **Write code**: issues labelled [`good first issue`](https://github.com/neeelbhavsar/standup-scribe/labels/good%20first%20issue) are a great place to start
- 📝 **Improve the docs**: typos, clearer examples, and new recipes for [STANDUP-COMMANDS.md](./STANDUP-COMMANDS.md) all count

If you're planning a bigger change, please open an issue first so we can agree on the approach before you spend time on it.

## Development setup

You need **Node.js 18+** and **Git**.

```bash
git clone https://github.com/<your-username>/standup-scribe.git
cd standup-scribe
npm install

npm run dev        # run the CLI from source in watch mode
npm test           # run the test suite (vitest)
npm run lint       # type-check with tsc
npm run build      # build dist/ with tsup
```

Try your changes against real repos:

```bash
npm run build
node dist/cli.js --dir ~/projects --since yesterday --group
```

Or link it globally so `standup-scribe` runs your local build:

```bash
npm link
```

## Project layout

| File | What it does |
|------|--------------|
| `src/cli.ts` | Command-line flags and output handling (commander) |
| `src/index.ts` | `getStandup()`, the main library API |
| `src/scanner.ts` | Finds git repos under the scanned directories |
| `src/commits.ts` | Reads commits with `git log` (date, author, branch, merge, and exclude filters) |
| `src/dates.ts` | `--since` / `--until` / `--week` / `--last-week` date ranges |
| `src/conventional.ts` | Conventional commit type detection and `--group` |
| `src/estimator.ts` | Time estimates from commit timestamps |
| `src/formatter.ts` | Terminal output |
| `src/exporter.ts` | Markdown, JSON, CSV, file and clipboard output |
| `src/config.ts` | Saved preferences (`standup-scribe config`) |

## Pull request checklist

1. Create a branch from `main` (`git checkout -b fix/branch-filter`)
2. Add or update tests in `tests/` for any behaviour change
3. Make sure `npm run lint`, `npm test`, and `npm run build` pass. CI runs them on Linux, macOS, and Windows
4. Update `README.md` (and `STANDUP-COMMANDS.md` if relevant) for user-facing changes
5. Add a line under the unreleased version in the README changelog
6. Use a clear commit message. [Conventional commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`) are encouraged, and standup-scribe's own `--group` output looks better for it 🙂

## Code style

- TypeScript in strict mode; avoid `any` in new code
- Match the surrounding code: small functions with a short JSDoc comment explaining *why*
- Keep the CLI cross-platform: no shell-specific commands, and use `path` for file paths
- Run `npm run format` (Prettier) before committing

## Releasing (maintainers)

1. `npm version minor` (or `patch` / `major`). This updates `package.json` and creates the git tag
2. Move the README changelog entry from *Unreleased* to the release date
3. `git push --follow-tags`
4. Publish a GitHub release for the tag. The **Publish to npm** workflow then publishes it automatically

## Recording the demo GIF

The README demo is generated from [`docs/demo.tape`](./docs/demo.tape) with [VHS](https://github.com/charmbracelet/vhs):

```bash
vhs docs/demo.tape   # writes docs/demo.gif
```

## Code of conduct

Be kind and assume good intent. Harassment or personal attacks aren't tolerated in issues, pull requests, or discussions.
