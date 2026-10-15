import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Location, NavigateFunction } from 'react-router-dom';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { AppRoutes } from '../../app/router';

type MockRequest = {
  url: string;
  signal?: AbortSignal;
  resolve: (response: unknown) => void;
  reject: (error: unknown) => void;
};

let requests: MockRequest[] = [];
let currentLocation: Location;
let navigate: NavigateFunction;

function LocationSpy() {
  currentLocation = useLocation();
  return null;
}

function NavigateSpy() {
  navigate = useNavigate();
  return null;
}

function setupFetch({ ignoreAbort = false } = {}) {
  requests = [];
  global.fetch = jest.fn((input: unknown, init?: RequestInit) => {
    const request = {} as MockRequest;
    request.url = String(input);
    request.signal = init?.signal ?? undefined;
    const promise = new Promise((resolve, reject) => {
      request.resolve = resolve;
      request.reject = reject;
      if (!ignoreAbort) {
        request.signal?.addEventListener('abort', () => {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          reject(error);
        });
      }
    });
    requests.push(request);
    return promise;
  }) as unknown as typeof fetch;
}

function jsonResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => body };
}

function requestAt(index: number): MockRequest {
  const request = requests[index];
  if (!request) {
    throw new Error(`No request recorded at index ${index}`);
  }
  return request;
}

function respond(index: number, body: unknown) {
  requestAt(index).resolve(jsonResponse(body));
}

function makeProducts(count: number, prefix = 'p') {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}${i + 1}`,
    brand: `Brand${i + 1}`,
    name: `Phone ${i + 1}`,
    basePrice: 1000 + i,
    imageUrl: `https://example.com/${prefix}${i + 1}.jpg`,
  }));
}

function productLinks() {
  return screen
    .getAllByRole('link')
    .filter((link) => link.getAttribute('href')?.startsWith('/products/'));
}

function linkAt(index: number): HTMLElement {
  const link = productLinks()[index];
  if (!link) {
    throw new Error(`No product link at index ${index}`);
  }
  return link;
}

function renderCatalog(entry = '/') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <LocationSpy />
      <NavigateSpy />
      <AppRoutes />
    </MemoryRouter>,
  );
}

function setupUser() {
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
}

beforeEach(() => {
  jest.useFakeTimers();
  setupFetch();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('catalog initial load', () => {
  it('requests /api/products?limit=20 and renders 20 cards with a counter', async () => {
    renderCatalog('/');
    expect(requests).toHaveLength(1);
    expect(requestAt(0).url).toBe('/api/products?limit=20');

    respond(0, makeProducts(20));
    await waitFor(() => {
      expect(screen.getByText('20 RESULTS')).toBeInTheDocument();
    });

    const links = productLinks();
    expect(links).toHaveLength(20);
    expect(links[0]).toHaveAttribute('href', '/products/p1');
    expect(links[0]).toHaveAccessibleName(/Brand1 Phone 1/);
    expect(links[19]).toHaveAttribute('href', '/products/p20');
  });

  it('marks the first five card images eager and the rest lazy', async () => {
    renderCatalog('/');
    respond(0, makeProducts(20));
    await waitFor(() => {
      expect(screen.getByText('20 RESULTS')).toBeInTheDocument();
    });
    expect(linkAt(0).querySelector('img')).toHaveAttribute('loading', 'eager');
    expect(linkAt(4).querySelector('img')).toHaveAttribute('loading', 'eager');
    expect(linkAt(5).querySelector('img')).toHaveAttribute('loading', 'lazy');
    expect(linkAt(0).querySelector('img')).toHaveAttribute('alt', '');
  });

  it('shows LOADING and no grid before the first response', () => {
    renderCatalog('/');
    expect(screen.getByText('LOADING...')).toBeInTheDocument();
    expect(productLinks()).toHaveLength(0);
  });
});

describe('catalog search', () => {
  it('sends one debounced request for rapid typing', async () => {
    const user = setupUser();
    renderCatalog('/');
    respond(0, makeProducts(20));
    await waitFor(() =>
      expect(screen.getByText('20 RESULTS')).toBeInTheDocument(),
    );

    const input = screen.getByRole('searchbox');
    await user.type(input, 'sam');
    expect(requests).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(300);
    });
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requestAt(1).url).toBe('/api/products?limit=20&search=sam');

    respond(1, makeProducts(6, 'sam'));
    await waitFor(() =>
      expect(screen.getByText('6 RESULTS')).toBeInTheDocument(),
    );
    expect(productLinks()).toHaveLength(6);
  });

  it('keeps previous cards and marks the region busy while a search is pending', async () => {
    const user = setupUser();
    renderCatalog('/');
    respond(0, makeProducts(20));
    await waitFor(() =>
      expect(screen.getByText('20 RESULTS')).toBeInTheDocument(),
    );

    await user.type(screen.getByRole('searchbox'), 'sam');
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(productLinks()).toHaveLength(20);
    expect(screen.getByText('20 RESULTS')).toBeInTheDocument();
    expect(screen.getByTestId('catalog-results')).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('ignores a superseded response that arrives later', async () => {
    setupFetch({ ignoreAbort: true });
    const user = setupUser();
    renderCatalog('/');
    respond(0, makeProducts(20));
    await waitFor(() =>
      expect(screen.getByText('20 RESULTS')).toBeInTheDocument(),
    );

    const input = screen.getByRole('searchbox');
    await user.type(input, 'sam');
    act(() => {
      jest.advanceTimersByTime(300);
    });
    await user.type(input, 'more');
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(requestAt(1).url).toBe('/api/products?limit=20&search=sam');
    expect(requestAt(2).url).toBe('/api/products?limit=20&search=sammore');

    respond(2, makeProducts(3, 'new'));
    await waitFor(() =>
      expect(screen.getByText('3 RESULTS')).toBeInTheDocument(),
    );

    respond(1, makeProducts(6, 'old'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText('3 RESULTS')).toBeInTheDocument();
    expect(productLinks()).toHaveLength(3);
    expect(productLinks()[0]).toHaveAttribute('href', '/products/new1');
  });

  it('treats whitespace-only input as an empty search', async () => {
    const user = setupUser();
    renderCatalog('/');
    respond(0, makeProducts(20));
    await waitFor(() =>
      expect(screen.getByText('20 RESULTS')).toBeInTheDocument(),
    );

    await user.type(screen.getByRole('searchbox'), '   ');
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(screen.getByRole('searchbox')).toHaveValue('   ');
    expect(requests).toHaveLength(1);
    expect(requestAt(0).url).toBe('/api/products?limit=20');
    expect(screen.getByText('20 RESULTS')).toBeInTheDocument();
  });
});

describe('catalog clear button', () => {
  it('is absent when empty and present with text', async () => {
    const user = setupUser();
    renderCatalog('/');
    respond(0, makeProducts(20));
    await waitFor(() =>
      expect(screen.getByText('20 RESULTS')).toBeInTheDocument(),
    );

    expect(
      screen.queryByRole('button', { name: 'Clear search' }),
    ).not.toBeInTheDocument();
    await user.type(screen.getByRole('searchbox'), 'a');
    expect(
      screen.getByRole('button', { name: 'Clear search' }),
    ).toBeInTheDocument();
  });

  it('clears the field, requests the full list immediately and refocuses', async () => {
    const user = setupUser();
    renderCatalog('/');
    respond(0, makeProducts(20));
    await waitFor(() =>
      expect(screen.getByText('20 RESULTS')).toBeInTheDocument(),
    );

    await user.type(screen.getByRole('searchbox'), 'sam');
    act(() => {
      jest.advanceTimersByTime(300);
    });
    respond(1, makeProducts(6, 'sam'));
    await waitFor(() =>
      expect(screen.getByText('6 RESULTS')).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    const input = screen.getByRole('searchbox');
    expect(input).toHaveValue('');
    expect(requests).toHaveLength(3);
    expect(requestAt(2).url).toBe('/api/products?limit=20');
    expect(document.activeElement).toBe(input);
  });
});

describe('catalog counter states', () => {
  it('shows 1 RESULT for a single product', async () => {
    renderCatalog('/');
    respond(0, makeProducts(1));
    await waitFor(() =>
      expect(screen.getByText('1 RESULT')).toBeInTheDocument(),
    );
  });

  it('shows 0 RESULTS and the empty message', async () => {
    renderCatalog('/?q=zzz');
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requestAt(0).url).toBe('/api/products?limit=20&search=zzz');
    respond(0, []);
    await waitFor(() =>
      expect(screen.getByText('0 RESULTS')).toBeInTheDocument(),
    );
    expect(
      screen.getByText('No smartphones found for "zzz".'),
    ).toBeInTheDocument();
  });
});

describe('catalog error state', () => {
  it('shows the alert and RETRY, then recovers and focuses the search', async () => {
    const user = setupUser();
    renderCatalog('/');
    const networkError = new Error('network down');
    requestAt(0).reject(networkError);

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'COULD NOT LOAD SMARTPHONES',
      ),
    );
    expect(screen.queryByText(/RESULTS/)).not.toBeInTheDocument();
    expect(productLinks()).toHaveLength(0);
    expect(screen.queryByText(/network down/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'RETRY' }));
    expect(requests).toHaveLength(2);
    expect(requestAt(1).url).toBe('/api/products?limit=20');
    expect(screen.getByText('LOADING...')).toBeInTheDocument();

    respond(1, makeProducts(20));
    await waitFor(() =>
      expect(screen.getByText('20 RESULTS')).toBeInTheDocument(),
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole('searchbox'));
  });
});

describe('catalog URL sync', () => {
  it('initializes from ?q= and requests that term', async () => {
    renderCatalog('/?q=samsung');
    expect(screen.getByRole('searchbox')).toHaveValue('samsung');
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requestAt(0).url).toBe('/api/products?limit=20&search=samsung');
  });

  it('writes ?q= with replace so Back does not step through terms', async () => {
    const user = setupUser();
    renderCatalog('/');
    respond(0, makeProducts(20));
    await waitFor(() =>
      expect(screen.getByText('20 RESULTS')).toBeInTheDocument(),
    );

    await user.type(screen.getByRole('searchbox'), 'samsung');
    act(() => {
      jest.advanceTimersByTime(300);
    });
    await waitFor(() => expect(currentLocation.search).toBe('?q=samsung'));

    act(() => {
      navigate(-1);
    });
    expect(screen.getByRole('searchbox')).toHaveValue('samsung');
  });

  it('removes ?q= when the search is cleared', async () => {
    const user = setupUser();
    renderCatalog('/?q=samsung');
    respond(0, makeProducts(6, 'samsung'));
    await waitFor(() =>
      expect(screen.getByText('6 RESULTS')).toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    await waitFor(() => expect(currentLocation.search).toBe(''));
  });
});
