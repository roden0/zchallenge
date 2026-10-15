import type { ProductSummary } from 'contracts';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format-price';
import styles from './ProductCard.module.css';

export type ProductCardProps = {
  product: ProductSummary;
  eager?: boolean;
};

export function ProductCard({ product, eager = false }: ProductCardProps) {
  return (
    <Link
      to={`/products/${encodeURIComponent(product.id)}`}
      className={styles.card}
      aria-label={`${product.brand} ${product.name}, ${formatPrice(product.basePrice)}`}
    >
      <div className={styles.imageWrapper}>
        <img
          src={product.imageUrl}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          className={styles.image}
        />
      </div>
      <div className={styles.info}>
        <div className={styles.left}>
          <div className={styles.brand}>{product.brand}</div>
          <div className={styles.name}>{product.name}</div>
        </div>
        <div className={styles.price}>{formatPrice(product.basePrice)}</div>
      </div>
    </Link>
  );
}
