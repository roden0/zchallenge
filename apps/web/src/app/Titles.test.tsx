import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './router';

describe('Titles', () => {
  it.each([
    ['/', 'Smartphones | MBST'],
    ['/products/XMI-RN13P5G', 'Product | MBST'],
    ['/cart', 'Cart | MBST'],
    ['/unknown', 'Page not found | MBST'],
  ])('sets title for %s', (path, title) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(document.title).toBe(title);
  });
});
