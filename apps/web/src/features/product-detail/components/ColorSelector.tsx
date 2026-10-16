import type { ColorOption } from 'contracts';
import { VisuallyHidden } from '../../../shared/components/VisuallyHidden/VisuallyHidden';
import { strings } from '../../../shared/strings';
import { swatchColor } from '../../../shared/utils/hex-code';
import styles from '../ProductView.module.css';

type ColorSelectorProps = {
  options: ColorOption[];
  selected: ColorOption | null;
  onSelect: (option: ColorOption) => void;
};

export function ColorSelector({
  options,
  selected,
  onSelect,
}: ColorSelectorProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <fieldset className={`${styles.fieldset} ${styles.colorFieldset}`}>
      <legend className={styles.legend}>{strings.detailColorLegend}</legend>
      <div className={styles.colorOptions}>
        {options.map((option) => (
          <label key={option.name} className={styles.colorOption}>
            <input
              type="radio"
              name="color"
              value={option.name}
              checked={selected?.name === option.name}
              onChange={() => onSelect(option)}
              className={styles.radioInput}
            />
            <span
              className={styles.swatch}
              style={{ backgroundColor: swatchColor(option.hexCode) }}
              aria-hidden="true"
            />
            <VisuallyHidden>{option.name}</VisuallyHidden>
          </label>
        ))}
      </div>
      {selected && <p className={styles.selectedColorName}>{selected.name}</p>}
    </fieldset>
  );
}
