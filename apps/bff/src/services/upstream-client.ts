import type { ApiError, ProductDetail, ProductSummary } from 'contracts';
import { isProductDetail, isProductSummaryArray } from '../lib/guards.js';

export interface UpstreamClientOptions {
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
  fetch: typeof globalThis.fetch;
}

export interface UpstreamFailure {
  status: number;
  error: ApiError;
}

export type UpstreamResult<T> =
  | { ok: true; value: T }
  | { ok: false; failure: UpstreamFailure };

export interface UpstreamClient {
  readonly upstreamHost: string;
  listProducts(params: {
    search?: string;
  }): Promise<UpstreamResult<ProductSummary[]>>;
  getProduct(id: string): Promise<UpstreamResult<ProductDetail>>;
}

function notFound(): UpstreamFailure {
  return {
    status: 404,
    error: { error: 'NOT_FOUND', message: 'Product not found' },
  };
}

function badGateway(): UpstreamFailure {
  return {
    status: 502,
    error: { error: 'BAD_GATEWAY', message: 'Upstream request failed' },
  };
}

function gatewayTimeout(): UpstreamFailure {
  return {
    status: 504,
    error: { error: 'GATEWAY_TIMEOUT', message: 'Upstream request timed out' },
  };
}

function isTimeoutError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: unknown }).name === 'TimeoutError'
  );
}

export function createUpstreamClient(
  options: UpstreamClientOptions,
): UpstreamClient {
  const { baseUrl, apiKey, timeoutMs, fetch: fetchImpl } = options;
  const base = baseUrl.replace(/\/+$/, '');

  async function request<T>(
    path: string,
    guard: (data: unknown) => data is T,
  ): Promise<UpstreamResult<T>> {
    let response: Response;

    try {
      response = await fetchImpl(`${base}${path}`, {
        headers: { 'x-api-key': apiKey },
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      if (isTimeoutError(error)) {
        return { ok: false, failure: gatewayTimeout() };
      }
      return { ok: false, failure: badGateway() };
    }

    if (response.status === 404) {
      return { ok: false, failure: notFound() };
    }

    if (!response.ok) {
      return { ok: false, failure: badGateway() };
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return { ok: false, failure: badGateway() };
    }

    if (!guard(body)) {
      return { ok: false, failure: badGateway() };
    }

    return { ok: true, value: body };
  }

  return {
    upstreamHost: new URL(baseUrl).host,

    listProducts(params) {
      const query =
        params.search === undefined || params.search === ''
          ? ''
          : `?search=${encodeURIComponent(params.search)}`;

      return request(`/products${query}`, isProductSummaryArray);
    },

    getProduct(id) {
      return request(`/products/${encodeURIComponent(id)}`, isProductDetail);
    },
  };
}
