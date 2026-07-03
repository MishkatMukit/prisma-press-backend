import { Router, type Request, type Response } from "express";
import { userController } from "./users.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router()

router.post('/register', userController.registerUser)
router.get('/me', auth(Role.ADMIN, Role.USER, Role.AUTHOR), userController.getMyProfile)
router.put('/update-profile', auth(Role.ADMIN, Role.USER, Role.AUTHOR), userController.updateMyProfile)
export const userRoutes = router 