import { expect } from 'chai';
import { createApp } from './app.js';
import type { Logger } from './middleware/logger.js';
import type { UpstreamClient } from './services/upstream-client.js';

const silentLogger: Logger = { info: () => {} };

const unusedUpstream: UpstreamClient = {
  upstreamHost: 'cdn.example.test',
  listProducts: async () => ({ ok: true, value: [] }),
  getProduct: async () => ({
    ok: false,
    failure: {
      status: 404,
      error: { error: 'NOT_FOUND', message: 'not found' },
    },
  }),
};

function startServer() {
  const server = createApp({
    upstream: unusedUpstream,
    logger: silentLogger,
  }).listen(0);
  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('Server did not bind to an ephemeral port');
  }
  return { server, port: address.port };
}

describe('createApp', () => {
  it('responds 200 with a JSON status on GET /health', async () => {
    const { server, port } = startServer();
    try {
      const res = await fetch(`http://127.0.0.1:${port}/health`);
      expect(res.status).to.equal(200);
      expect(await res.json()).to.deep.equal({ status: 'ok' });
    } finally {
      server.close();
    }
  });
});
