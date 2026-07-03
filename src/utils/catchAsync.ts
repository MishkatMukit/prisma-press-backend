import type { NextFunction, Request, RequestHandler, Response } from "express";
import httpstatus from "http-status";
const catchAsync = (fn: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);

        } catch (error) {
            // console.log(error);
            // res.status(httpstatus.INTERNAL_SERVER_ERROR).json({
            //     success: false,
            //     statusCode: httpstatus.INTERNAL_SERVER_ERROR,
            //     // message: "Failed to register user",
            //     message: (error as Error).message

            // })
            next(error)
        }
    }
}

export default catchAsync