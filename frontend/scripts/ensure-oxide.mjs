import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { arch, platform } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const frontendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(frontendDir, '..');

const oxideOk = () => {
  try {
    require('@tailwindcss/oxide');
    return true;
  } catch {
    return false;
  }
};

const detectMusl = () => {
  if (existsSync('/etc/alpine-release')) {
    return true;
  }
  try {
    return readFileSync('/usr/bin/ldd', 'utf8').includes('musl');
  } catch {
    return false;
  }
};

const resolvePackage = () => {
  const osName = platform();
  const cpu = arch();
  const musl = detectMusl();

  if (osName === 'linux' && cpu === 'x64') {
    return musl ? '@tailwindcss/oxide-linux-x64-musl' : '@tailwindcss/oxide-linux-x64-gnu';
  }
  if (osName === 'linux' && cpu === 'arm64') {
    return musl ? '@tailwindcss/oxide-linux-arm64-musl' : '@tailwindcss/oxide-linux-arm64-gnu';
  }
  if (osName === 'darwin' && cpu === 'arm64') {
    return '@tailwindcss/oxide-darwin-arm64';
  }
  if (osName === 'darwin' && cpu === 'x64') {
    return '@tailwindcss/oxide-darwin-x64';
  }
  throw new Error(`Unsupported platform for @tailwindcss/oxide: ${osName}/${cpu}`);
};

const resolveVersion = () => {
  try {
    const pkgPath = require.resolve('@tailwindcss/oxide/package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    if (pkg.version) {
      return pkg.version;
    }
  } catch {
    // fall through
  }
  return '4.3.3';
};

if (oxideOk()) {
  console.log('[oxide] native binding OK');
  process.exit(0);
}

const pkgName = resolvePackage();
const version = resolveVersion();
console.warn(`[oxide] missing native binding — installing ${pkgName}@${version}`);

const install = spawnSync(
  'npm',
  ['install', `${pkgName}@${version}`, '--legacy-peer-deps', '--no-save'],
  {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  },
);

if (install.status !== 0) {
  console.error('[oxide] npm install failed');
  process.exit(install.status ?? 1);
}

if (!oxideOk()) {
  console.error(`[oxide] still missing after install.
Run on the server from repo root:

  rm -rf node_modules
  npm install --legacy-peer-deps
  npm i ${pkgName}@${version} --legacy-peer-deps
  cd frontend && npm run build
`);
  process.exit(1);
}

console.log(`[oxide] ready (${pkgName})`);
