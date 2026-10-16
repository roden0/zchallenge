import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import {
  CartProvider,
  type NewCartLine,
  type StorageLike,
  useCart,
} from '../../shared/cart';
import { AppLayout } from './AppLayout';

const sampleLine: NewCartLine = {
  productId: 'p1',
  brand: 'Apple',
  name: 'iPhone 15 Pro',
  imageUrl: 'img.webp',
  storage: { capacity: '256 GB', price: 959.42 },
  color: { name: 'Black', hexCode: '#000000' },
};

function AddFirstLine() {
  const { addLine } = useCart();
  return (
    <button type="button" onClick={() => addLine(sampleLine)}>
      add first
    </button>
  );
}

function renderLayout() {
  const map = new Map<string, string>();
  const storage: StorageLike = {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
  return render(
    <MemoryRouter>
      <CartProvider storage={storage}>
        <AppLayout />
        <AddFirstLine />
      </CartProvider>
    </MemoryRouter>,
  );
}

describe('AppLayout cart count', () => {
  it('shows 0 and the inactive icon for an empty cart', () => {
    renderLayout();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByTestId('bag-inactive')).toBeInTheDocument();
  });

  it('badge and icon follow the cart when a line is added', async () => {
    renderLayout();
    await userEvent.click(screen.getByRole('button', { name: 'add first' }));
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByTestId('bag-active')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Cart, 1 item' }),
    ).toBeInTheDocument();
  });
});
