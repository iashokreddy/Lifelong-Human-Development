// @ts-check
/**
 * Starts the full live stack for the Playwright e2e suite:
 *   - NestJS API (apps/api) on port 3001, from its built server (dist/main.js)
 *   - Next.js web (apps/web) on port 3000, from its production server (next start)
 *
 * Playwright's `webServer` runs a single command and waits for a single URL, so
 * this script launches BOTH servers as child processes, forwards their output,
 * and keeps running until it is terminated. It assumes both apps are already
 * built (the `e2e` npm script runs the builds first).
 *
 * Cross-platform: uses npm's own `exec` path resolution via `npm --workspace`
 * so it works on Windows PowerShell and POSIX shells alike.
 */
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..', '..');

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

/** Spawn a workspace npm script with inherited stdio and a label-prefixed name. */
function startServer(label, workspace, script, extraEnv) {
  const child = spawn(
    npmCmd,
    ['--workspace', workspace, 'run', script],
    {
      cwd: repoRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, ...extraEnv },
    },
  );
  child.on('exit', (code, signal) => {
    // If either server dies, bring the whole orchestrator down so Playwright
    // fails fast with a clear signal rather than hanging on the web URL.
    console.error(
      `[start-stack] ${label} exited (code=${code ?? 'null'}, signal=${signal ?? 'null'}).`,
    );
    shutdown(code ?? 1);
  });
  return child;
}

const children = [];
let shuttingDown = false;

function shutdown(code) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

children.push(startServer('api', '@lhd/api', 'start'));
children.push(startServer('web', '@lhd/web', 'start'));
