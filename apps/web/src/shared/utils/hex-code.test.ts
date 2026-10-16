import { isHexCode, NEUTRAL_SWATCH_COLOR, swatchColor } from './hex-code';

describe('isHexCode', () => {
  it('accepts 6-digit hex codes', () => {
    expect(isHexCode('#1F3A5F')).toBe(true);
  });

  it('accepts 3-digit hex codes', () => {
    expect(isHexCode('#fff')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isHexCode('#AbC123')).toBe(true);
  });

  it('rejects a missing leading hash', () => {
    expect(isHexCode('1F3A5F')).toBe(false);
  });

  it('rejects wrong lengths', () => {
    expect(isHexCode('#12')).toBe(false);
    expect(isHexCode('#12345')).toBe(false);
    expect(isHexCode('#1234567')).toBe(false);
  });

  it('rejects non-hex characters', () => {
    expect(isHexCode('#gggggg')).toBe(false);
    expect(isHexCode('#12345Z')).toBe(false);
  });
});

describe('swatchColor', () => {
  it('returns a valid hex code unchanged', () => {
    expect(swatchColor('#1F3A5F')).toBe('#1F3A5F');
  });

  it('falls back to the neutral color for an invalid hex code', () => {
    expect(swatchColor('not-a-color')).toBe(NEUTRAL_SWATCH_COLOR);
  });
});
