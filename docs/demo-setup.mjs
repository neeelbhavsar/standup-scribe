// Creates throwaway demo repos for recording docs/demo.gif (see docs/demo.tape).
// Prints the demo directory so the tape can scan it. Safe to re-run: it starts fresh each time.
//
//   node docs/demo-setup.mjs
//
// Repos go in <project>/.demo (git-ignored) rather than the OS temp folder, so the
// recorded output shows a neutral path instead of the recording user's home directory.

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.demo');
const gitconfig = path.join(root, '.gitconfig');

// Previous workday: Monday (and the weekend) go back to Friday
const day = new Date();
do {
  day.setDate(day.getDate() - 1);
} while (day.getDay() === 0 || day.getDay() === 6);

const at = (hours, minutes) => {
  const d = new Date(day);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

const repos = {
  'payments-api': [
    [at(9, 12), 'feat(checkout): add Apple Pay support'],
    [at(10, 4), 'fix: retry webhook delivery on 502'],
    [at(10, 41), 'test: cover refund edge cases'],
    [at(11, 30), 'wip: try new idempotency keys'],
  ],
  'web-dashboard': [
    [at(14, 5), 'feat: export invoices as CSV'],
    [at(14, 52), 'fix(ui): date picker off by one day'],
    [at(15, 37), 'chore(deps): bump vite to 6.0'],
    [at(16, 20), 'docs: add dashboard setup guide'],
  ],
};

fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(root, { recursive: true });
fs.writeFileSync(gitconfig, '[user]\n\tname = Alex Rivera\n\temail = alex@example.com\n');

for (const [name, commits] of Object.entries(repos)) {
  const dir = path.join(root, name);
  fs.mkdirSync(dir);

  const git = (args, date) =>
    execFileSync('git', args, {
      cwd: dir,
      stdio: 'ignore',
      env: {
        ...process.env,
        GIT_CONFIG_GLOBAL: gitconfig,
        GIT_AUTHOR_DATE: date,
        GIT_COMMITTER_DATE: date,
      },
    });

  git(['init', '-b', 'main']);
  git(['config', 'commit.gpgsign', 'false']);
  for (const [date, message] of commits) {
    git(['commit', '--allow-empty', '-m', message], date);
  }
}

console.log(root);
