import type { ProductSummary } from 'contracts';
import { ProductCard } from '../../../shared/components/ProductCard';
import styles from './ProductGrid.module.css';

type ProductGridProps = {
  products: ProductSummary[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }
  return (
    <>
      {/* biome-ignore lint/a11y/noRedundantRoles: role="list" restores list semantics lost with list-style: none */}
      <ul role="list" className={styles.grid}>
        {products.map((product, index) => (
          <li key={product.id} className={styles.item}>
            <ProductCard product={product} eager={index < 5} />
          </li>
        ))}
      </ul>
    </>
  );
}
