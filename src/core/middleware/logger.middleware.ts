import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';

export function LoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const logger = new Logger('HTTP');
  const { method, originalUrl } = req;
  const startTime = Date.now();

  res.on('finish', () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const { statusCode } = res;
    
    logger.log(
      `${method} ${originalUrl} ${statusCode} ${duration}ms`
    );
  });

  next();
} 