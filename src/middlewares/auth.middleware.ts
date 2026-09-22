import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    //El token viene dentro del header Authorization.
    const authHeader = req.headers.authorization;


    if (!authHeader) {
        return res.status(401).json({
            message: "Token de autenticación no enviado."
        });
    }


    //El formato esperado es:
    //Authorization: Bearer TOKEN
    const parts = authHeader.split(" ");


    if (
        parts.length !== 2 ||
        parts[0] !== "Bearer"
    ) {
        return res.status(401).json({
            message: "Formato del token inválido."
        });
    }


    const token = parts[1];


    //TypeScript necesita asegurarse de que token no sea undefined.
    if (!token) {
        return res.status(401).json({
            message: "Token no enviado."
        });
    }


    const secret = process.env.JWT_SECRET;


    if (!secret) {
        throw new Error("JWT_SECRET no está definido.");
    }


    try {

        //Verificamos firma y expiración del token.
        const decoded = jwt.verify(token, secret);


        if (
            typeof decoded === "string" ||
            typeof decoded.userId !== "number"
        ) {
            return res.status(401).json({
                message: "Token inválido."
            });
        }


        //Guardamos los datos del usuario dentro de la request.
        req.user = {
            userId: decoded.userId,
            email: decoded.email
        };


        //Todo está correcto.
        //Continuamos hacia el controller.
        next();

    } catch {

        return res.status(401).json({
            message: "Token inválido o expirado."
        });
    }
};