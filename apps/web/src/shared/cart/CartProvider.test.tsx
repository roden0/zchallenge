import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider } from './CartProvider';
import {
  CART_STORAGE_KEY,
  type StorageLike,
  serializeCart,
} from './cart-storage';
import type { CartLine, NewCartLine } from './types';
import { useCart } from './useCart';

function newLine(): NewCartLine {
  return {
    productId: 'p1',
    brand: 'Apple',
    name: 'iPhone 15 Pro',
    imageUrl: 'img.webp',
    storage: { capacity: '256 GB', price: 959.42 },
    color: { name: 'Black', hexCode: '#000000' },
  };
}

function line(lineId: string): CartLine {
  return { lineId, ...newLine() };
}

function memoryStorage(initial: Record<string, string> = {}): StorageLike & {
  map: Map<string, string>;
} {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

function Probe() {
  const { itemCount, lines, addLine, removeLine } = useCart();
  return (
    <div>
      <span data-testid="count">{itemCount}</span>
      <button type="button" onClick={() => addLine(newLine())}>
        add
      </button>
      <button type="button" onClick={() => removeLine(lines[0]?.lineId ?? '')}>
        remove first
      </button>
    </div>
  );
}

function renderWithProvider(storage?: StorageLike) {
  return render(
    <CartProvider storage={storage}>
      <Probe />
    </CartProvider>,
  );
}

describe('CartProvider', () => {
  it('reads the initial state from storage on the first render', () => {
    const storage = memoryStorage({
      [CART_STORAGE_KEY]: serializeCart([line('a'), line('b')]),
    });
    renderWithProvider(storage);
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('writes after add and after remove', async () => {
    const storage = memoryStorage();
    renderWithProvider(storage);
    await userEvent.click(screen.getByRole('button', { name: 'add' }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    const stored = storage.map.get(CART_STORAGE_KEY);
    expect(stored).toBeDefined();
    expect(JSON.parse(stored as string).lines).toHaveLength(1);

    await userEvent.click(screen.getByRole('button', { name: 'remove first' }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(
      JSON.parse(storage.map.get(CART_STORAGE_KEY) as string).lines,
    ).toHaveLength(0);
  });

  it('starts empty and prints nothing when reading throws', () => {
    const log = jest.spyOn(console, 'log');
    const warn = jest.spyOn(console, 'warn');
    const error = jest.spyOn(console, 'error');
    const storage: StorageLike = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {},
    };
    renderWithProvider(storage);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(log).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('keeps working in memory and prints nothing when writing throws', async () => {
    const log = jest.spyOn(console, 'log');
    const warn = jest.spyOn(console, 'warn');
    const error = jest.spyOn(console, 'error');
    const storage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
    };
    renderWithProvider(storage);
    await userEvent.click(screen.getByRole('button', { name: 'add' }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(log).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('replaces the state on a storage event for the cart key without writing back', () => {
    const storage = memoryStorage();
    renderWithProvider(storage);
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: CART_STORAGE_KEY,
          newValue: serializeCart([line('x')]),
        }),
      );
    });
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(storage.map.has(CART_STORAGE_KEY)).toBe(false);
  });

  it('ignores a storage event for another key', () => {
    const storage = memoryStorage();
    renderWithProvider(storage);
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'other:key',
          newValue: serializeCart([line('x')]),
        }),
      );
    });
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('empties the cart when the key is removed in another tab', () => {
    const storage = memoryStorage({
      [CART_STORAGE_KEY]: serializeCart([line('a')]),
    });
    renderWithProvider(storage);
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: CART_STORAGE_KEY,
          newValue: null,
        }),
      );
    });
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('throws a clear error when useCart is used outside the provider', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(
      'useCart must be used within a CartProvider',
    );
    errorSpy.mockRestore();
  });
});
