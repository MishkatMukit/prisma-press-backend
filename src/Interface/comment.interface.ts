import type { commentStatus } from "../../generated/prisma/enums";

export interface ICreateComment {
    content: string;
    postId: string
}
export interface IUpadateComment {
    content?: string;
}
export interface IModerateComment {
    status: commentStatus
}