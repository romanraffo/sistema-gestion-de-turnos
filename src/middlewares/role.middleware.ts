import type { Request, Response, NextFunction } from "express";


export const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    //Primero verificamos que exista un usuario autenticado.
    if (!req.user) {

        return res.status(401).json({
            message: "Usuario no autenticado."
        });
    }


    //Verificamos que el usuario tenga rol ADMIN.
    if (req.user.role !== "ADMIN") {

        return res.status(403).json({
            message: "No tenés permisos de administrador."
        });
    }


    //Si es ADMIN, puede continuar.
    next();
};