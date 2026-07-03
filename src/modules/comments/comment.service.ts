import type { ICreateComment, IModerateComment, IUpadateComment } from "../../Interface/comment.interface"
import { prisma } from "../../lib/prisma"

const insertCommentIntoDB = async (payload: ICreateComment, authorId: string) => {
    const { postId } = payload
    const post = await prisma.post.findUnique({
        where: {
            id: postId
        }
    })
    if (!post) {
        throw new Error("Post not found!");
    }
    const result = await prisma.comment.create({
        data: {
            ...payload,
            authorId: authorId
        }
    })
    return result
}
const getCommentsByAuthorIdfromDB = async (authorId: string) => {
    const comments = await prisma.comment.findMany({
        where: {
            authorId: authorId
        },
        include: {
            author: {
                omit: {
                    password: true
                }
            }
        }

    })
    return comments
}
const GetCommentByCommentIdFromDB = async (commentId: string) => {
    const comment = await prisma.comment.findUniqueOrThrow({
        where: {
            id: commentId
        },
        include: {
            author: {
                omit: {
                    password: true
                }
            }
        }
    })
    return comment
}
const updateCommentInDB = async (commentId: string, payload: IUpadateComment, userId: string, isAdmin: boolean) => {
    const commentExist = await prisma.comment.findUnique({
        where: {
            id: commentId
        }
    })
    if (!commentExist) {
        throw new Error("Comment not found");
    }
    if (!isAdmin && !(commentExist.authorId === userId)) {
        throw new Error("You are not the owner of this comment");
    }
    const result = await prisma.comment.update({
        where: {
            id: commentId
        },
        data: {
            ...payload
        },
        include: {
            author: {
                omit: {
                    password: true
                }
            }
        }
    })
    return result
}

const deleteCommentFromDB = async (commentId: string, userId: string, isAdmin: boolean) => {
    const comment = await prisma.comment.findUnique({
        where: {
            id: commentId
        }
    })
    if (!comment) {
        throw new Error("Comment not found");
    }
    if (!isAdmin && !(comment.authorId === userId)) {
        throw new Error("You are not the owner of this comment");
    }
    const result = await prisma.comment.delete({
        where: {
            id: commentId
        }
    })
    return result
}
const moderateCommentindDB = async (commentId: string, payload: IModerateComment) => {
    const result = await prisma.comment.update({
        where: {
            id: commentId
        },
        data: {
            ...payload
        }
    })

    return result
}
export const commentService = {
    insertCommentIntoDB,
    getCommentsByAuthorIdfromDB,
    GetCommentByCommentIdFromDB,
    updateCommentInDB,
    deleteCommentFromDB,
    moderateCommentindDB
}