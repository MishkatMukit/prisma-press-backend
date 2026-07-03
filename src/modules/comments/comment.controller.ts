import type { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { commentService } from "./comment.service";
import sendResponse from "../../utils/sendResponse";
import httpstatus from "http-status"
const createComment = catchAsync(async (req: Request, res: Response, Next: NextFunction) => {
    const payload = req.body
    const authorId = req.user?.id as string

    const comment = await commentService.insertCommentIntoDB(payload, authorId)

    sendResponse(res, {
        statusCode: httpstatus.CREATED,
        success: true,
        message: "Comment created successfully.",
        data: comment
    })
})
const getCommentsByAuthorId = catchAsync(async (req: Request, res: Response, Next: NextFunction) => {
    const id = req.params?.authorId
    if (!id) {
        throw new Error("Please provide authorId");
    }
    const result = await commentService.getCommentsByAuthorIdfromDB(id as string)

    sendResponse(res, {
        statusCode: httpstatus.OK,
        success: true,
        message: "Comments retrieved successfully.",
        data: result
    })
})
const GetCommentByCommentId = catchAsync(async (req: Request, res: Response, Next: NextFunction) => {
    const commentId = req.params?.commentId as string
    if (!commentId) {
        throw new Error("Please provide commentId in params");
    }

    const comment = await commentService.GetCommentByCommentIdFromDB(commentId)

    sendResponse(res, {
        statusCode: httpstatus.OK,
        success: true,
        message: "Comment retrieved successfully.",
        data: comment
    })
})

const updateComment = catchAsync(async (req: Request, res: Response, Next: NextFunction) => {
    const commentId = req.params.commentId as string
    const userId = req.user?.id as string
    const isAdmin = req.user?.role === "ADMIN"
    const payload = req.body
    const result = await commentService.updateCommentInDB(commentId, payload, userId, isAdmin)

    sendResponse(res, {
        statusCode: httpstatus.OK,
        success: true,
        message: "Comment updated successfully.",
        data: result
    })
})
const deleteComment = catchAsync(async (req: Request, res: Response, Next: NextFunction) => {
    const commentId = req.params.commentId as string
    const userId = req.user?.id as string
    const isAdmin = req.user?.role === "ADMIN"
    const result = await commentService.deleteCommentFromDB(commentId, userId, isAdmin)

    sendResponse(res, {
        statusCode: httpstatus.OK,
        success: true,
        message: "Comment deleted successfully.",
        data: result
    })
})
const moderateComment = catchAsync(async (req: Request, res: Response, Next: NextFunction) => {
    const commentId = req.params.commentId as string
    const payload = req.body
    const result = await commentService.moderateCommentindDB(commentId, payload)

    sendResponse(res, {
        statusCode: httpstatus.OK,
        success: true,
        message: "Comment moderated successfully.",
        data: result
    })
})

export const commentController = {
    createComment,
    getCommentsByAuthorId,
    GetCommentByCommentId,
    updateComment,
    deleteComment,
    moderateComment
}