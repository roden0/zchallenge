import { usePageTitle } from '../../shared/hooks/usePageTitle';
import { strings } from '../../shared/strings';

export function ProductDetailPage() {
  usePageTitle(`${strings.detailTitleGeneric} | MBST`);
  return (
    <div>
      <h1>Product</h1>
      <p>Product detail</p>
    </div>
  );
}
