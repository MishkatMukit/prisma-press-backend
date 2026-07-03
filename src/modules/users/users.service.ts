import type { RegisterUserPayload } from "../../Interface/user.interface"
import { prisma } from "../../lib/prisma"
import config from "../../config";
import bcrypt from "bcryptjs";
const registerUserIntoDB = async (payload: RegisterUserPayload) => {
    const { name, email, password, profilePhoto } = payload

    const isUserExist = await prisma.user.findUnique({
        where: { email }
    })
    if (isUserExist) {
        throw new Error("User with this email already exists");

    }

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    })
    await prisma.profile.create({
        data: {
            userId: createdUser.id,
            profilePhoto: profilePhoto || null
        }
    })
    const user = await prisma.user.findUnique({
        where: {
            id: createdUser.id,
            email: createdUser.email || email
        },
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    })
    return user
}

const getMyProfileFromDB = async (userId: string) => {
    const userProfile = await prisma.user.findUniqueOrThrow(
        {
            where: {
                id: userId
            },
            omit: {
                password: true
            },
            include: {
                profile: true
            }
        }
    )
    return userProfile
}

const updataMyProfileInDB = async (userId: string, payload: any) => {
    const { name, email, profilePhoto, bio } = payload


    const updateUser = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            name,
            email,
            profile: {
                update: {
                    profilePhoto,
                    bio
                }
            }
        },
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    })
    return updateUser
}

export const userService = {
    registerUserIntoDB,
    getMyProfileFromDB,
    updataMyProfileInDB
}