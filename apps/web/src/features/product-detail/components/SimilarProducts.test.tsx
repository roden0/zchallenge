import { render, screen } from '@testing-library/react';
import type { ProductSummary } from 'contracts';
import { MemoryRouter } from 'react-router-dom';
import { SimilarProducts } from './SimilarProducts';

function makeProduct(
  id: string,
  name: string,
  basePrice = 999,
): ProductSummary {
  return {
    id,
    brand: 'Brand',
    name,
    basePrice,
    imageUrl: `https://example.com/${id}.jpg`,
  };
}

function renderRow(products: ProductSummary[]) {
  return render(
    <MemoryRouter>
      <SimilarProducts products={products} />
    </MemoryRouter>,
  );
}

describe('SimilarProducts', () => {
  it('renders one card per product in order with links to each detail', () => {
    renderRow([
      makeProduct('A', 'Alpha'),
      makeProduct('B', 'Beta'),
      makeProduct('C', 'Gamma'),
    ]);

    expect(
      screen.getByRole('heading', { level: 2, name: 'SIMILAR ITEMS' }),
    ).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/products/A',
      '/products/B',
      '/products/C',
    ]);
    expect(links.map((link) => link.textContent)).toEqual([
      'BrandAlpha999,00 EUR',
      'BrandBeta999,00 EUR',
      'BrandGamma999,00 EUR',
    ]);
  });

  it('renders nothing when there are no similar products', () => {
    const { container } = renderRow([]);

    expect(
      screen.queryByRole('heading', { level: 2, name: 'SIMILAR ITEMS' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  it('loads the first three images eagerly and the rest lazily', () => {
    const { container } = renderRow(
      ['A', 'B', 'C', 'D'].map((id) => makeProduct(id, id)),
    );

    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(4);
    expect([...images].map((img) => img.getAttribute('loading'))).toEqual([
      'eager',
      'eager',
      'eager',
      'lazy',
    ]);
  });
});
