import { type Request, type Response, type NextFunction } from 'express';

export const errorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // Set status code: use the error's code or default to 500 (Server Error)
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only show stack trace in development mode for security
    stack: process.env.NODE_VALUE === 'development' ? err.stack : undefined,
  });
};