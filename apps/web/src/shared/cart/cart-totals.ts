import type { CartLine } from './types';

export function totalCents(lines: CartLine[]): number {
  return lines.reduce(
    (sum, line) => sum + Math.round(line.storage.price * 100),
    0,
  );
}
