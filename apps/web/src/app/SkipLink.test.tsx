import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './router';

describe('Skip link', () => {
  it('is first element reached by Tab and moves focus to main on activation', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    await user.tab();
    const skip = screen.getByRole('link', { name: 'Skip to content' });
    expect(document.activeElement).toBe(skip);

    await user.keyboard('{Enter}');
    const main = screen.getByRole('main');
    expect(document.activeElement).toBe(main);
  });
});
