import type { PostStatus } from "../../generated/prisma/enums";
import type { PostWhereInput } from "../../generated/prisma/models";

export interface ICreatePost {
    title: string;
    content: string;
    thumbnail?: string;
    isFeatured?: boolean;
    status?: PostStatus;
    tags?: string[];
}
export interface IUpdatePost {
    title?: string;
    content?: string;
    thumbnail?: string;
    isFeatured?: boolean;
    status?: PostStatus;
    tags?: string[];
}
export interface IPostquery extends PostWhereInput {
    // title?: string;
    // content?: string;
    searchTerm?: string,
    page?: string;
    limit?: string;
    sortOrder?: string;
    sortBy?: string;
}