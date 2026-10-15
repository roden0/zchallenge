import { forwardRef } from 'react';
import styles from './SearchBar.module.css';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  id?: string;
};

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ value, onChange, onClear, id = 'search' }, ref) => {
    return (
      <div className={styles.field}>
        <label htmlFor={id} className="visually-hidden">
          Search for a smartphone...
        </label>
        <input
          ref={ref}
          id={id}
          type="search"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 100))}
          placeholder="Search for a smartphone..."
          maxLength={100}
        />
        {value.length > 0 && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => {
              onClear();
              if (ref && typeof ref !== 'function') {
                ref.current?.focus();
              }
            }}
            aria-label="Clear search"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    );
  },
);

SearchBar.displayName = 'SearchBar';
