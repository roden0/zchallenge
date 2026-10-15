import express, { type Express } from 'express';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { type Logger, requestLogger } from './middleware/logger.js';
import { createApiRouter } from './routes/index.js';
import type { UpstreamClient } from './services/upstream-client.js';

export interface AppDependencies {
  upstream: UpstreamClient;
  logger: Logger;
}

export function createApp({ upstream, logger }: AppDependencies): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestLogger(logger));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api', createApiRouter(upstream));

  app.use(notFoundHandler());
  app.use(errorHandler());

  return app;
}
