import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './router';

describe('Routing', () => {
  it.each([
    ['/', 'Smartphones'],
    ['/products/XMI-RN13P5G', 'Product'],
    ['/cart', 'Cart'],
  ])('renders %s inside main with exactly one h1', (path, h1Text) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    const main = screen.getByRole('main');
    expect(
      within(main).getByRole('heading', { level: 1, name: h1Text }),
    ).toBeInTheDocument();
    expect(within(main).getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('unknown path shows not-found with a link to /', () => {
    render(
      <MemoryRouter initialEntries={['/does-not-exist']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to home' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it.each(['/', '/products/XMI-RN13P5G', '/cart', '/nope'])(
    'header is present on route %s',
    (path) => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>,
      );
      expect(screen.getByRole('banner')).toBeInTheDocument();
    },
  );
});
