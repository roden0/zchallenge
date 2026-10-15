import { expect } from 'chai';
import { MAX_LIMIT, parseListQuery } from './query.js';

describe('parseListQuery', () => {
  it('omits search when absent, empty or whitespace', () => {
    for (const raw of [{}, { search: '' }, { search: '   ' }]) {
      const result = parseListQuery(raw);
      expect(result.ok).to.equal(true);
      if (!result.ok) continue;
      expect(result.value.search).to.equal(undefined);
    }
  });

  it('trims a non-empty search', () => {
    const result = parseListQuery({ search: '  sam  ' });
    expect(result.ok).to.equal(true);
    if (!result.ok) return;
    expect(result.value.search).to.equal('sam');
  });

  it('rejects a search longer than 100 characters after trimming', () => {
    const result = parseListQuery({ search: ' '.repeat(2) + 'a'.repeat(101) });
    expect(result.ok).to.equal(false);
    if (result.ok) return;
    expect(result.error.error).to.equal('BAD_REQUEST');
    expect(result.error.message).to.contain('search');
  });

  it('accepts a search of exactly 100 characters', () => {
    const result = parseListQuery({ search: 'a'.repeat(100) });
    expect(result.ok).to.equal(true);
  });

  it('defaults offset to 0 and leaves limit undefined', () => {
    const result = parseListQuery({});
    expect(result.ok).to.equal(true);
    if (!result.ok) return;
    expect(result.value.offset).to.equal(0);
    expect(result.value.limit).to.equal(undefined);
  });

  it('parses a valid limit and offset', () => {
    const result = parseListQuery({ limit: '20', offset: '5' });
    expect(result.ok).to.equal(true);
    if (!result.ok) return;
    expect(result.value.limit).to.equal(20);
    expect(result.value.offset).to.equal(5);
  });

  it('rejects a non-integer limit', () => {
    for (const limit of ['2.5', 'abc', '-1', '0', '']) {
      const result = parseListQuery({ limit });
      expect(result.ok, `limit=${limit}`).to.equal(false);
    }
  });

  it('clamps a limit above MAX_LIMIT to MAX_LIMIT', () => {
    const result = parseListQuery({ limit: '5000' });
    expect(result.ok).to.equal(true);
    if (!result.ok) return;
    expect(result.value.limit).to.equal(MAX_LIMIT);
  });

  it('rejects a non-integer offset', () => {
    for (const offset of ['1.5', 'abc', '-1', '']) {
      const result = parseListQuery({ offset });
      expect(result.ok, `offset=${offset}`).to.equal(false);
    }
  });

  it('rejects a repeated known parameter', () => {
    const result = parseListQuery({ limit: ['1', '2'] });
    expect(result.ok).to.equal(false);
    if (result.ok) return;
    expect(result.error.error).to.equal('BAD_REQUEST');
  });

  it('ignores unknown parameters', () => {
    const result = parseListQuery({ colour: 'blue', limit: '3' });
    expect(result.ok).to.equal(true);
    if (!result.ok) return;
    expect(result.value.limit).to.equal(3);
    expect(Object.keys(result.value).sort()).to.deep.equal(['limit', 'offset']);
  });
});
