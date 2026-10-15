import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createConsoleLogger } from './middleware/logger.js';
import { createUpstreamClient } from './services/upstream-client.js';

loadEnv({
  path: fileURLToPath(new URL('../../../.env', import.meta.url)),
  quiet: true,
});

const config = loadConfig();

const upstream = createUpstreamClient({
  baseUrl: config.upstreamApiUrl,
  apiKey: config.upstreamApiKey,
  timeoutMs: config.upstreamTimeoutMs,
  fetch: globalThis.fetch,
});

const app = createApp({ upstream, logger: createConsoleLogger() });

app.listen(config.port, () => {
  process.stdout.write(`BFF listening on http://localhost:${config.port}\n`);
});
