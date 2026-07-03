import type { NextFunction, Request, Response } from "express";

export const routeHandler = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        message: "Route not found",
        path: req.originalUrl,
        date: Date()
    })
}