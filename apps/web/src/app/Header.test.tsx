import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './layout/Header/Header';

describe('Header', () => {
  it('logo link points to / and has accessible name "MBST, home"', () => {
    render(
      <MemoryRouter>
        <Header itemCount={0} />
      </MemoryRouter>,
    );
    const logo = screen.getByRole('link', { name: 'MBST, home' });
    expect(logo).toHaveAttribute('href', '/');
  });

  it('cart link points to /cart', () => {
    render(
      <MemoryRouter>
        <Header itemCount={0} />
      </MemoryRouter>,
    );
    const cart = screen.getByRole('link', { name: 'Cart, 0 items' });
    expect(cart).toHaveAttribute('href', '/cart');
  });

  it('with itemCount 0 shows inactive icon and name "Cart, 0 items"', () => {
    render(
      <MemoryRouter>
        <Header itemCount={0} />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('link', { name: 'Cart, 0 items' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('bag-inactive')).toBeInTheDocument();
  });

  it('with itemCount 1 shows active icon and name "Cart, 1 item"', () => {
    render(
      <MemoryRouter>
        <Header itemCount={1} />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('link', { name: 'Cart, 1 item' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('bag-active')).toBeInTheDocument();
  });

  it('with itemCount 3 shows name "Cart, 3 items"', () => {
    render(
      <MemoryRouter>
        <Header itemCount={3} />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('link', { name: 'Cart, 3 items' }),
    ).toBeInTheDocument();
  });

  it('icons are decorative (alt="")', () => {
    const { container } = render(
      <MemoryRouter>
        <Header itemCount={0} />
      </MemoryRouter>,
    );
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBeGreaterThan(0);
    imgs.forEach((img) => {
      expect(img).toHaveAttribute('alt', '');
    });
  });
});
