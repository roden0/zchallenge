import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue';
import { usePageTitle } from '../../shared/hooks/usePageTitle';
import { strings } from '../../shared/strings';
import styles from './CatalogPage.module.css';
import { ProductGrid } from './components/ProductGrid';
import { ResultsCounter } from './components/ResultsCounter';
import { SearchBar } from './components/SearchBar';
import { useProducts } from './hooks/useProducts';

export function CatalogPage() {
  usePageTitle(`${strings.catalogTitle} | MBST`);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(urlSearch);
  const debouncedInput = useDebouncedValue(inputValue, 300);
  const effectiveInput = inputValue === '' ? '' : debouncedInput;
  const searchTerm = effectiveInput.trim();
  const { data, loading, error, success, resolvedSearch, reload } = useProducts(
    searchTerm || undefined,
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const ownWriteRef = useRef<string | null>(urlSearch);
  const pendingRetryFocus = useRef(false);

  useEffect(() => {
    if (urlSearch === ownWriteRef.current) {
      return;
    }
    setInputValue(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const trimmed = effectiveInput.trim();
    const currentQ = searchParams.get('q') || '';
    if (trimmed === currentQ) {
      ownWriteRef.current = trimmed;
      return;
    }
    const newParams = new URLSearchParams(searchParams);
    if (trimmed.length === 0) {
      newParams.delete('q');
    } else {
      newParams.set('q', trimmed);
    }
    ownWriteRef.current = trimmed;
    setSearchParams(newParams, { replace: true });
  }, [effectiveInput, searchParams, setSearchParams]);

  useEffect(() => {
    if (success && pendingRetryFocus.current) {
      pendingRetryFocus.current = false;
      searchInputRef.current?.focus();
    }
  }, [success]);

  const pendingFirstResponse = loading && !success && error === null;
  const showError = error !== null;
  const showGrid = success && data.length > 0;
  const showEmpty = success && data.length === 0;

  const handleRetry = () => {
    pendingRetryFocus.current = true;
    reload();
  };

  return (
    <section className={styles.page}>
      <h1 className="visually-hidden">Smartphones</h1>
      {/* biome-ignore lint/a11y/useSemanticElements: spec requires a form with role="search" wrapping the field and counter */}
      <form
        role="search"
        className={styles.searchForm}
        aria-label="Product search"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className={styles.searchSection}>
          <SearchBar
            ref={searchInputRef}
            value={inputValue}
            onChange={setInputValue}
            onClear={() => setInputValue('')}
          />
        </div>
        {!showError && (
          <div
            className={styles.resultsRegion}
            aria-busy={loading && success}
            data-testid="catalog-results"
          >
            <div className={styles.counterSection}>
              <ResultsCounter
                count={data.length}
                loading={pendingFirstResponse}
              />
            </div>
            {showEmpty && (
              <p className={styles.emptyMessage}>
                No smartphones found for "{resolvedSearch ?? searchTerm}".
              </p>
            )}
            {showGrid && <ProductGrid products={data} />}
          </div>
        )}
      </form>
      {showError && (
        <div className={styles.errorSection}>
          <div role="alert" className={styles.errorMessage}>
            COULD NOT LOAD SMARTPHONES
          </div>
          <button
            type="button"
            className={styles.retryButton}
            onClick={handleRetry}
          >
            RETRY
          </button>
        </div>
      )}
    </section>
  );
}
