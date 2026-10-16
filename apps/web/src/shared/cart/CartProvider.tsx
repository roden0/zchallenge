import {
  createContext,
  type ReactNode,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { cartReducer, initialCartState } from './cart-reducer';
import {
  CART_STORAGE_KEY,
  parseCart,
  readCart,
  type StorageLike,
  serializeCart,
  writeCart,
} from './cart-storage';
import { totalCents } from './cart-totals';
import type { CartLine, NewCartLine } from './types';

export type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  totalCents: number;
  addLine: (line: NewCartLine) => void;
  removeLine: (lineId: string) => void;
};

export const CartContext = createContext<CartContextValue | null>(null);

function generateLineId(): string {
  if (typeof crypto === 'object' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // fallback when crypto.randomUUID is unavailable: timestamp + random base-36
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

type CartProviderProps = {
  children: ReactNode;
  storage?: StorageLike;
};

export function CartProvider({ children, storage }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState, () => ({
    lines: readCart(storage),
  }));

  const serializedRef = useRef(serializeCart(state.lines));

  useEffect(() => {
    const serialized = serializeCart(state.lines);
    if (serialized === serializedRef.current) {
      return;
    }
    serializedRef.current = serialized;
    writeCart(storage, state.lines);
  }, [state.lines, storage]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== null && event.key !== CART_STORAGE_KEY) {
        return;
      }
      const lines = parseCart(event.newValue);
      serializedRef.current = serializeCart(lines);
      dispatch({ type: 'replace', lines });
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines: state.lines,
      itemCount: state.lines.length,
      totalCents: totalCents(state.lines),
      addLine: (line: NewCartLine) => {
        let lineId = generateLineId();
        while (state.lines.some((existing) => existing.lineId === lineId)) {
          lineId = generateLineId();
        }
        dispatch({ type: 'add', line: { ...line, lineId } });
      },
      removeLine: (lineId: string) => {
        dispatch({ type: 'remove', lineId });
      },
    }),
    [state.lines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
