import bcrypt from "bcryptjs"
import type { IloginUser } from "../../Interface/auth.interface"
import { prisma } from "../../lib/prisma"
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken"
import config from "../../config"
import { jwtUtils } from "../../utils/jwt"
import { ActiveStatus } from "../../../generated/prisma/enums"


const loginUser = async (payload: IloginUser) => {
    const { email, password } = payload

    const user = await prisma.user.findUniqueOrThrow({
        where: { email }
    })
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
        throw new Error("Invalid credentials")
    }
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }
    // const accessToken = jwt.sign(
    //     jwtPayload,
    //     config.jwt_access_secret!,
    //     { expiresIn: config.jwt_access_expires_in } as SignOptions
    // )
    const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_access_secret, config.jwt_access_expires_in)
    const refreshToken = jwtUtils.createToken(jwtPayload, config.jwt_refresh_secret, config.jwt_refresh_expires_in)

    return { user, accessToken, refreshToken }

}
const setRefreshToken = async (refreshToken: string) => {
    const verifyRefreshToken = jwtUtils.verifyToken(refreshToken, config.jwt_refresh_secret)

    if (!verifyRefreshToken.success) {
        throw new Error(verifyRefreshToken.error);

    }

    const { id } = verifyRefreshToken.data as JwtPayload

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id
        }
    })
    if (user.active_satus === ActiveStatus.Blocked) {
        throw new Error("User is blocked");
    }

    const jwtPayload = {
        id,
        name: user.name,
        email: user.email,
        role: user.role
    }
    const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_access_secret, config.jwt_access_expires_in)

    return accessToken
}
export const authService = {
    loginUser,
    setRefreshToken
}