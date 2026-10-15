import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function useNavigationFocusScroll() {
  const location = useLocation();
  const previousPathname = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === previousPathname.current) {
      return;
    }
    previousPathname.current = location.pathname;

    if (typeof window !== 'undefined' && window.scrollTo) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    const main = document.getElementById('main');
    if (main) {
      main.focus({ preventScroll: true });
    }
  }, [location.pathname]);
}
