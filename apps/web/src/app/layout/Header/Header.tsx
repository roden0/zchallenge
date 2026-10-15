import { Link } from 'react-router-dom';
import bagActiveSvg from '../../../shared/assets/icons/bag_active.svg';
import bagInactiveSvg from '../../../shared/assets/icons/bag_inactive.svg';
import logoSvg from '../../../shared/assets/icons/logo.svg';
import { strings } from '../../../shared/strings';
import styles from './Header.module.css';

type HeaderProps = {
  itemCount?: number;
};

export function Header({ itemCount = 0 }: HeaderProps) {
  const isActive = itemCount >= 1;
  const bagSrc = isActive ? bagActiveSvg : bagInactiveSvg;
  const cartAria =
    itemCount === 0
      ? strings.cartLinkAriaZero
      : itemCount === 1
        ? strings.cartLinkAriaOne
        : strings.cartLinkAriaPlural(itemCount);

  return (
    <header className={styles.header}>
      <nav aria-label="Main">
        <Link
          to="/"
          className={styles.logoLink}
          aria-label={strings.homeLinkAria}
        >
          <img src={logoSvg} alt="" />
        </Link>
      </nav>
      <Link to="/cart" className={styles.cartLink} aria-label={cartAria}>
        <img
          src={bagSrc}
          alt=""
          data-testid={isActive ? 'bag-active' : 'bag-inactive'}
        />
        <span className={styles.cartCount}>{itemCount}</span>
      </Link>
    </header>
  );
}
