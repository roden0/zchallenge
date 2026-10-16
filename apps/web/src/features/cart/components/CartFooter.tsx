import { useState } from 'react';
import { Link } from 'react-router-dom';
import { strings } from '../../../shared/strings';
import { formatPrice } from '../../../shared/utils/format-price';
import styles from '../CartPage.module.css';

type CartFooterProps = {
  empty: boolean;
  totalCents: number;
};

export function CartFooter({ empty, totalCents }: CartFooterProps) {
  const [showCheckoutNotice, setShowCheckoutNotice] = useState(false);

  return (
    <>
      <footer className={styles.footer}>
        <Link to="/" className={styles.continue}>
          {strings.cartContinueShopping}
        </Link>
        {empty ? null : (
          <>
            <p className={styles.total}>
              {strings.cartTotalLabel} {formatPrice(totalCents / 100)}
            </p>
            <button
              type="button"
              className={styles.pay}
              onClick={() => setShowCheckoutNotice(true)}
            >
              {strings.cartPay}
            </button>
          </>
        )}
      </footer>
      {showCheckoutNotice ? (
        <span role="status" className={styles.checkoutNotice}>
          {strings.cartCheckoutUnavailable}
        </span>
      ) : null}
    </>
  );
}
