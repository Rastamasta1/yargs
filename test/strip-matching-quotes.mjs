/* global describe, it */
import {expect} from 'chai';
import {stripMatchingQuotes} from '../build/lib/utils/strip-matching-quotes.js';

describe('stripMatchingQuotes', () => {
  it('strips a matching pair of double quotes', () => {
    expect(stripMatchingQuotes('"a b"')).to.equal('a b');
  });

  it('strips a matching pair of single quotes', () => {
    expect(stripMatchingQuotes("'a b'")).to.equal('a b');
  });

  it('returns an unquoted value unchanged', () => {
    expect(stripMatchingQuotes('a b')).to.equal('a b');
  });

  it('returns an unbalanced quoted value unchanged', () => {
    expect(stripMatchingQuotes('"a')).to.equal('"a');
  });

  it('returns a single-character value unchanged', () => {
    expect(stripMatchingQuotes('"')).to.equal('"');
  });

  it('returns an empty string unchanged', () => {
    expect(stripMatchingQuotes('')).to.equal('');
  });

  it('strips only one matching pair from a doubly wrapped value', () => {
    expect(stripMatchingQuotes('""a""')).to.equal('"a"');
  });
});
