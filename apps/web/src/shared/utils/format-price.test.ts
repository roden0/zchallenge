import { formatPrice } from './format-price';

describe('formatPrice', () => {
  it('formats integers without decimals representation as .00', () => {
    expect(formatPrice(1099)).toBe('1099,00 EUR');
  });
  it('formats 119', () => {
    expect(formatPrice(119)).toBe('119,00 EUR');
  });
  it('formats 959.42', () => {
    expect(formatPrice(959.42)).toBe('959,42 EUR');
  });
  it('formats 549.5', () => {
    expect(formatPrice(549.5)).toBe('549,50 EUR');
  });
  it('formats 0', () => {
    expect(formatPrice(0)).toBe('0,00 EUR');
  });
});
