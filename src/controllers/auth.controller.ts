import type { Request, Response, NextFunction } from "express";

import {
    findUserByEmailService,
    registerUserService,
    comparePasswordService,
    generateTokenService
} from "../services/auth.service";


//POST - Registra un nuevo usuario.
export const registerUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const { name, email, password } = req.body;


        if (typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({
                message: "El nombre debe ser un texto válido."
            });
        }


        if (typeof email !== "string" || email.trim() === "") {
            return res.status(400).json({
                message: "El email debe ser un texto válido."
            });
        }


        if (typeof password !== "string" || password.trim() === "") {
            return res.status(400).json({
                message: "La contraseña debe ser un texto válido."
            });
        }


        if (password.length < 6) {
            return res.status(400).json({
                message: "La contraseña debe tener al menos 6 caracteres."
            });
        }


        const existingUser = await findUserByEmailService(email);


        if (existingUser !== null) {
            return res.status(409).json({
                message: "Ya existe un usuario registrado con ese email."
            });
        }


        const user = await registerUserService(
            name,
            email,
            password
        );


        return res.status(201).json({
            message: "Usuario registrado correctamente.",
            user
        });

    } catch (error) {

        next(error);
    }
};


//POST - Inicia sesión.
export const loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const { email, password } = req.body;


        if (
            typeof email !== "string" ||
            email.trim() === ""
        ) {
            return res.status(400).json({
                message: "El email debe ser válido."
            });
        }


        if (
            typeof password !== "string" ||
            password.trim() === ""
        ) {
            return res.status(400).json({
                message: "La contraseña debe ser válida."
            });
        }


        const user = await findUserByEmailService(email);


        if (user === null) {
            return res.status(401).json({
                message: "Email o contraseña incorrectos."
            });
        }


        const passwordIsValid = await comparePasswordService(
            password,
            user.password
        );


        if (!passwordIsValid) {
            return res.status(401).json({
                message: "Email o contraseña incorrectos."
            });
        }


        const token = generateTokenService(
            user.id,
            user.email,
            user.role
        );


        return res.status(200).json({
            message: "Login correcto.",
            token
        });

    } catch (error) {

        next(error);
    }
};