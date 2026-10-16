import type { CartLine as CartLineValue } from '../../../shared/cart';
import { strings } from '../../../shared/strings';
import { formatCapacity } from '../../../shared/utils/format-capacity';
import { formatPrice } from '../../../shared/utils/format-price';
import styles from '../CartPage.module.css';

type CartLineProps = {
  line: CartLineValue;
  onRemove: (lineId: string) => void;
  registerRemoveRef: (node: HTMLButtonElement | null) => void;
};

export function CartLine({ line, onRemove, registerRemoveRef }: CartLineProps) {
  const capacity = formatCapacity(line.storage.capacity);

  return (
    <li className={styles.line}>
      <div className={styles.imageArea}>
        <img className={styles.image} src={line.imageUrl} alt="" />
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{line.name}</span>
        <span
          className={styles.options}
        >{`${capacity} | ${line.color.name}`}</span>
        <span className={styles.price}>{formatPrice(line.storage.price)}</span>
        <button
          type="button"
          ref={registerRemoveRef}
          className={styles.removeButton}
          onClick={() => onRemove(line.lineId)}
        >
          {strings.cartRemove}{' '}
          <span className="visually-hidden">{`${line.name}, ${capacity}, ${line.color.name}`}</span>
        </button>
      </div>
    </li>
  );
}
