import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/api-error';

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const apiError = err instanceof ApiError ? err : null;
  const statusCode = apiError?.statusCode ?? 500;
  const publicMessage = apiError?.message ?? 'Internal server error';

  if (!apiError) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: publicMessage
  });
};

