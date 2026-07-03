import { commentStatus, PostStatus } from "../../../generated/prisma/enums"
import type { PostWhereInput } from "../../../generated/prisma/models"
import type { ICreatePost, IPostquery, IUpdatePost } from "../../Interface/post.interface"
import { prisma } from "../../lib/prisma"

const insertPostIntoDB = async (payload: ICreatePost, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...payload,
            authorId: userId
        }
    })
    return result
}
const getAllPostsFromDB = async (query: IPostquery) => {

    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit
    const sortBy = query.sortBy ? query.sortBy : "createdAt"
    const sortOrder = query.sortOrder ? query.sortOrder : "desc"

    const tags = query.tags ? JSON.parse(query.tags as string) : null
    const tagsArray = Array.isArray(tags) ? tags : []
    const andConditions: PostWhereInput[] = []

    if (query.searchTerm) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    }
                },
                {
                    content: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    }
                }
            ]
        })
    }
    if (query.title) {
        andConditions.push({
            title: query.title
        })
    }
    if (query.content) {
        andConditions.push({
            content: query.content
        })
    }
    if (query.authorId) {
        andConditions.push({
            authorId: query.authorId
        })
    }
    if (query.isFeatured) {
        andConditions.push({
            isFeatured: Boolean(query.isFeatured)
        })
    }
    if (query.tags) {
        andConditions.push({
            tags: {
                hasSome: tagsArray
            }
        })
    }
    if (query.status) {
        andConditions.push({
            status: query.status
        })
    }
    const result = await prisma.post.findMany({
        where: {
            AND: andConditions
        },
        // where: {
        //     AND: [
        //         query.searchTerm ? {
        //             OR: [
        //                 {
        //                     title: {
        //                         contains: query.searchTerm,
        //                         mode: "insensitive"
        //                     }
        //                 },
        //                 {
        //                     content: {
        //                         contains: query.searchTerm,
        //                         mode: "insensitive"
        //                     }
        //                 }
        //             ]
        //         } : {},

        //         query.title ? { title: query.title } : {},
        //         query.content ? { content: query.content } : {},
        //     ]
        // },
        take: limit,
        skip: skip,

        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comments: true
        }
    })
    return result
}
const getMyPostsFromDB = async (authorId: string) => {
    const posts = await prisma.post.findMany({
        where: {
            authorId: authorId
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            comments: true,
            author: {
                omit: {
                    password: true
                }
            },
            _count: {
                select: {
                    comments: true
                }
            }
        }
    })
    return posts
}
const getPostsByIdFromDB = async (postId: string) => {
    await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        }
    })

    // const updatedPost = await prisma.post.update({
    //     where: {
    //         id: postId
    //     },
    //     data: {
    //         views: {
    //             increment: 1
    //         }
    //     },
    //     include: {
    //         author: {
    //             omit: {
    //                 password: true
    //             }
    //         }
    //     }

    // })
    console.log(postId);

    const transactionResult = await prisma.$transaction(async (tx) => {
        await tx.post.update({
            where: {
                id: postId
            },
            data: {
                views: {
                    increment: 1
                }
            }
        })
    })
    // throw new Error("hello");

    const post = await prisma.post.findMany({
        where: {
            id: postId
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            comments: true,
            author: {
                omit: {
                    password: true
                }
            },
            _count: {
                select: {
                    comments: true
                }
            }
        }
    })
    return post
}
const updatePostInDB = async (postId: string, payload: IUpdatePost, authorId: string, isAdmin: boolean) => {
    const post = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        }
    })
    if (!isAdmin && !(post.authorId === authorId)) {
        throw new Error("You are not the owner of this post");

    }

    const result = await prisma.post.update({
        where: {
            id: postId
        },
        data: payload,
        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comments: true
        }

    })

    return result
}
const deletePostFromDB = async (postId: string, authorId: string, isAdmin: boolean) => {
    const post = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        }
    })
    if (!isAdmin && !(post.authorId === authorId)) {
        throw new Error("You are not the owner of this post");

    }

    const result = await prisma.post.delete({
        where: {
            id: postId
        }
    })
}
const getPostStatsFromDB = async () => {
    const transactionResult = await prisma.$transaction(async (tx) => {
        const [totalPosts, totalPublishedPost, totalArchivedPost, totalComments, totalApprovedComments, totalRejectedComments, totalDraftedPosts, totalPostViews] = await Promise.all([
            await tx.post.count(),
            await tx.post.count({
                where: {
                    status: PostStatus.PUBLISHED
                }
            }),
            await tx.post.count({
                where: {
                    status: PostStatus.ARCHIVED
                }
            }),
            await tx.comment.count(),
            await tx.comment.count({
                where: {
                    status: commentStatus.APPROVED
                }
            }),
            await tx.comment.count({
                where: {
                    status: commentStatus.REJECTED
                }
            }),
            await tx.post.count({
                where: {
                    status: PostStatus.DRAFT
                }
            }),
            await tx.post.aggregate({
                _sum: {
                    views: true
                }
            })
        ])
        // const totalPosts = await tx.post.count()
        // const totalPublishedPost = await tx.post.count({
        //     where: {
        //         status: PostStatus.PUBLISHED
        //     }
        // })
        // const totalArchivedPost = await tx.post.count({
        //     where: {
        //         status: PostStatus.ARCHIVED
        //     }
        // })

        // const totalComments = await tx.comment.count()

        // const totalApprovedComments = await tx.comment.count({
        //     where: {
        //         status: commentStatus.APPROVED
        //     }
        // })
        // const totalRejectedComments = await tx.comment.count({
        //     where: {
        //         status: commentStatus.APPROVED
        //     }
        // })
        // const totalDraftedPosts = await tx.post.count({
        //     where: {
        //         status: PostStatus.DRAFT
        //     }
        // })
        // const allposts = await tx.post.findMany()
        // let totalPostViews = 0
        // allposts.forEach(post => {
        //     totalPostViews = totalPostViews + post.views
        // })
        // const totalPostViews = await tx.post.aggregate({
        //     _sum: {
        //         views: true
        //     }
        // })
        return {
            totalApprovedComments,
            totalArchivedPost,
            totalComments,
            totalDraftedPosts,
            totalPosts,
            totalPublishedPost,
            totalRejectedComments,
            totalPostViews: totalPostViews._sum.views
        }
    })
    return transactionResult
}

export const postService = {
    insertPostIntoDB,
    getAllPostsFromDB,
    getMyPostsFromDB,
    getPostsByIdFromDB,
    updatePostInDB,
    deletePostFromDB,
    getPostStatsFromDB
}