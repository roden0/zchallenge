import type { CartLine } from './types';

export const CART_STORAGE_KEY = 'mbst:cart:v1';

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const line = value as Record<string, unknown>;
  if (typeof line.storage !== 'object' || line.storage === null) {
    return false;
  }
  if (typeof line.color !== 'object' || line.color === null) {
    return false;
  }
  const storage = line.storage as Record<string, unknown>;
  const color = line.color as Record<string, unknown>;
  return (
    isNonEmptyString(line.lineId) &&
    isNonEmptyString(line.productId) &&
    isNonEmptyString(line.brand) &&
    isNonEmptyString(line.name) &&
    isNonEmptyString(line.imageUrl) &&
    isNonEmptyString(storage.capacity) &&
    typeof storage.price === 'number' &&
    Number.isFinite(storage.price) &&
    storage.price >= 0 &&
    isNonEmptyString(color.name) &&
    isNonEmptyString(color.hexCode)
  );
}

export function parseCart(raw: string | null): CartLine[] {
  if (raw === null) {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return [];
  }
  const envelope = parsed as Record<string, unknown>;
  if (envelope.version !== 1 || !Array.isArray(envelope.lines)) {
    return [];
  }
  const seen = new Set<string>();
  const lines: CartLine[] = [];
  for (const candidate of envelope.lines) {
    if (!isCartLine(candidate) || seen.has(candidate.lineId)) {
      continue;
    }
    seen.add(candidate.lineId);
    lines.push(candidate);
  }
  return lines;
}

export function serializeCart(lines: CartLine[]): string {
  return JSON.stringify({ version: 1, lines });
}

export function readCart(storage?: StorageLike): CartLine[] {
  try {
    const store = storage ?? window.localStorage;
    return parseCart(store.getItem(CART_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function writeCart(
  storage: StorageLike | undefined,
  lines: CartLine[],
): void {
  try {
    const store = storage ?? window.localStorage;
    store.setItem(CART_STORAGE_KEY, serializeCart(lines));
  } catch {
    // storage unavailable (private mode, quota, disabled): keep the cart in memory
  }
}
