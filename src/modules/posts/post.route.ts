import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { postController } from "./post.controller";

const router = Router()



router.get('/stats', auth(Role.ADMIN, Role.USER), postController.getStats)
router.post("/", auth(Role.ADMIN, Role.USER), postController.createPost)
router.get("/", postController.getAllPosts)
router.get("/my-posts", auth(Role.USER, Role.ADMIN), postController.getMyPosts)
router.get("/:postId", postController.getPostById)
router.patch("/:postId", auth(Role.USER, Role.ADMIN), postController.updatePost)
router.delete("/:postId", auth(Role.USER, Role.ADMIN), postController.deletePost)


export const postRoutes = router