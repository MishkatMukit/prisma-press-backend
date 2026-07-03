import httpstatus from "http-status";
import type { NextFunction, Request, Response } from "express";
import { userService } from "./users.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import config from "../../config";
import jwt, { type JwtPayload } from "jsonwebtoken"
import { jwtUtils } from "../../utils/jwt";

const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body

    const user = await userService.registerUserIntoDB(payload);

    sendResponse(res, {
        statusCode: httpstatus.CREATED,
        success: true,
        message: "User Registered successfully",
        data: { user }
    })
})

const getMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken } = req.cookies
    // console.log(accessToken);
    // console.log("user from request ", req.user);


    const verifiedToken = jwtUtils.verifyToken(accessToken, config.jwt_access_secret)

    if (!verifiedToken.success) {
        throw new Error(verifiedToken.error);
    }

    const decoded = verifiedToken.data as JwtPayload;
    const profile = await userService.getMyProfileFromDB(decoded.id);
    sendResponse(res, {
        success: true,
        statusCode: httpstatus.OK,
        message: "User profile fetched successfully",
        data: profile
    })
})

const updateMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const payload = req.body;

    const updatedUser = await userService.updataMyProfileInDB(userId, payload);
    sendResponse(res, {
        statusCode: httpstatus.OK,
        success: true,
        message: "User profile updated successfully",
        data: updatedUser
    })
})

export const userController = {
    registerUser,
    getMyProfile,
    updateMyProfile
}

