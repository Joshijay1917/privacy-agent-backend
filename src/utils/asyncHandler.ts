import { type Request, type Response, type NextFunction } from 'express';

// Define the shape of an async controller function
type AsyncController = (
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction
) => Promise<any>;

/**
 * Wraps an async function to catch errors and pass them to the global error handler.
 * Explicitly returns 'void' to satisfy Express's Type definitions.
 */
export const asyncHandler = (fn: AsyncController) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};