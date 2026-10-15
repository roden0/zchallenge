import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './router';

describe('Navigation', () => {
  it('after navigating, focus is on main and scroll resets', async () => {
    const scrollTo = jest.fn();
    (window as unknown as { scrollTo: typeof scrollTo }).scrollTo = scrollTo;
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    const main = screen.getByRole('main');
    expect(document.activeElement).not.toBe(main);

    await user.click(screen.getByRole('link', { name: 'Cart, 0 items' }));
    expect(document.activeElement).toBe(main);
    expect(scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'auto',
    });
  });

  it('first render does not steal focus', () => {
    const scrollTo = jest.fn();
    (window as unknown as { scrollTo: typeof scrollTo }).scrollTo = scrollTo;
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    const main = screen.getByRole('main');
    expect(document.activeElement).not.toBe(main);
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
