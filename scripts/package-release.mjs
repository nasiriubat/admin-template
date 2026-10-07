// Builds a clean distributable ZIP of tracked files only (no node_modules, builds, env files or git history).
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const out = path.join('dist', `nexus-admin-${pkg.version}.zip`);
mkdirSync('dist', { recursive: true });

const status = execFileSync('git', ['status', '--porcelain']).toString().trim();
if (status) {
  console.error('Working tree has uncommitted changes. Commit them first so the package matches a known revision.');
  process.exit(1);
}
execFileSync('git', ['archive', '--format=zip', `--prefix=nexus-admin-${pkg.version}/`, '-o', out, 'HEAD'], { stdio: 'inherit' });
console.log(`Created ${out}`);
console.log('Checklist: docs/RELEASE_CHECKLIST.md. Verify the archive contains no secrets and that demo mode is off in your deployment.');
