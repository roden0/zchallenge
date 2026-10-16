const HEX_CODE_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const NEUTRAL_SWATCH_COLOR = '#CCCCCC';

export function isHexCode(value: string): boolean {
  return HEX_CODE_PATTERN.test(value);
}

export function swatchColor(hexCode: string): string {
  return isHexCode(hexCode) ? hexCode : NEUTRAL_SWATCH_COLOR;
}
