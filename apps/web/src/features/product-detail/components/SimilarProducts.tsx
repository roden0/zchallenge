import type { ProductSummary } from 'contracts';
import { ProductCard } from '../../../shared/components/ProductCard';
import { strings } from '../../../shared/strings';
import styles from '../ProductView.module.css';

type SimilarProductsProps = {
  products: ProductSummary[];
};

export function SimilarProducts({ products }: SimilarProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className={styles.similarSection}>
      <h2 className={styles.similarTitle}>{strings.detailSimilarHeading}</h2>
      {/* biome-ignore lint/a11y/noRedundantRoles: role="list" restores list semantics lost with list-style: none */}
      <ul role="list" className={styles.similarRow}>
        {products.map((product, index) => (
          <li key={product.id} className={styles.similarItem}>
            <ProductCard product={product} eager={index < 3} />
          </li>
        ))}
      </ul>
    </section>
  );
}
