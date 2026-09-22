import type { Request, Response } from "express";

import {
    findUserByEmailService,
    registerUserService,
    comparePasswordService,
    generateTokenService
} from "../services/auth.service";


//POST - Registra un nuevo usuario.
export const registerUser = async (req: Request, res: Response) => {

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
};


//POST - Inicia sesión.
export const loginUser = async (req: Request, res: Response) => {

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


    //Buscamos el usuario por email.
    const user = await findUserByEmailService(email);


    if (user === null) {
        return res.status(401).json({
            message: "Email o contraseña incorrectos."
        });
    }


    //Comparamos la contraseña ingresada
    //con el hash guardado en la base de datos.
    const passwordIsValid = await comparePasswordService(
        password,
        user.password
    );


    if (!passwordIsValid) {
        return res.status(401).json({
            message: "Email o contraseña incorrectos."
        });
    }


    //Si todo está correcto, generamos el JWT.
    const token = generateTokenService(
        user.id,
        user.email
    );


    return res.status(200).json({
        message: "Login correcto.",
        token
    });
};