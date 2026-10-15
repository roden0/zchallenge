import type { Server } from 'node:http';
import { expect } from 'chai';
import type { ProductDetail, ProductSummary } from 'contracts';
import { createApp } from '../app.js';
import type { Logger } from '../middleware/logger.js';
import type { UpstreamClient } from '../services/upstream-client.js';

const HOST = 'cdn.example.test';

const silentLogger: Logger = { info: () => {} };

function summary(
  id: string,
  imageUrl = `http://${HOST}/${id}.jpg`,
): ProductSummary {
  return { id, brand: 'Brand', name: id, basePrice: 100, imageUrl };
}

function makeProducts(count: number): ProductSummary[] {
  return Array.from({ length: count }, (_, index) => summary(`P${index}`));
}

function makeDetail(overrides: Partial<ProductDetail> = {}): ProductDetail {
  return {
    id: 'APL-IP13-128',
    brand: 'Apple',
    name: 'iPhone 13',
    description: 'A phone',
    basePrice: 699.99,
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
        imageUrl: `http://${HOST}/m.jpg`,
      },
    ],
    storageOptions: [{ capacity: '128GB', price: 699.99 }],
    similarProducts: [],
    ...overrides,
  };
}

interface FakeConfig {
  products?: ProductSummary[];
  detail?: ProductDetail;
  listThrows?: boolean;
}

function makeUpstream(config: FakeConfig = {}) {
  const calls = {
    list: [] as { search?: string }[],
    detail: [] as string[],
  };

  const upstream: UpstreamClient = {
    upstreamHost: HOST,
    async listProducts(params) {
      calls.list.push(params);
      if (config.listThrows === true) {
        throw new Error('boom');
      }
      return { ok: true, value: config.products ?? [] };
    },
    async getProduct(id) {
      calls.detail.push(id);
      if (config.detail !== undefined) {
        return { ok: true, value: config.detail };
      }
      return {
        ok: false,
        failure: {
          status: 404,
          error: { error: 'NOT_FOUND', message: 'Product not found' },
        },
      };
    },
  };

  return { upstream, calls };
}

const running: Server[] = [];

function startApp(upstream: UpstreamClient): Promise<string> {
  return new Promise((resolve) => {
    const app = createApp({ upstream, logger: silentLogger });
    const server = app.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (address === null || typeof address === 'string') {
        throw new Error('expected an ephemeral port');
      }
      resolve(`http://127.0.0.1:${address.port}`);
    });
    running.push(server);
  });
}

async function getId(body: unknown): Promise<string[]> {
  const products = body as ProductSummary[];
  return products.map((product) => product.id);
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

describe('GET /api/products', () => {
  it('returns the deduplicated list', async () => {
    const { upstream } = makeUpstream({
      products: [summary('A'), summary('A'), summary('B')],
    });
    const baseUrl = await startApp(upstream);

    const res = await fetch(`${baseUrl}/api/products`);

    expect(res.status).to.equal(200);
    expect(await getId(await res.json())).to.deep.equal(['A', 'B']);
  });

  it('forwards a trimmed search and omits an empty one', async () => {
    const { upstream, calls } = makeUpstream({ products: [] });
    const baseUrl = await startApp(upstream);

    await fetch(
      `${baseUrl}/api/products?search=${encodeURIComponent('  sam  ')}`,
    );
    await fetch(`${baseUrl}/api/products?search=${encodeURIComponent('   ')}`);

    expect(calls.list[0]?.search).to.equal('sam');
    expect(calls.list[1]?.search).to.equal(undefined);
  });

  it('applies offset then limit after dedupe', async () => {
    const { upstream } = makeUpstream({
      products: [
        summary('A'),
        summary('A'),
        summary('B'),
        summary('C'),
        summary('D'),
      ],
    });
    const baseUrl = await startApp(upstream);

    const res = await fetch(`${baseUrl}/api/products?offset=1&limit=2`);

    expect(await getId(await res.json())).to.deep.equal(['B', 'C']);
  });

  it('clamps a limit above MAX_LIMIT to 100', async () => {
    const { upstream } = makeUpstream({ products: makeProducts(120) });
    const baseUrl = await startApp(upstream);

    const res = await fetch(`${baseUrl}/api/products?limit=5000`);
    const body = (await res.json()) as ProductSummary[];

    expect(body).to.have.length(100);
  });

  it('rejects an invalid limit and offset', async () => {
    const { upstream } = makeUpstream({ products: [] });
    const baseUrl = await startApp(upstream);

    const badLimit = await fetch(`${baseUrl}/api/products?limit=abc`);
    const badOffset = await fetch(`${baseUrl}/api/products?offset=-1`);

    expect(badLimit.status).to.equal(400);
    expect(badOffset.status).to.equal(400);
  });

  it('rejects a repeated known parameter', async () => {
    const { upstream } = makeUpstream({ products: [] });
    const baseUrl = await startApp(upstream);

    const res = await fetch(`${baseUrl}/api/products?limit=1&limit=2`);

    expect(res.status).to.equal(400);
  });

  it('drops unknown parameters', async () => {
    const { upstream, calls } = makeUpstream({ products: [summary('A')] });
    const baseUrl = await startApp(upstream);

    const res = await fetch(`${baseUrl}/api/products?colour=blue`);

    expect(res.status).to.equal(200);
    expect(calls.list[0]?.search).to.equal(undefined);
  });

  it('returns an empty array when nothing matches', async () => {
    const { upstream } = makeUpstream({ products: [] });
    const baseUrl = await startApp(upstream);

    const res = await fetch(`${baseUrl}/api/products?search=zzzz`);

    expect(res.status).to.equal(200);
    expect(await res.json()).to.deep.equal([]);
  });

  it('rewrites upstream-host http images to https', async () => {
    const { upstream } = makeUpstream({
      products: [
        summary('A', `http://${HOST}/a.jpg`),
        summary('B', 'http://other.test/b.jpg'),
      ],
    });
    const baseUrl = await startApp(upstream);

    const body = (await (
      await fetch(`${baseUrl}/api/products`)
    ).json()) as ProductSummary[];

    expect(body[0]?.imageUrl).to.equal(`https://${HOST}/a.jpg`);
    expect(body[1]?.imageUrl).to.equal('http://other.test/b.jpg');
  });
});

describe('GET /api/products/:id', () => {
  it('returns the detail with decimals untouched', async () => {
    const { upstream } = makeUpstream({ detail: makeDetail() });
    const baseUrl = await startApp(upstream);

    const res = await fetch(`${baseUrl}/api/products/APL-IP13-128`);
    const body = (await res.json()) as ProductDetail;

    expect(res.status).to.equal(200);
    expect(body.basePrice).to.equal(699.99);
    expect(body.storageOptions[0]?.price).to.equal(699.99);
  });

  it('dedupes similar products and removes the requested product', async () => {
    const { upstream } = makeUpstream({
      detail: makeDetail({
        similarProducts: [
          summary('APL-IP13-128'),
          summary('DUP'),
          summary('DUP'),
          summary('OTHER'),
        ],
      }),
    });
    const baseUrl = await startApp(upstream);

    const body = (await (
      await fetch(`${baseUrl}/api/products/APL-IP13-128`)
    ).json()) as ProductDetail;

    expect(body.similarProducts.map((product) => product.id)).to.deep.equal([
      'DUP',
      'OTHER',
    ]);
  });

  it('rewrites color and similar image URLs', async () => {
    const { upstream } = makeUpstream({
      detail: makeDetail({
        similarProducts: [summary('X', `http://${HOST}/x.jpg`)],
      }),
    });
    const baseUrl = await startApp(upstream);

    const body = (await (
      await fetch(`${baseUrl}/api/products/APL-IP13-128`)
    ).json()) as ProductDetail;

    expect(body.colorOptions[0]?.imageUrl).to.equal(`https://${HOST}/m.jpg`);
    expect(body.similarProducts[0]?.imageUrl).to.equal(`https://${HOST}/x.jpg`);
  });

  it('rejects a malformed id', async () => {
    const { upstream } = makeUpstream({ detail: makeDetail() });
    const baseUrl = await startApp(upstream);

    const withDot = await fetch(`${baseUrl}/api/products/bad.id`);
    const tooLong = await fetch(`${baseUrl}/api/products/${'a'.repeat(65)}`);

    expect(withDot.status).to.equal(400);
    expect(tooLong.status).to.equal(400);
  });

  it('returns 404 for an unknown id', async () => {
    const { upstream } = makeUpstream({});
    const baseUrl = await startApp(upstream);

    const res = await fetch(`${baseUrl}/api/products/UNKNOWN`);
    const body = (await res.json()) as { error: string; message: string };

    expect(res.status).to.equal(404);
    expect(body.error).to.equal('NOT_FOUND');
  });
});

describe('error handling', () => {
  it('returns an ApiError for an unknown route', async () => {
    const { upstream } = makeUpstream({});
    const baseUrl = await startApp(upstream);

    const res = await fetch(`${baseUrl}/api/unknown`);
    const body = (await res.json()) as { error: string; message: string };

    expect(res.status).to.equal(404);
    expect(body.error).to.equal('NOT_FOUND');
    expect(body.message).to.be.a('string');
  });

  it('returns a stackless 500 for an unexpected exception', async () => {
    const { upstream } = makeUpstream({ listThrows: true });
    const baseUrl = await startApp(upstream);

    const res = await fetch(`${baseUrl}/api/products`);
    const body = (await res.json()) as { error: string; message: string };

    expect(res.status).to.equal(500);
    expect(body).to.deep.equal({
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
    expect(JSON.stringify(body)).to.not.contain('boom');
  });
});
