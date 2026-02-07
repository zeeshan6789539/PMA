import { Request, Response } from 'express';
import ResponseHandler from '@/utils/response-handler';
import { NODE_ENV } from '@/utils/constant';
import { asyncHandler } from '@/middleware/error-handler';

export const check = asyncHandler((req: Request, res: Response) => {
    return ResponseHandler.success(res, 'Server is running', {
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        uptime: process.uptime()
    });
});
