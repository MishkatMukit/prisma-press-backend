import type { NextFunction, Request, Response } from "express"
import catchAsync from "../utils/catchAsync"
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { type JwtPayload } from "jsonwebtoken";
import { ActiveStatus, type Role } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";

const auth = (...requiredRoles: Role[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        // console.log(req.cookies);

        const token = req.cookies?.accessToken || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization?.split(" ")[1] : req.headers.authorization);

        console.log(token);


        if (!token) {
            throw new Error("You are not logged in. Please login to access resources.");

        }

        const verifiedToken = jwtUtils.verifyToken(token as string, config.jwt_access_secret)

        if (!verifiedToken.success) {
            throw new Error(verifiedToken.error);
        }
        const { email, name, id, role } = verifiedToken.data as JwtPayload

        if (requiredRoles.length && !requiredRoles.includes(role as Role)) {
            throw new Error("Forbidden. You don't have  permission to access this resources");
        }

        const user = await prisma.user.findUnique({
            where: {
                id
            }
        })
        if (!user) {
            throw new Error("User not found. Please login again.");
        }
        if (user.active_satus === ActiveStatus.Blocked) {
            throw new Error("Your account has been blocked. Please contact support.");
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
        next()
    })
}

export default auth;