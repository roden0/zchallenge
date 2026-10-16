import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import {
  type CartLine,
  CartProvider,
  type StorageLike,
} from '../../shared/cart';
import {
  CART_STORAGE_KEY,
  serializeCart,
} from '../../shared/cart/cart-storage';
import { CartPage } from './CartPage';

function memoryStorage(initial: Record<string, string> = {}): StorageLike {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

function line(overrides: Partial<CartLine> = {}): CartLine {
  return {
    lineId: 'line-1',
    productId: 'p1',
    brand: 'Apple',
    name: 'iPhone 15 Pro',
    imageUrl: 'img.webp',
    storage: { capacity: '256 GB', price: 959.42 },
    color: { name: 'Black', hexCode: '#000000' },
    ...overrides,
  };
}

function renderCart(lines: CartLine[]) {
  const storage = memoryStorage(
    lines.length === 0 ? {} : { [CART_STORAGE_KEY]: serializeCart(lines) },
  );
  return {
    storage,
    ...render(
      <MemoryRouter initialEntries={['/cart']}>
        <CartProvider storage={storage}>
          <CartPage />
        </CartProvider>
      </MemoryRouter>,
    ),
  };
}

describe('CartPage', () => {
  it('shows the line count and each line image, name, options and price', () => {
    const { container } = renderCart([
      line({ storage: { capacity: '256GB', price: 959.42 } }),
    ]);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'CART (1)',
    );

    const image = container.querySelector('img');
    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('src', 'img.webp');

    expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
    expect(screen.getByText('256 GB | Black')).toBeInTheDocument();
    expect(screen.getByText('959,42 EUR')).toBeInTheDocument();
  });

  it('gives distinct remove button names to two lines of the same phone', () => {
    renderCart([
      line({ lineId: 'a', color: { name: 'Black', hexCode: '#000000' } }),
      line({ lineId: 'b', color: { name: 'White', hexCode: '#ffffff' } }),
    ]);

    expect(
      screen.getByRole('button', {
        name: 'Eliminar iPhone 15 Pro, 256 GB, Black',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Eliminar iPhone 15 Pro, 256 GB, White',
      }),
    ).toBeInTheDocument();
  });

  it('removes a line and updates the heading, total and status', async () => {
    const user = userEvent.setup();
    renderCart([
      line({ lineId: 'a', storage: { capacity: '256 GB', price: 959.42 } }),
      line({
        lineId: 'b',
        name: 'Galaxy S24',
        storage: { capacity: '128 GB', price: 117.29 },
        color: { name: 'White', hexCode: '#ffffff' },
      }),
    ]);

    await user.click(
      screen.getByRole('button', { name: /Eliminar iPhone 15 Pro/ }),
    );

    expect(screen.queryByText('iPhone 15 Pro')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'CART (1)',
    );
    expect(screen.getByText('117,29 EUR')).toBeInTheDocument();
    expect(
      screen.getByText('iPhone 15 Pro removed from cart.'),
    ).toBeInTheDocument();
  });

  it('moves focus to the next line after removing the first line', async () => {
    const user = userEvent.setup();
    renderCart([
      line({ lineId: 'a', name: 'Alpha' }),
      line({ lineId: 'b', name: 'Beta' }),
      line({ lineId: 'c', name: 'Gamma' }),
    ]);

    await user.click(screen.getByRole('button', { name: /Eliminar Alpha/ }));

    expect(screen.getByRole('button', { name: /Eliminar Beta/ })).toHaveFocus();
  });

  it('moves focus to the line that took the place of a removed middle line', async () => {
    const user = userEvent.setup();
    renderCart([
      line({ lineId: 'a', name: 'Alpha' }),
      line({ lineId: 'b', name: 'Beta' }),
      line({ lineId: 'c', name: 'Gamma' }),
    ]);

    await user.click(screen.getByRole('button', { name: /Eliminar Beta/ }));

    expect(
      screen.getByRole('button', { name: /Eliminar Gamma/ }),
    ).toHaveFocus();
  });

  it('moves focus to the previous line after removing the last line', async () => {
    const user = userEvent.setup();
    renderCart([
      line({ lineId: 'a', name: 'Alpha' }),
      line({ lineId: 'b', name: 'Beta' }),
    ]);

    await user.click(screen.getByRole('button', { name: /Eliminar Beta/ }));

    expect(
      screen.getByRole('button', { name: /Eliminar Alpha/ }),
    ).toHaveFocus();
  });

  it('moves focus to the heading when the only line is removed', async () => {
    const user = userEvent.setup();
    renderCart([line({ name: 'Alpha' })]);

    await user.click(screen.getByRole('button', { name: /Eliminar Alpha/ }));

    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
  });

  it('shows the total of two decimal prices', () => {
    renderCart([
      line({ lineId: 'a', storage: { capacity: '256 GB', price: 959.42 } }),
      line({
        lineId: 'b',
        name: 'Galaxy S24',
        storage: { capacity: '128 GB', price: 117.29 },
        color: { name: 'White', hexCode: '#ffffff' },
      }),
    ]);

    expect(screen.getByText(/1076,71 EUR/)).toBeInTheDocument();
  });

  it('keeps two identical configurations separate and removes only one', async () => {
    const user = userEvent.setup();
    renderCart([line({ lineId: 'a' }), line({ lineId: 'b' })]);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'CART (2)',
    );
    const removeButtons = screen.getAllByRole('button', { name: /Eliminar/ });
    expect(removeButtons).toHaveLength(2);

    await user.click(removeButtons[0] as HTMLElement);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'CART (1)',
    );
    expect(screen.getAllByRole('button', { name: /Eliminar/ })).toHaveLength(1);
  });

  it('shows only the heading and the continue link when empty', () => {
    renderCart([]);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'CART (0)',
    );
    expect(
      screen.getByRole('link', { name: 'CONTINUE SHOPPING' }),
    ).toHaveAttribute('href', '/');
    expect(screen.queryByText(/TOTAL/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'PAY' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('links CONTINUE SHOPPING to the catalog root', () => {
    renderCart([line()]);

    expect(
      screen.getByRole('link', { name: 'CONTINUE SHOPPING' }),
    ).toHaveAttribute('href', '/');
  });

  it('shows the checkout notice on PAY without navigating', async () => {
    const user = userEvent.setup();
    renderCart([line()]);

    await user.click(screen.getByRole('button', { name: 'PAY' }));

    expect(
      screen.getByText('CHECKOUT IS NOT AVAILABLE IN THIS DEMO.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'CART (1)',
    );
  });

  it('renders the lines from stored state after a remount', () => {
    const storage = memoryStorage({
      [CART_STORAGE_KEY]: serializeCart([line()]),
    });
    const tree = (
      <MemoryRouter initialEntries={['/cart']}>
        <CartProvider storage={storage}>
          <CartPage />
        </CartProvider>
      </MemoryRouter>
    );

    const { unmount } = render(tree);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'CART (1)',
    );
    unmount();

    render(tree);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'CART (1)',
    );
    expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
  });

  it('sets the document title', () => {
    renderCart([]);

    expect(document.title).toBe('Cart | MBST');
  });
});
