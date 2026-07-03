import cookieParser from "cookie-parser";
import type { Application, NextFunction, Request, Response } from "express";
import express from "express";
import cors from "cors"
import config from "./config";
import httpstatus from "http-status"
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
import { userRoutes } from "./modules/users/users.route";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { authRoutes } from "./modules/auth/auth.route";
import { commentRoutes } from "./modules/comments/comment.router";
import { postRoutes } from "./modules/posts/post.route";
import { routeHandler } from "./middleware/RouteHandler";
import { subscriptionRoutes } from "./modules/subscription/subscription.route";
import { stripe } from "./lib/stripe";
import { premiumRoutes } from "./modules/premium/premium.route";

const app: Application = express()

app.use(cors(
    {
        origin: config.app_url,
        credentials: true
    }
))

app.use('/api/subscription/webhook',express.raw({ type: 'application/json' }))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/', async (req: Request, res: Response) => {
    res.send("Hello world!")
})

app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/subscription', subscriptionRoutes)
app.use('/api/premium', premiumRoutes)

// Global error handler     
app.use(globalErrorHandler)
app.use(routeHandler)


export default app