import { createServer, type Server, type ServerResponse } from 'node:http';
import { expect } from 'chai';
import type { ProductSummary } from 'contracts';
import { createUpstreamClient } from './upstream-client.js';

const FAKE_KEY = 'test-key-4f9a1c-LEAK-CANARY';

const SUMMARY: ProductSummary = {
  id: 'APL-IP13-128',
  brand: 'Apple',
  name: 'iPhone 13',
  basePrice: 699,
  imageUrl: 'https://cdn.example.test/iphone-13.jpg',
};

interface Recorded {
  url: string;
  apiKey: string | undefined;
}

type Handler = (response: ServerResponse, request: Recorded) => void;

const running: Server[] = [];

async function startServer(handler: Handler): Promise<string> {
  const server = createServer((request, response) => {
    const recorded: Recorded = {
      url: request.url ?? '',
      apiKey: request.headers['x-api-key'] as string | undefined,
    };
    handler(response, recorded);
  });
  running.push(server);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('expected an ephemeral port');
  }

  return `http://127.0.0.1:${address.port}`;
}

function client(baseUrl: string, timeoutMs = 2000) {
  return createUpstreamClient({
    baseUrl,
    apiKey: FAKE_KEY,
    timeoutMs,
    fetch: globalThis.fetch,
  });
}

async function unusedBaseUrl(): Promise<string> {
  const server = createServer(() => {});
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  await new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });
  if (address === null || typeof address === 'string') {
    throw new Error('expected an ephemeral port');
  }
  return `http://127.0.0.1:${address.port}`;
}

afterEach(async () => {
  await Promise.all(
    running.splice(0).map(
      (server) =>
        new Promise<void>((resolve) => {
          server.closeAllConnections();
          server.close(() => {
            resolve();
          });
        }),
    ),
  );
});

describe('createUpstreamClient', () => {
  it('sends x-api-key and requests only the search query', async () => {
    let seen: Recorded = { url: '', apiKey: undefined };
    const baseUrl = await startServer((response, recorded) => {
      seen = recorded;
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify([SUMMARY]));
    });

    const result = await client(baseUrl).listProducts({ search: 'sam' });

    expect(result.ok).to.equal(true);
    expect(seen.url).to.equal('/products?search=sam');
    expect(seen.apiKey).to.equal(FAKE_KEY);
  });

  it('omits the query when search is absent', async () => {
    let seen: Recorded = { url: '', apiKey: undefined };
    const baseUrl = await startServer((response, recorded) => {
      seen = recorded;
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify([SUMMARY]));
    });

    await client(baseUrl).listProducts({});

    expect(seen.url).to.equal('/products');
  });

  it('encodes the product id in the detail path', async () => {
    let seen: Recorded = { url: '', apiKey: undefined };
    const baseUrl = await startServer((response, recorded) => {
      seen = recorded;
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(
        JSON.stringify({
          ...SUMMARY,
          description: 'A phone',
          rating: 4.5,
          specs: {
            screen: '6.1',
            resolution: '1170x2532',
            processor: 'A15',
            mainCamera: '12',
            selfieCamera: '12',
            battery: '3240',
            os: 'iOS',
            screenRefreshRate: '60',
          },
          colorOptions: [
            {
              name: 'Midnight',
              hexCode: '#1C1C1E',
              imageUrl: 'https://cdn.example.test/m.jpg',
            },
          ],
          storageOptions: [{ capacity: '128GB', price: 699 }],
          similarProducts: [SUMMARY],
        }),
      );
    });

    const result = await client(baseUrl).getProduct('APL IP13');

    expect(result.ok).to.equal(true);
    expect(seen.url).to.equal('/products/APL%20IP13');
  });

  it('maps a timeout to 504', async () => {
    const baseUrl = await startServer((response) => {
      response.on('error', () => {});
      setTimeout(() => {
        if (response.destroyed) return;
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify([SUMMARY]));
      }, 250);
    });

    const result = await client(baseUrl, 50).listProducts({});

    expect(result.ok).to.equal(false);
    if (result.ok) return;
    expect(result.failure.status).to.equal(504);
    expect(result.failure.error.error).to.equal('GATEWAY_TIMEOUT');
  });

  it('maps a connection failure to 502', async () => {
    const result = await client(await unusedBaseUrl()).listProducts({});

    expect(result.ok).to.equal(false);
    if (result.ok) return;
    expect(result.failure.status).to.equal(502);
    expect(result.failure.error.error).to.equal('BAD_GATEWAY');
  });

  it('maps an upstream 401 to 502 without leaking the key', async () => {
    const baseUrl = await startServer((response) => {
      response.writeHead(401, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ message: 'unauthorized' }));
    });

    const result = await client(baseUrl).listProducts({});

    expect(result.ok).to.equal(false);
    if (result.ok) return;
    expect(result.failure.status).to.equal(502);
    expect(JSON.stringify(result.failure)).to.not.contain(FAKE_KEY);
  });

  it('maps an upstream 404 to 404', async () => {
    const baseUrl = await startServer((response) => {
      response.writeHead(404, { 'content-type': 'application/json' });
      response.end(JSON.stringify({}));
    });

    const result = await client(baseUrl).getProduct('UNKNOWN');

    expect(result.ok).to.equal(false);
    if (result.ok) return;
    expect(result.failure.status).to.equal(404);
    expect(result.failure.error.error).to.equal('NOT_FOUND');
  });

  it('maps a malformed payload to 502', async () => {
    const baseUrl = await startServer((response) => {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ unexpected: true }));
    });

    const result = await client(baseUrl).listProducts({});

    expect(result.ok).to.equal(false);
    if (result.ok) return;
    expect(result.failure.status).to.equal(502);
  });
});
