import type { ProductSummary } from 'contracts';
import { apiFetch } from '../../../shared/api/client';

export async function getProducts(
  params: { search?: string; limit?: number },
  signal?: AbortSignal,
): Promise<ProductSummary[]> {
  const searchParams = new URLSearchParams();
  if (params.limit !== undefined) {
    searchParams.set('limit', String(params.limit));
  }
  if (params.search && params.search.trim().length > 0) {
    searchParams.set('search', params.search.trim());
  }
  const query = searchParams.toString();
  const path = `/api/products${query ? `?${query}` : ''}`;
  return apiFetch<ProductSummary[]>(path, signal);
}
