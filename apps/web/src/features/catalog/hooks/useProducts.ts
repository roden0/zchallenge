import type { ProductSummary } from 'contracts';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getProducts } from '../api/getProducts';

type ProductsState = {
  loading: boolean;
  success: boolean;
  error: Error | null;
  data: ProductSummary[];
  resolvedSearch: string | undefined;
};

export function useProducts(search?: string) {
  const [state, setState] = useState<ProductsState>({
    loading: true,
    success: false,
    error: null,
    data: [],
    resolvedSearch: undefined,
  });

  const requestIdRef = useRef(0);
  const lastSearchRef = useRef<string | undefined>(search);

  const load = useCallback((term: string | undefined) => {
    const id = ++requestIdRef.current;
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));
    getProducts({ search: term, limit: 20 }, controller.signal)
      .then((data) => {
        if (id !== requestIdRef.current) {
          return;
        }
        setState({
          loading: false,
          success: true,
          error: null,
          data,
          resolvedSearch: term,
        });
      })
      .catch((error) => {
        if (id !== requestIdRef.current) {
          return;
        }
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        setState({
          loading: false,
          success: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
          data: [],
          resolvedSearch: undefined,
        });
      });
    return () => controller.abort();
  }, []);

  const reload = useCallback(() => {
    load(lastSearchRef.current);
  }, [load]);

  useEffect(() => {
    lastSearchRef.current = search;
    const abort = load(search);
    return abort;
  }, [search, load]);

  return { ...state, reload };
}
