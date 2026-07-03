import type { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpstatus from "http-status"
import { premiumService } from "./premium.service";
const getPremiumContent = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
    const result = await premiumService.getPremiumContent()
    sendResponse(res, {
        statusCode: httpstatus.OK,
        success: true,
        message: "Premium content retrieved successfully",
        data: result
    })
})

export const premiumController = {
    getPremiumContent
}