import type { ReactNode } from 'react';
import { CartProvider } from '../shared/cart';

export function AppProviders({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
