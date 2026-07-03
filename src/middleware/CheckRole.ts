import type { NextFunction, Request, Response } from "express";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { Role } from "../../generated/prisma/enums";
import sendResponse from "../utils/sendResponse";
import httpstatus from "http-status";
import type { JwtPayload } from "jsonwebtoken";
const checkRole = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.cookies);
    const { accessToken } = req.cookies

    const verifiedToken = jwtUtils.verifyToken(accessToken, config.jwt_access_secret)

    if (!verifiedToken.success) {
        throw new Error(verifiedToken.error);
    }

    const { email, name, id, role } = verifiedToken.data as JwtPayload;

    const requiredRoles = [Role.ADMIN, Role.USER, Role.AUTHOR];
    if (!requiredRoles.includes(role as Role)) {
        sendResponse(res, {
            statusCode: httpstatus.FORBIDDEN,
            success: false,
            message: "You are not authorized to access this resource",
        })
        return
    }
    // console.log("atkai geso mama");
    req.user = {
        email,
        name,
        id,
        role
    }

    next()
}

export default checkRole