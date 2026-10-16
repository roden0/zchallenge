import type { ProductDetail } from 'contracts';
import { apiFetch } from '../../../shared/api/client';

export async function getProduct(
  id: string,
  signal?: AbortSignal,
): Promise<ProductDetail> {
  return apiFetch<ProductDetail>(
    `/api/products/${encodeURIComponent(id)}`,
    signal,
  );
}
