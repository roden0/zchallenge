import type { NextFunction, Request, RequestHandler, Response } from 'express';

export interface Logger {
  info(fields: {
    method: string;
    path: string;
    status: number;
    durationMs: number;
  }): void;
}

export function createConsoleLogger(): Logger {
  return {
    info({ method, path, status, durationMs }) {
      process.stdout.write(`${method} ${path} ${status} ${durationMs}ms\n`);
    },
  };
}

export function requestLogger(logger: Logger): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    res.on('finish', () => {
      logger.info({
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Date.now() - start,
      });
    });

    next();
  };
}
