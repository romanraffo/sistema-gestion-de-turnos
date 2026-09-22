import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../lib/prisma";


//Busca si ya existe un usuario con ese email.
export const findUserByEmailService = async (email: string) => {

    return await prisma.user.findUnique({
        where: {
            email
        }
    });
};


//Registra un nuevo usuario.
export const registerUserService = async (
    name: string,
    email: string,
    password: string
) => {

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({

        data: {
            name,
            email,
            password: hashedPassword
        },

        select: {
            id: true,
            name: true,
            email: true
        }
    });

    return user;
};


//Verifica si la contraseña ingresada coincide con la guardada.
export const comparePasswordService = async (
    password: string,
    hashedPassword: string
) => {

    return await bcrypt.compare(password, hashedPassword);
};


//Genera un token JWT.
export const generateTokenService = (
    userId: number,
    email: string
) => {

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET no está definido.");
    }

    return jwt.sign(
        {
            userId,
            email
        },
        secret,
        {
            expiresIn: "1h"
        }
    );
};