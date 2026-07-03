import { Router } from "express";
import { commentController } from "./comment.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router()
router.post('/', auth(Role.ADMIN, Role.USER), commentController.createComment)
router.get('/author/:authorId', commentController.getCommentsByAuthorId)
router.get('/:commentId', commentController.GetCommentByCommentId)
router.patch('/:commentId', auth(Role.ADMIN, Role.USER), commentController.updateComment)
router.delete('/:commentId', auth(Role.USER, Role.ADMIN), commentController.deleteComment)
router.post('/:commentId/moderate', auth(Role.ADMIN), commentController.moderateComment)

export const commentRoutes = router