import { Router } from 'express';
import type { UpstreamClient } from '../services/upstream-client.js';
import { createProductsRouter } from './products.js';

export function createApiRouter(upstream: UpstreamClient): Router {
  const router = Router();

  router.use('/products', createProductsRouter(upstream));

  return router;
}
