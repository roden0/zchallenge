import { expect } from 'chai';
import { createApp } from './app.js';

function startServer() {
  const server = createApp().listen(0);
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
