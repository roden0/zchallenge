import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function useNavigationFocusScroll() {
  const location = useLocation();
  const initialKey = useRef(location.key);

  useEffect(() => {
    if (location.key === initialKey.current) {
      return;
    }

    if (typeof window !== 'undefined' && window.scrollTo) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    const main = document.getElementById('main');
    if (main) {
      main.focus({ preventScroll: true });
    }
  }, [location.key]);
}
