import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../..');
const artifacts = ['apps/api/openapi.json', 'packages/api-client/src/generated.ts'];
const digest = async (path) =>
  createHash('sha256')
    .update(await readFile(resolve(root, path)))
    .digest('hex');
const before = await Promise.all(artifacts.map(digest));
const executable = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const result = spawnSync(executable, ['openapi:generate'], { cwd: root, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
const after = await Promise.all(artifacts.map(digest));
const stale = artifacts.filter((_, index) => before[index] !== after[index]);
if (stale.length) {
  console.error(`OpenAPI artifacts were stale: ${stale.join(', ')}`);
  process.exit(1);
}
console.log('OpenAPI artifacts are deterministic and up to date.');
