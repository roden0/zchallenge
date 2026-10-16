import type { StorageOption } from 'contracts';
import { strings } from '../../../shared/strings';
import { formatCapacity } from '../../../shared/utils/format-capacity';
import { formatPrice } from '../../../shared/utils/format-price';
import styles from '../ProductView.module.css';

type StorageSelectorProps = {
  options: StorageOption[];
  selected: string | null;
  onSelect: (capacity: string) => void;
};

export function StorageSelector({
  options,
  selected,
  onSelect,
}: StorageSelectorProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <fieldset className={`${styles.fieldset} ${styles.storageFieldset}`}>
      <legend className={styles.legend}>{strings.detailStorageLegend}</legend>
      <div className={styles.storageOptions}>
        {options.map((option) => (
          <label key={option.capacity} className={styles.storageOption}>
            <input
              type="radio"
              name="storage"
              value={option.capacity}
              checked={selected === option.capacity}
              onChange={() => onSelect(option.capacity)}
              className={styles.radioInput}
              aria-label={`${formatCapacity(option.capacity)}, ${formatPrice(option.price)}`}
            />
            <span className={styles.storageLabel} aria-hidden="true">
              {formatCapacity(option.capacity)}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
