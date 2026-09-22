import type { Request, Response, NextFunction } from "express";


export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    console.error(err);

    return res.status(500).json({
        message: "Ocurrió un error interno del servidor."
    });
};