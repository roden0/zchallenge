import type { ProductDetail } from 'contracts';
import { detailSpecRows, strings } from '../../../shared/strings';
import styles from '../ProductView.module.css';

export function SpecsTable({ product }: { product: ProductDetail }) {
  return (
    <table className={styles.table}>
      <tbody>
        {detailSpecRows.map(({ label, key }) => {
          const value =
            key === 'brand'
              ? product.brand
              : key === 'name'
                ? product.name
                : key === 'description'
                  ? product.description
                  : product.specs[key];
          return (
            <tr key={key}>
              <th scope="row" className={styles.rowLabel}>
                {label}
              </th>
              <td className={styles.rowValue}>
                {value ? value : strings.detailMissingValue}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
