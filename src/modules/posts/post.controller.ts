import type { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { postService } from "./post.service";
import sendResponse from "../../utils/sendResponse";
import httpstatus from "http-status";
const createPost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id as string

    const payload = req.body
    const post = await postService.insertPostIntoDB(payload, id)

    sendResponse(res, {
        statusCode: httpstatus.CREATED,
        success: true,
        message: "post created successfully successfully",
        data: post

    })
})
const getAllPosts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query
    console.log(query);

    const allPosts = await postService.getAllPostsFromDB(query)

    if (allPosts.length === 0) {
        throw new Error("No Post found!");
    }
    sendResponse(res, {
        statusCode: httpstatus.OK,
        success: true,
        message: "All posts retrieved successfully",
        data: allPosts
    })
})
const getMyPosts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id as string

    const posts = await postService.getMyPostsFromDB(id)
    sendResponse(res, {
        statusCode: httpstatus.OK,
        success: true,
        message: "All posts retrieved successfully",
        data: posts

    })

})
const getPostById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    if (!postId) {
        throw new Error("PostId requird in params.");
    }
    const post = await postService.getPostsByIdFromDB(postId as string)

    sendResponse(res, {
        statusCode: httpstatus.OK,
        success: true,
        message: "Post retrieved successfully",
        data: post
    })
})
const updatePost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id as string
    const isAdmin = req.user?.role === "ADMIN"
    const postId = req.params.postId as string
    const payload = req.body

    if (!postId) {
        throw new Error("PostId required in params");
    }

    const updatedPost = await postService.updatePostInDB(postId, payload, authorId, isAdmin)

    sendResponse(res, {
        statusCode: httpstatus.OK,
        success: true,
        message: "Post updated successfully",
        data: updatedPost

    })
})
const deletePost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id as string
    const isAdmin = req.user?.role === "ADMIN"
    const postId = req.params.postId as string
    if (!postId) {
        throw new Error("PostId required in params");
    }
    await postService.deletePostFromDB(postId, authorId, isAdmin)

    sendResponse(res, {
        statusCode: httpstatus.OK,
        success: true,
        message: "Post deleted successfully",
        data: null

    })
})
const getStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await postService.getPostStatsFromDB()
    sendResponse(res, {
        statusCode: httpstatus.OK,
        success: true,
        message: "Stats retrieved successfully",
        data: result
    })
})

export const postController = {
    createPost,
    getAllPosts,
    getMyPosts,
    getPostById,
    updatePost,
    deletePost,
    getStats
}