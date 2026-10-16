import { formatCapacity } from './format-capacity';

describe('formatCapacity', () => {
  it('inserts a space when the unit is attached to the number', () => {
    expect(formatCapacity('128GB')).toBe('128 GB');
  });

  it('keeps a single space when the unit is already spaced', () => {
    expect(formatCapacity('128 GB')).toBe('128 GB');
  });

  it('keeps terabyte values spaced', () => {
    expect(formatCapacity('1 TB')).toBe('1 TB');
  });

  it('collapses repeated whitespace', () => {
    expect(formatCapacity('128  GB')).toBe('128 GB');
  });

  it('returns unexpected input unchanged', () => {
    expect(formatCapacity('Unknown')).toBe('Unknown');
    expect(formatCapacity('')).toBe('');
    expect(formatCapacity('128')).toBe('128');
  });
});
