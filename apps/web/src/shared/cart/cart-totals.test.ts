import { totalCents } from './cart-totals';
import type { CartLine } from './types';

function line(lineId: string, price: number): CartLine {
  return {
    lineId,
    productId: 'p1',
    brand: 'Apple',
    name: 'iPhone 15 Pro',
    imageUrl: 'img.webp',
    storage: { capacity: '256 GB', price },
    color: { name: 'Black', hexCode: '#000000' },
  };
}

describe('totalCents', () => {
  it('empty cart gives 0', () => {
    expect(totalCents([])).toBe(0);
  });

  it('sums Math.round(price * 100): 959.42 + 117.29 gives exactly 107671', () => {
    const cents = totalCents([line('a', 959.42), line('b', 117.29)]);
    expect(cents).toBe(107671);
    expect(cents / 100).toBe(1076.71);
  });
});
