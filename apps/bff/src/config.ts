export interface Config {
  port: number;
  upstreamApiUrl: string;
  upstreamApiKey: string;
  upstreamTimeoutMs: number;
}

const DEFAULT_PORT = 3001;
const DEFAULT_UPSTREAM_TIMEOUT_MS = 15000;

function parsePositiveInteger(
  variable: string,
  raw: string | undefined,
  fallback: number,
  max?: number,
): number {
  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }

  const value = Number(raw);
  const valid =
    Number.isInteger(value) && value > 0 && (max === undefined || value <= max);

  if (!valid) {
    throw new Error(
      `${variable} must be a positive integer${max === undefined ? '' : ` up to ${max}`}`,
    );
  }

  return value;
}

function parseUpstreamApiUrl(raw: string | undefined): string {
  if (raw === undefined || raw.trim() === '') {
    throw new Error('UPSTREAM_API_URL is required');
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('UPSTREAM_API_URL must be an absolute http(s) URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('UPSTREAM_API_URL must be an absolute http(s) URL');
  }

  return raw;
}

function parseUpstreamApiKey(raw: string | undefined): string {
  if (raw === undefined || raw === '') {
    throw new Error('UPSTREAM_API_KEY is required');
  }

  return raw;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    upstreamApiUrl: parseUpstreamApiUrl(env.UPSTREAM_API_URL),
    upstreamApiKey: parseUpstreamApiKey(env.UPSTREAM_API_KEY),
    upstreamTimeoutMs: parsePositiveInteger(
      'UPSTREAM_TIMEOUT_MS',
      env.UPSTREAM_TIMEOUT_MS,
      DEFAULT_UPSTREAM_TIMEOUT_MS,
    ),
    port: parsePositiveInteger('PORT', env.PORT, DEFAULT_PORT, 65535),
  };
}
