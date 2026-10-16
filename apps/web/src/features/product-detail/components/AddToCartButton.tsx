import type { ColorOption, ProductDetail, StorageOption } from 'contracts';
import { useId, useState } from 'react';
import { useCart } from '../../../shared/cart';
import { strings } from '../../../shared/strings';
import styles from '../ProductView.module.css';

type AddToCartButtonProps = {
  product: ProductDetail;
  storage: StorageOption | null;
  color: ColorOption | null;
};

export function AddToCartButton({
  product,
  storage,
  color,
}: AddToCartButtonProps) {
  const { addLine } = useCart();
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const hintId = useId();
  const enabled = storage !== null && color !== null;

  function handleAdd() {
    if (!storage || !color) {
      return;
    }
    addLine({
      productId: product.id,
      brand: product.brand,
      name: product.name,
      imageUrl: color.imageUrl,
      storage: { capacity: storage.capacity, price: storage.price },
      color: { name: color.name, hexCode: color.hexCode },
    });
    setAddedMessage(strings.detailAddedToCart(product.name));
  }

  return (
    <div className={styles.addSection}>
      <button
        type="button"
        className={styles.addButton}
        disabled={!enabled}
        onClick={handleAdd}
        aria-describedby={hintId}
      >
        {strings.detailAddButton}
      </button>
      <span id={hintId} className="visually-hidden">
        {strings.detailAddHint}
      </span>
      {addedMessage && (
        <span role="status" className="visually-hidden">
          {addedMessage}
        </span>
      )}
    </div>
  );
}
