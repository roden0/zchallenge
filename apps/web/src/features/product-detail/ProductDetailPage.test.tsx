import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ProductDetail } from 'contracts';
import type { NavigateFunction } from 'react-router-dom';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { AppRoutes } from '../../app/router';
import { CART_STORAGE_KEY } from '../../shared/cart/cart-storage';

type MockRequest = {
  url: string;
  signal?: AbortSignal;
  resolve: (response: unknown) => void;
  reject: (error: unknown) => void;
};

let requests: MockRequest[] = [];
let navigate: NavigateFunction;

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

function errorResponse(status: number) {
  return {
    ok: false,
    status,
    json: async () => ({ error: 'ERROR', message: 'upstream message' }),
  };
}

function invalidJsonResponse() {
  return {
    ok: true,
    status: 200,
    json: async () => {
      throw new Error('invalid json');
    },
  };
}

function requestAt(index: number): MockRequest {
  const request = requests[index];
  if (!request) {
    throw new Error(`No request recorded at index ${index}`);
  }
  return request;
}

function respond(index: number, response: unknown) {
  requestAt(index).resolve(response);
}

function makeProduct(overrides: Partial<ProductDetail> = {}): ProductDetail {
  return {
    id: 'SMG-S24U',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    description: 'A flagship phone',
    basePrice: 1329,
    rating: 4.8,
    specs: {
      screen: '6.8"',
      resolution: '3120 x 1440',
      processor: 'Snapdragon 8 Gen 3',
      mainCamera: '200 MP',
      selfieCamera: '12 MP',
      battery: '5000 mAh',
      os: 'Android 14',
      screenRefreshRate: '120 Hz',
    },
    colorOptions: [
      {
        name: 'Titanium Gray',
        hexCode: '#808080',
        imageUrl: 'https://example.com/gray.jpg',
      },
      {
        name: 'Titanium Blue',
        hexCode: '#1F3A5F',
        imageUrl: 'https://example.com/blue.jpg',
      },
    ],
    storageOptions: [
      { capacity: '256 GB', price: 1329 },
      { capacity: '512 GB', price: 1449 },
    ],
    similarProducts: [],
    ...overrides,
  };
}

function renderDetail(entry = '/products/SMG-S24U') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <NavigateSpy />
      <AppRoutes />
    </MemoryRouter>,
  );
}

async function loadProduct(product = makeProduct()) {
  renderDetail(`/products/${product.id}`);
  expect(requests).toHaveLength(1);
  respond(0, jsonResponse(product));
  await waitFor(() =>
    expect(
      screen.getByRole('heading', { level: 1, name: product.name }),
    ).toBeInTheDocument(),
  );
  return product;
}

beforeEach(() => {
  localStorage.clear();
  setupFetch();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('detail data states', () => {
  it('requests the URL-encoded id and shows loading with the back link', () => {
    renderDetail('/products/SMG-S24U');
    expect(requestAt(0).url).toBe('/api/products/SMG-S24U');
    expect(screen.getByRole('status')).toHaveTextContent('LOADING...');
    expect(screen.getByRole('link', { name: 'BACK' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(
      screen.queryByRole('heading', { level: 1, name: 'Galaxy S24 Ultra' }),
    ).not.toBeInTheDocument();
  });

  it('URL-encodes an id that needs it', () => {
    renderDetail('/products/a b');
    expect(requestAt(0).url).toBe('/api/products/a%20b');
  });

  it('sets the loading and loaded document titles', async () => {
    renderDetail('/products/SMG-S24U');
    expect(document.title).toBe('Product | MBST');
    respond(0, jsonResponse(makeProduct()));
    await waitFor(() => expect(document.title).toBe('Galaxy S24 Ultra | MBST'));
  });

  it('shows the not-found state and title for 404 and 400', async () => {
    renderDetail('/products/NOPE');
    respond(0, errorResponse(404));
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'PRODUCT NOT FOUND' }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole('link', { name: 'BACK' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'RETRY' }),
    ).not.toBeInTheDocument();
    expect(document.title).toBe('Product not found | MBST');
  });

  it('shows the error state for a 502 without leaking the message', async () => {
    renderDetail('/products/SMG-S24U');
    respond(0, errorResponse(502));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'COULD NOT LOAD PRODUCT',
      ),
    );
    expect(document.title).toBe('Product | MBST');
    expect(screen.queryByText(/upstream message/i)).not.toBeInTheDocument();
    expect(screen.queryByText('502')).not.toBeInTheDocument();
  });

  it('shows the error state for a network failure', async () => {
    renderDetail('/products/SMG-S24U');
    requestAt(0).reject(new Error('network down'));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'COULD NOT LOAD PRODUCT',
      ),
    );
    expect(screen.queryByText(/network down/i)).not.toBeInTheDocument();
  });

  it('shows the error state for invalid JSON', async () => {
    renderDetail('/products/SMG-S24U');
    respond(0, invalidJsonResponse());
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'COULD NOT LOAD PRODUCT',
      ),
    );
  });

  it('retries the request and returns to loading', async () => {
    const user = userEvent.setup();
    renderDetail('/products/SMG-S24U');
    requestAt(0).reject(new Error('network down'));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'RETRY' }));
    expect(requests).toHaveLength(2);
    expect(requestAt(1).url).toBe('/api/products/SMG-S24U');
    expect(screen.getByRole('status')).toHaveTextContent('LOADING...');

    respond(1, jsonResponse(makeProduct()));
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Galaxy S24 Ultra' }),
      ).toBeInTheDocument(),
    );
  });
});

describe('detail id change', () => {
  it('aborts the previous request and ignores a late response', async () => {
    setupFetch({ ignoreAbort: true });
    renderDetail('/products/SMG-S24U');
    const first = requestAt(0);

    act(() => {
      navigate('/products/APL-I15PM');
    });
    expect(requestAt(1).url).toBe('/api/products/APL-I15PM');
    expect(first.signal?.aborted).toBe(true);

    respond(
      1,
      jsonResponse(makeProduct({ id: 'APL-I15PM', name: 'iPhone 15' })),
    );
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'iPhone 15' }),
      ).toBeInTheDocument(),
    );

    respond(0, jsonResponse(makeProduct()));
    await act(async () => {
      await Promise.resolve();
    });
    expect(
      screen.getByRole('heading', { level: 1, name: 'iPhone 15' }),
    ).toBeInTheDocument();
  });

  it('resets the selections when the id changes', async () => {
    const user = userEvent.setup();
    await loadProduct();
    await user.click(screen.getByRole('radio', { name: /256 GB/ }));
    await user.click(screen.getByRole('radio', { name: 'Titanium Blue' }));
    expect(screen.getByText('1329,00 EUR')).toBeInTheDocument();

    act(() => {
      navigate('/products/APL-I15PM');
    });
    respond(
      1,
      jsonResponse(
        makeProduct({
          id: 'APL-I15PM',
          name: 'iPhone 15',
          basePrice: 999,
          storageOptions: [{ capacity: '128 GB', price: 999 }],
          colorOptions: [
            {
              name: 'Black',
              hexCode: '#000000',
              imageUrl: 'https://e.com/b.jpg',
            },
          ],
        }),
      ),
    );
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'iPhone 15' }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText('From 999,00 EUR')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AÑADIR' })).toBeDisabled();
  });
});

describe('detail layout and image', () => {
  it('shows one h1, the back link and the first color image', async () => {
    await loadProduct();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'BACK' })).toBeInTheDocument();
    const image = screen.getByRole('img', { name: 'Galaxy S24 Ultra' });
    expect(image).toHaveAttribute('src', 'https://example.com/gray.jpg');
  });

  it('follows the selected color with image and alt text', async () => {
    const user = userEvent.setup();
    await loadProduct();
    await user.click(screen.getByRole('radio', { name: 'Titanium Blue' }));
    const image = screen.getByRole('img', {
      name: 'Galaxy S24 Ultra, Titanium Blue',
    });
    expect(image).toHaveAttribute('src', 'https://example.com/blue.jpg');
  });
});

describe('detail specifications table', () => {
  it('renders the fixed row order with row headers', async () => {
    await loadProduct();
    const rows = screen.getAllByRole('rowheader');
    expect(rows.map((row) => row.textContent)).toEqual([
      'BRAND',
      'NAME',
      'DESCRIPTION',
      'SCREEN',
      'RESOLUTION',
      'PROCESSOR',
      'MAIN CAMERA',
      'SELFIE CAMERA',
      'BATTERY',
      'OS',
      'SCREEN REFRESH RATE',
    ]);
    expect(screen.getByRole('rowheader', { name: 'BRAND' })).toHaveAttribute(
      'scope',
      'row',
    );
    expect(screen.getByRole('heading', { level: 2, name: 'SPECIFICATIONS' }));
  });

  it('shows values as they come and hides the rating', async () => {
    await loadProduct(
      makeProduct({ name: 'edge 50 Pro', rating: 9.9, description: '' }),
    );
    const table = within(screen.getByRole('table'));
    expect(table.getByText('edge 50 Pro')).toBeInTheDocument();
    expect(table.getByText('-')).toBeInTheDocument();
    expect(table.queryByText('9.9')).not.toBeInTheDocument();
  });
});

describe('detail options', () => {
  it('selects nothing on load and keeps the button disabled', async () => {
    await loadProduct();
    expect(screen.getByRole('radio', { name: /256 GB/ })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /512 GB/ })).not.toBeChecked();
    expect(
      screen.getByRole('radio', { name: 'Titanium Gray' }),
    ).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'AÑADIR' })).toBeDisabled();
  });

  it('does not auto-select a single-option product', async () => {
    await loadProduct(
      makeProduct({
        storageOptions: [{ capacity: '128 GB', price: 999 }],
        colorOptions: [
          {
            name: 'Black',
            hexCode: '#000000',
            imageUrl: 'https://e.com/b.jpg',
          },
        ],
      }),
    );
    expect(screen.getByRole('radio', { name: /128 GB/ })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Black' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'AÑADIR' })).toBeDisabled();
  });

  it('keeps one selection per group', async () => {
    const user = userEvent.setup();
    await loadProduct();
    await user.click(screen.getByRole('radio', { name: /256 GB/ }));
    await user.click(screen.getByRole('radio', { name: /512 GB/ }));
    expect(screen.getByRole('radio', { name: /256 GB/ })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /512 GB/ })).toBeChecked();
  });

  it('normalizes capacity and exposes the price to assistive tech', async () => {
    await loadProduct(
      makeProduct({ storageOptions: [{ capacity: '128GB', price: 999.42 }] }),
    );
    const option = screen.getByRole('radio', { name: /128 GB/ });
    expect(option).toHaveAccessibleName('128 GB, 999,42 EUR');
  });

  it('gives each swatch the color name and falls back on an invalid hex', async () => {
    await loadProduct(
      makeProduct({
        colorOptions: [
          {
            name: 'Titanium Blue',
            hexCode: '#1F3A5F',
            imageUrl: 'https://e.com/blue.jpg',
          },
          {
            name: 'Broken',
            hexCode: 'not-a-color',
            imageUrl: 'https://e.com/broken.jpg',
          },
        ],
      }),
    );
    const swatch = screen
      .getByRole('radio', { name: 'Titanium Blue' })
      .parentElement?.querySelector('span');
    expect(swatch).toHaveStyle({ backgroundColor: '#1F3A5F' });

    const brokenSwatch = screen
      .getByRole('radio', { name: 'Broken' })
      .parentElement?.querySelector('span');
    expect(brokenSwatch).toHaveStyle({ backgroundColor: '#CCCCCC' });
  });

  it('shows the selected color name only after selection', async () => {
    const user = userEvent.setup();
    await loadProduct();
    expect(
      screen.queryByText('Titanium Blue', { selector: 'p' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Titanium Blue' }));
    expect(
      screen.getByText('Titanium Blue', { selector: 'p' }),
    ).toBeInTheDocument();
  });

  it('renders no group and stays disabled when an option list is empty', async () => {
    await loadProduct(makeProduct({ storageOptions: [], colorOptions: [] }));
    expect(
      screen.queryByRole('group', { name: /STORAGE/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('group', { name: /COLOR/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Galaxy S24 Ultra' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AÑADIR' })).toBeDisabled();
  });
});

describe('detail price', () => {
  it('shows From basePrice before and the option price after', async () => {
    const user = userEvent.setup();
    await loadProduct();
    expect(screen.getByText('From 1329,00 EUR')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /256 GB/ }));
    const price = screen.getByText('1329,00 EUR');
    expect(price).not.toHaveTextContent('From');
    await user.click(screen.getByRole('radio', { name: /512 GB/ }));
    expect(screen.getByText('1449,00 EUR')).toBeInTheDocument();
  });

  it('does not change the price when the color changes', async () => {
    const user = userEvent.setup();
    await loadProduct();
    await user.click(screen.getByRole('radio', { name: /256 GB/ }));
    await user.click(screen.getByRole('radio', { name: 'Titanium Blue' }));
    expect(screen.getByText('1329,00 EUR')).toBeInTheDocument();
  });

  it('formats decimals and handles identical prices', async () => {
    const user = userEvent.setup();
    await loadProduct(
      makeProduct({
        storageOptions: [
          { capacity: '256 GB', price: 959.42 },
          { capacity: '512 GB', price: 959.42 },
        ],
      }),
    );
    await user.click(screen.getByRole('radio', { name: /256 GB/ }));
    expect(screen.getByText('959,42 EUR')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /512 GB/ }));
    expect(screen.getByText('959,42 EUR')).toBeInTheDocument();
  });
});

describe('detail add to cart', () => {
  it('enables only when both options are selected and describes the hint', async () => {
    const user = userEvent.setup();
    await loadProduct();
    const button = screen.getByRole('button', { name: 'AÑADIR' });
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription(
      'Select a storage and a color to add this phone to the cart.',
    );

    await user.click(screen.getByRole('radio', { name: /256 GB/ }));
    expect(button).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Titanium Blue' }));
    expect(button).toBeEnabled();
  });

  it('adds the selected configuration and announces it', async () => {
    const user = userEvent.setup();
    await loadProduct();
    await user.click(screen.getByRole('radio', { name: /256 GB/ }));
    await user.click(screen.getByRole('radio', { name: 'Titanium Blue' }));
    await user.click(screen.getByRole('button', { name: 'AÑADIR' }));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Galaxy S24 Ultra added to cart.',
    );
    expect(
      screen.getByRole('link', { name: 'Cart, 1 item' }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(localStorage.getItem(CART_STORAGE_KEY)).not.toBeNull();
    });
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '{}');
    expect(stored.lines).toHaveLength(1);
    expect(stored.lines[0]).toMatchObject({
      productId: 'SMG-S24U',
      brand: 'Samsung',
      name: 'Galaxy S24 Ultra',
      imageUrl: 'https://example.com/blue.jpg',
      storage: { capacity: '256 GB', price: 1329 },
      color: { name: 'Titanium Blue', hexCode: '#1F3A5F' },
    });
  });

  it('keeps the selection and adds a line per activation', async () => {
    const user = userEvent.setup();
    await loadProduct();
    await user.click(screen.getByRole('radio', { name: /256 GB/ }));
    await user.click(screen.getByRole('radio', { name: 'Titanium Blue' }));
    await user.click(screen.getByRole('button', { name: 'AÑADIR' }));
    await user.click(screen.getByRole('button', { name: 'AÑADIR' }));

    expect(screen.getByRole('radio', { name: /256 GB/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Titanium Blue' })).toBeChecked();
    expect(
      screen.getByRole('link', { name: 'Cart, 2 items' }),
    ).toBeInTheDocument();
  });
});

describe('detail similar items', () => {
  const similarApple = {
    id: 'APL-IP13-128',
    brand: 'Apple',
    name: 'iPhone 13',
    basePrice: 1099,
    imageUrl: 'https://example.com/i13.jpg',
  };

  async function loadWithSimilar() {
    await loadProduct(makeProduct({ similarProducts: [similarApple] }));
  }

  function similarCard() {
    return screen.getByRole('link', {
      name: 'Apple iPhone 13, 1099,00 EUR',
    });
  }

  async function openSimilar() {
    const user = userEvent.setup();
    await user.click(similarCard());
    respond(
      1,
      jsonResponse(
        makeProduct({
          id: 'APL-IP13-128',
          name: 'iPhone 13',
          basePrice: 999,
          storageOptions: [{ capacity: '128 GB', price: 999 }],
          colorOptions: [
            {
              name: 'Black',
              hexCode: '#000000',
              imageUrl: 'https://e.com/b.jpg',
            },
          ],
        }),
      ),
    );
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'iPhone 13' }),
      ).toBeInTheDocument(),
    );
  }

  it('fetches the new id, aborts the previous request and resets the selections', async () => {
    const user = userEvent.setup();
    await loadWithSimilar();
    await user.click(screen.getByRole('radio', { name: /256 GB/ }));
    await user.click(screen.getByRole('radio', { name: 'Titanium Blue' }));
    expect(screen.getByText('1329,00 EUR')).toBeInTheDocument();

    const card = similarCard();
    expect(card).toHaveAttribute('href', '/products/APL-IP13-128');
    await user.click(card);

    expect(requests).toHaveLength(2);
    expect(requestAt(1).url).toBe('/api/products/APL-IP13-128');
    expect(requestAt(0).signal?.aborted).toBe(true);

    respond(
      1,
      jsonResponse(
        makeProduct({
          id: 'APL-IP13-128',
          name: 'iPhone 13',
          basePrice: 999,
          storageOptions: [{ capacity: '128 GB', price: 999 }],
          colorOptions: [
            {
              name: 'Black',
              hexCode: '#000000',
              imageUrl: 'https://e.com/b.jpg',
            },
          ],
        }),
      ),
    );

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'iPhone 13' }),
      ).toBeInTheDocument(),
    );
    expect(document.title).toBe('iPhone 13 | MBST');
    expect(screen.getByText('From 999,00 EUR')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AÑADIR' })).toBeDisabled();
    expect(
      screen.queryByRole('radio', { name: 'Titanium Blue' }),
    ).not.toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole('main'));
  });

  it('returns to the previous product with Back', async () => {
    await loadWithSimilar();
    await openSimilar();

    act(() => {
      navigate(-1);
    });
    expect(requestAt(2).url).toBe('/api/products/SMG-S24U');

    respond(2, jsonResponse(makeProduct()));
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Galaxy S24 Ultra' }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText('From 1329,00 EUR')).toBeInTheDocument();
  });

  it('renders no card for the product currently shown', async () => {
    await loadWithSimilar();
    const row = screen.getByRole('list');
    const hrefs = within(row)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(['/products/APL-IP13-128']);
    expect(hrefs).not.toContain('/products/SMG-S24U');
  });
});
