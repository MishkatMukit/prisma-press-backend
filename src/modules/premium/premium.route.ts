import { Router } from "express";
import { premiumController } from "./premium.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router  = Router()

router.get('/',auth(Role.ADMIN, Role.USER, Role.AUTHOR), premiumController.getPremiumContent)

export const premiumRoutes = router