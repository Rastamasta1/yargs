#!/usr/bin/env node
// Minimal entry point to verify the project's main modules load correctly.
// yargs is an ESM package ("type": "module"), so this file uses ESM syntax.
//
// index.mjs (and helpers/helpers.mjs) import from build/lib/*.js, which is
// the TypeScript output. That directory is gitignored and not committed, so
// on a fresh checkout it simply does not exist yet, causing
// ERR_MODULE_NOT_FOUND when index.mjs is imported. Detect that case and run
// the project's own compile step first, then import lazily so the compiled
// files exist before Node tries to resolve them.
//
// The project's "compile" npm script invokes `rimraf build && tsc`. rimraf
// is a devDependency, so on an environment where `npm ci`/`npm install` was
// run with production-only deps (or node_modules is otherwise incomplete),
// `rimraf` is not on PATH and `npm run compile` fails with "rimraf: not
// found" (exit status 127) before tsc ever runs. Work around a missing
// rimraf by clearing the build/ directory ourselves (plain fs, no external
// binary) and invoking the TypeScript compiler directly instead of going
// through the npm script.

import {existsSync, rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {execFileSync} from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const compiledEntry = join(__dirname, 'build', 'lib', 'yargs-factory.js');
const buildDir = join(__dirname, 'build');

function runCompile() {
  // Equivalent of the "compile" npm script (`rimraf build && tsc -p tsconfig.json`),
  // but without depending on the rimraf binary being present on PATH.
  rmSync(buildDir, {recursive: true, force: true});

  const tscCmd = process.platform === 'win32' ? 'tsc.cmd' : 'tsc';
  const localTsc = join(__dirname, 'node_modules', '.bin', tscCmd);

  if (existsSync(localTsc)) {
    execFileSync(localTsc, ['-p', 'tsconfig.json'], {
      cwd: __dirname,
      stdio: 'inherit',
    });
  } else {
    // Fall back to npx in case the local binary isn't where expected.
    execFileSync('npx', ['tsc', '-p', 'tsconfig.json'], {
      cwd: __dirname,
      stdio: 'inherit',
    });
  }
}

function ensureBuilt() {
  if (existsSync(compiledEntry)) return;
  console.log(
    '[index.js] build/ output not found, compiling TypeScript sources...'
  );
  try {
    runCompile();
  } catch (err) {
    console.error('[index.js] Failed to compile TypeScript sources:', err);
    process.exit(1);
  }
  if (!existsSync(compiledEntry)) {
    console.error(
      '[index.js] Compile step finished but build/lib/yargs-factory.js is still missing.'
    );
    process.exit(1);
  }
}

async function main() {
  try {
    ensureBuilt();

    // Import lazily (after the build check) so resolution of build/lib/*.js
    // only happens once we know the files are present.
    const {default: yargs} = await import('./index.mjs');
    const {hideBin} = await import('./helpers/helpers.mjs');

    const argv = yargs(hideBin(process.argv))
      .scriptName('yargs')
      .usage('$0 [args]')
      .help()
      .parse();

    console.log('[index.js] yargs module loaded and parsed successfully.');
    console.log('[index.js] Parsed argv:', argv);
  } catch (err) {
    console.error('[index.js] Failed to load or run yargs:', err);
    process.exit(1);
  }
}

main();
