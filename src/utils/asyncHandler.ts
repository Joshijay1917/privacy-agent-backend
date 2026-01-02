import { type Request, type Response, type NextFunction } from 'express';
import type { UserDocument } from '../model/user.model.js';

export interface CustomRequest extends Request {
    user?: UserDocument; // This ensures req.user has all your methods like generateAccessToken()
}

// Define the shape of an async controller function
type AsyncController = (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => Promise<any>;

/**
 * Wraps an async function to catch errors and pass them to the global error handler.
 * Explicitly returns 'void' to satisfy Express's Type definitions.
 */
export const asyncHandler = (fn: AsyncController) => {
    return (req: CustomRequest, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};