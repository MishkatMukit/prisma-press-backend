import type { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { subscriptionService } from "./subscription.service";
import sendResponse from "../../utils/sendResponse";
import httpstatus from "http-status"
const createCheckOutSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id

    const result = await subscriptionService.createCheckOutSession(userId as string)

    sendResponse(res, {
        statusCode: httpstatus.OK,
        success: true,
        message: "User profile updated successfully",
        data: result
    })
})

export const subscriptionController = {
    createCheckOutSession
}