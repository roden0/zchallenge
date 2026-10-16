import {
  CART_STORAGE_KEY,
  isCartLine,
  parseCart,
  readCart,
  type StorageLike,
  serializeCart,
  writeCart,
} from './cart-storage';
import type { CartLine } from './types';

function line(overrides: Partial<CartLine> = {}): CartLine {
  return {
    lineId: 'line-1',
    productId: 'p1',
    brand: 'Apple',
    name: 'iPhone 15 Pro',
    imageUrl: 'img.webp',
    storage: { capacity: '256 GB', price: 959.42 },
    color: { name: 'Black', hexCode: '#000000' },
    ...overrides,
  };
}

function envelope(lines: unknown[], version: unknown = 1): string {
  return JSON.stringify({ version, lines });
}

function memoryStorage(initial: Record<string, string> = {}): StorageLike & {
  map: Map<string, string>;
} {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

describe('isCartLine', () => {
  it('accepts a complete line', () => {
    expect(isCartLine(line())).toBe(true);
  });

  it('rejects a non-finite or negative price', () => {
    expect(
      isCartLine(line({ storage: { capacity: '256 GB', price: Number.NaN } })),
    ).toBe(false);
    expect(
      isCartLine(line({ storage: { capacity: '256 GB', price: -1 } })),
    ).toBe(false);
    expect(
      isCartLine({
        ...line(),
        storage: { capacity: '256 GB', price: '959.42' },
      }),
    ).toBe(false);
  });

  it('rejects non-objects and missing fields', () => {
    expect(isCartLine(null)).toBe(false);
    expect(isCartLine('line')).toBe(false);
    expect(isCartLine({ ...line(), name: '' })).toBe(false);
    expect(isCartLine({ ...line(), storage: undefined })).toBe(false);
  });
});

describe('parseCart', () => {
  it('keeps valid lines from a valid value', () => {
    const a = line();
    const b = line({ lineId: 'line-2', name: 'Pixel 8' });
    expect(parseCart(envelope([a, b]))).toEqual([a, b]);
  });

  it('returns an empty cart for invalid JSON', () => {
    expect(parseCart('{nope')).toEqual([]);
  });

  it('returns an empty cart for a non-object value', () => {
    expect(parseCart('42')).toEqual([]);
    expect(parseCart('"cart"')).toEqual([]);
    expect(parseCart('[1,2]')).toEqual([]);
  });

  it('returns an empty cart for a wrong version', () => {
    expect(parseCart(envelope([line()], 2))).toEqual([]);
  });

  it('drops an invalid line and keeps the valid ones', () => {
    const valid = line();
    const invalid = { ...line({ lineId: 'line-2' }) };
    delete (invalid as Partial<CartLine>).storage;
    expect(parseCart(envelope([valid, invalid]))).toEqual([valid]);
  });

  it('keeps only the first line for a repeated lineId', () => {
    const first = line();
    const duplicate = line({ name: 'Different name' });
    expect(parseCart(envelope([first, duplicate]))).toEqual([first]);
  });

  it('drops lines with a negative or non-numeric price', () => {
    expect(
      parseCart(envelope([line({ storage: { capacity: 'x', price: -0.01 } })])),
    ).toEqual([]);
    expect(
      parseCart(
        JSON.stringify({
          version: 1,
          lines: [{ ...line(), storage: { capacity: 'x', price: 'free' } }],
        }),
      ),
    ).toEqual([]);
  });

  it('drops a line with a missing or empty field', () => {
    const kept = line({ lineId: 'l2' });
    expect(
      parseCart(
        JSON.stringify({
          version: 1,
          lines: [{ ...line(), brand: '' }, kept],
        }),
      ),
    ).toEqual([kept]);
  });

  it('returns an empty cart for null (nothing stored)', () => {
    expect(parseCart(null)).toEqual([]);
  });
});

describe('serializeCart', () => {
  it('is deterministic and round-trips through parseCart', () => {
    const lines = [line(), line({ lineId: 'line-2' })];
    const a = serializeCart(lines);
    const b = serializeCart(lines);
    expect(a).toBe(b);
    expect(parseCart(a)).toEqual(lines);
  });
});

describe('readCart / writeCart', () => {
  it('round-trips lines through an injected storage', () => {
    const storage = memoryStorage();
    writeCart(storage, [line()]);
    expect(storage.map.get(CART_STORAGE_KEY)).toBe(serializeCart([line()]));
    expect(readCart(storage)).toEqual([line()]);
  });

  it('returns an empty cart when reading throws', () => {
    const throwing: StorageLike = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {},
    };
    const log = jest.spyOn(console, 'log');
    const warn = jest.spyOn(console, 'warn');
    const error = jest.spyOn(console, 'error');
    expect(readCart(throwing)).toEqual([]);
    expect(log).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('swallows a write that throws and prints nothing', () => {
    const throwing: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
    };
    const log = jest.spyOn(console, 'log');
    const warn = jest.spyOn(console, 'warn');
    const error = jest.spyOn(console, 'error');
    expect(() => writeCart(throwing, [line()])).not.toThrow();
    expect(log).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});
