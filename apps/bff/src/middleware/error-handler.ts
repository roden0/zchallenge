import type { ErrorRequestHandler, RequestHandler } from 'express';

export function notFoundHandler(): RequestHandler {
  return (_req, res) => {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Route not found' });
  };
}

export function errorHandler(): ErrorRequestHandler {
  return (_error, _req, res, _next) => {
    if (res.headersSent) {
      return;
    }

    res
      .status(500)
      .json({ error: 'INTERNAL_ERROR', message: 'Internal server error' });
  };
}
