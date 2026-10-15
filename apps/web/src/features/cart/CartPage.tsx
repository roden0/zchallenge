import { usePageTitle } from '../../shared/hooks/usePageTitle';
import { strings } from '../../shared/strings';

export function CartPage() {
  usePageTitle(`${strings.cartViewTitle} | MBST`);
  return (
    <div>
      <h1>Cart</h1>
      <p>Cart</p>
    </div>
  );
}
