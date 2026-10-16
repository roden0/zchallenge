import type { ProductDetail } from 'contracts';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../shared/api/client';
import { getProduct } from '../api/getProduct';

export type ProductStatus = 'loading' | 'success' | 'notFound' | 'error';

type ProductState = {
  status: ProductStatus;
  product: ProductDetail | null;
};

export function useProduct(id: string) {
  const [state, setState] = useState<ProductState>({
    status: 'loading',
    product: null,
  });
  const requestIdRef = useRef(0);

  const load = useCallback(() => {
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    setState({ status: 'loading', product: null });
    getProduct(id, controller.signal)
      .then((product) => {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setState({ status: 'success', product });
      })
      .catch((error) => {
        if (requestId !== requestIdRef.current) {
          return;
        }
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        if (
          error instanceof ApiError &&
          (error.status === 404 || error.status === 400)
        ) {
          setState({ status: 'notFound', product: null });
          return;
        }
        setState({ status: 'error', product: null });
      });
    return () => controller.abort();
  }, [id]);

  useEffect(() => load(), [load]);

  const retry = useCallback(() => {
    load();
  }, [load]);

  return { ...state, retry };
}
