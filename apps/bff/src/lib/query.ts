import type { ApiError } from 'contracts';

export const MAX_LIMIT = 100;
export const MAX_SEARCH_LENGTH = 100;

export interface ListQuery {
  search?: string;
  limit?: number;
  offset: number;
}

export type ListQueryResult =
  | { ok: true; value: ListQuery }
  | { ok: false; error: ApiError };

type SingleValue =
  | { kind: 'absent' }
  | { kind: 'value'; value: string }
  | { kind: 'invalid' };

function badRequest(message: string): { ok: false; error: ApiError } {
  return { ok: false, error: { error: 'BAD_REQUEST', message } };
}

function readSingle(raw: Record<string, unknown>, key: string): SingleValue {
  const value = Object.hasOwn(raw, key) ? raw[key] : undefined;

  if (value === undefined) {
    return { kind: 'absent' };
  }

  if (typeof value !== 'string') {
    return { kind: 'invalid' };
  }

  return { kind: 'value', value };
}

function parseInteger(value: string): number | undefined {
  return /^\d+$/.test(value) ? Number(value) : undefined;
}

export function parseListQuery(raw: Record<string, unknown>): ListQueryResult {
  const searchParam = readSingle(raw, 'search');
  if (searchParam.kind === 'invalid') {
    return badRequest("'search' must appear at most once");
  }

  let search: string | undefined;
  if (searchParam.kind === 'value') {
    const trimmed = searchParam.value.trim();
    if (trimmed.length > MAX_SEARCH_LENGTH) {
      return badRequest(
        `'search' must be at most ${MAX_SEARCH_LENGTH} characters`,
      );
    }
    if (trimmed !== '') {
      search = trimmed;
    }
  }

  const limitParam = readSingle(raw, 'limit');
  if (limitParam.kind === 'invalid') {
    return badRequest("'limit' must appear at most once");
  }

  let limit: number | undefined;
  if (limitParam.kind === 'value') {
    const parsed = parseInteger(limitParam.value);
    if (parsed === undefined || parsed < 1) {
      return badRequest(
        "'limit' must be an integer greater than or equal to 1",
      );
    }
    limit = Math.min(parsed, MAX_LIMIT);
  }

  const offsetParam = readSingle(raw, 'offset');
  if (offsetParam.kind === 'invalid') {
    return badRequest("'offset' must appear at most once");
  }

  let offset = 0;
  if (offsetParam.kind === 'value') {
    const parsed = parseInteger(offsetParam.value);
    if (parsed === undefined) {
      return badRequest(
        "'offset' must be an integer greater than or equal to 0",
      );
    }
    offset = parsed;
  }

  const value: ListQuery = { offset };
  if (search !== undefined) {
    value.search = search;
  }
  if (limit !== undefined) {
    value.limit = limit;
  }

  return { ok: true, value };
}
