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

const handleWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
    const event = req.body as Buffer
    const signature = req.headers['stripe-signature']

    const result = await subscriptionService.handleWebHook(event, signature as string)

    sendResponse(res, {
        statusCode: httpstatus.OK,
        success: true,
        message: "Webhook triggered successfully",
        data: null
    })
})

const getSubscriptionStatus = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
    const userId = req.user?.id as string
    const result = await subscriptionService.getSubscriptionStatus(userId)
    sendResponse(res, {
        statusCode: httpstatus.OK,
        success: true,
        message: "Subscription status retrieved successfully",
        data: result
    })
})

export const subscriptionController = {
    createCheckOutSession,
    handleWebhook,
    getSubscriptionStatus
}