import {strict as assert} from 'assert';
import {readFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsPath = join(__dirname, '..', 'docs', 'api.md');
const content = readFileSync(docsPath, 'utf8');

describe('docs/api.md .parse() quote-stripping note', () => {
  it('mentions that quote-stripping applies to positional values alike', () => {
    assert.ok(
      content.includes('positional values alike'),
      'Expected docs/api.md to contain the phrase "positional values alike"'
    );
  });

  it('mentions that array args are used exactly as given', () => {
    assert.ok(
      content.includes('exactly as given'),
      'Expected docs/api.md to contain the phrase "exactly as given"'
    );
  });
});
