import type { ProductSummary } from 'contracts';
import { type Request, type Response, Router } from 'express';
import { parseListQuery } from '../lib/query.js';
import {
  dedupeById,
  normalizeDetailImages,
  normalizeSummaryImages,
} from '../lib/transform.js';
import type { UpstreamClient } from '../services/upstream-client.js';

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function createProductsRouter(upstream: UpstreamClient): Router {
  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    const parsed = parseListQuery(req.query as Record<string, unknown>);
    if (!parsed.ok) {
      res.status(400).json(parsed.error);
      return;
    }

    const result = await upstream.listProducts({ search: parsed.value.search });
    if (!result.ok) {
      res.status(result.failure.status).json(result.failure.error);
      return;
    }

    let products = dedupeById(result.value);

    if (parsed.value.offset > 0) {
      products = products.slice(parsed.value.offset);
    }
    if (parsed.value.limit !== undefined) {
      products = products.slice(0, parsed.value.limit);
    }

    const body: ProductSummary[] = products.map((product) =>
      normalizeSummaryImages(product, upstream.upstreamHost),
    );

    res.json(body);
  });

  router.get('/:id', async (req: Request, res: Response) => {
    const rawId: unknown = req.params.id;
    const id = typeof rawId === 'string' ? rawId : '';

    if (!ID_PATTERN.test(id)) {
      res.status(400).json({
        error: 'BAD_REQUEST',
        message:
          "'id' must be 1-64 characters of letters, digits, underscore or hyphen",
      });
      return;
    }

    const result = await upstream.getProduct(id);
    if (!result.ok) {
      res.status(result.failure.status).json(result.failure.error);
      return;
    }

    res.json(normalizeDetailImages(result.value, upstream.upstreamHost));
  });

  return router;
}
