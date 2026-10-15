import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const product = {
    id: '123',
    brand: 'Apple',
    name: 'iPhone 13',
    basePrice: 1099,
    imageUrl: 'https://example.com/iphone.jpg',
  };

  it('renders product info and links correctly', () => {
    const { container } = render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/123');
    expect(link).toHaveAccessibleName('Apple iPhone 13, 1099,00 EUR');
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('iPhone 13')).toBeInTheDocument();
    expect(screen.getByText('1099,00 EUR')).toBeInTheDocument();
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('uses eager loading for first 5', () => {
    const { container } = render(
      <MemoryRouter>
        <ProductCard product={product} eager />
      </MemoryRouter>,
    );
    expect(container.querySelector('img')).toHaveAttribute('loading', 'eager');
  });
});
