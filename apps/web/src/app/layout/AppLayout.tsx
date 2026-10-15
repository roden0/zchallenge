import { Outlet } from 'react-router-dom';
import { strings } from '../../shared/strings';
import styles from './AppLayout.module.css';
import { Header } from './Header/Header';
import { useNavigationFocusScroll } from './useNavigationFocusScroll';

export function AppLayout() {
  useNavigationFocusScroll();

  function handleSkip(event: React.MouseEvent<HTMLAnchorElement>) {
    const main = document.getElementById('main');
    if (main) {
      event.preventDefault();
      main.focus();
    }
  }

  return (
    <>
      {/* biome-ignore lint/a11y/useValidAnchor: skip link targets #main; focus is moved explicitly for browsers/jsdom */}
      <a href="#main" className={styles.skipLink} onClick={handleSkip}>
        {strings.skipToContent}
      </a>
      <Header itemCount={0} />
      <main id="main" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}
