// One command for local development: starts the admin (3000) and marketing site (3200) together,
// prefixes their logs, and opens the admin dashboard in your browser once it is ready.
//   pnpm dev                 both apps + open browser
//   pnpm dev -- --no-open    both apps, do not open a browser
//   pnpm dev -- --only=admin | --only=marketing
import { spawn, spawnSync } from 'node:child_process';
import net from 'node:net';

const args = process.argv.slice(2);
const noOpen = args.includes('--no-open');
const only = args.find((a) => a.startsWith('--only='))?.split('=')[1];

const apps = [
  { name: 'admin', filter: '@nexus/admin', port: 3000, color: '\x1b[36m', open: '/' },
  { name: 'marketing', filter: '@nexus/marketing', port: 3200, color: '\x1b[35m' },
].filter((a) => !only || a.name === only);

const reset = '\x1b[0m';
const children = [];

const portBusy = (port) =>
  new Promise((resolve) => {
    const s = net.createConnection({ port, host: '127.0.0.1' });
    s.once('connect', () => (s.destroy(), resolve(true)));
    s.once('error', () => resolve(false));
  });

async function waitForPort(port, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await portBusy(port)) return true;
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

function openBrowser(url) {
  const [cmd, cmdArgs] =
    process.platform === 'darwin' ? ['open', [url]] : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : ['xdg-open', [url]];
  spawnSync(cmd, cmdArgs, { stdio: 'ignore' });
}

for (const app of apps) {
  if (await portBusy(app.port)) {
    console.error(`Port ${app.port} is already in use (${app.name}). Stop the other process or use --only=...`);
    process.exit(1);
  }
}

for (const app of apps) {
  const child = spawn('pnpm', ['--filter', app.filter, 'dev'], { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, FORCE_COLOR: '1' } });
  const tag = `${app.color}[${app.name}]${reset} `;
  for (const stream of [child.stdout, child.stderr]) {
    let buffer = '';
    stream.on('data', (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) if (line.trim()) console.log(tag + line);
    });
  }
  child.on('exit', (code) => {
    console.log(`${tag}exited with code ${code}`);
    shutdown(code ?? 0);
  });
  children.push(child);
}

function shutdown(code = 0) {
  for (const c of children) if (!c.killed) c.kill('SIGTERM');
  process.exit(code);
}
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('\n  Nexus Admin dev environment');
for (const app of apps) console.log(`  ${app.color}${app.name.padEnd(10)}${reset} http://localhost:${app.port}`);
console.log('  Press Ctrl+C to stop everything.\n');

if (!noOpen && apps.some((a) => a.open)) {
  const target = apps.find((a) => a.open);
  if (await waitForPort(target.port)) openBrowser(`http://localhost:${target.port}${target.open}`);
}
