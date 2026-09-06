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

import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {execFileSync} from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const compiledEntry = join(__dirname, 'build', 'lib', 'yargs-factory.js');

function ensureBuilt() {
  if (existsSync(compiledEntry)) return;
  console.log(
    '[index.js] build/ output not found, running "npm run compile"...'
  );
  try {
    execFileSync('npm', ['run', 'compile'], {
      cwd: __dirname,
      stdio: 'inherit',
    });
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
