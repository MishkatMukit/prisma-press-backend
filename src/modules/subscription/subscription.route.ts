import { Router } from "express";
import { subscriptionController } from "./subscription.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router()

router.post('/checkout', auth(Role.ADMIN, Role.USER, Role.AUTHOR), subscriptionController.createCheckOutSession)
router.post('/webhook', subscriptionController.handleWebhook)

router.get('/status',auth(Role.ADMIN, Role.USER, Role.AUTHOR), subscriptionController.getSubscriptionStatus)


export const subscriptionRoutes = router