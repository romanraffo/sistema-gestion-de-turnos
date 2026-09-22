import type { Request, Response } from "express";

import {
    getAllUsers,
    getUserByIdService,
    getUsersByNameService,
    getUserByEmailService,
    createUserService,
    updateUserService,
    deleteUserService
} from "../services/user.service";

//controllers. Responde: ¿Qué vino en la request y qué response tengo que devolver?

//GET - Devuelve todos los usuarios.
export const getUsers = async (req: Request, res: Response) => {

    const users = await getAllUsers();

    return res.status(200).json(users);
};


//GET - Busca un usuario por ID.
export const getUserById = async (req: Request, res: Response) => {

    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({
            message: "El ID debe ser un número."
        });
    }

    const user = await getUserByIdService(id);

    if (user === null) {
        return res.status(404).json({
            message: "El usuario con ese ID no existe."
        });
    }

    return res.status(200).json(user);
};


//GET - Busca usuarios por nombre.
export const getUsersByName = async (req: Request, res: Response) => {

    const name = req.params.name;

    if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({
            message: "El nombre debe ser texto válido."
        });
    }

    const users = await getUsersByNameService(name);

    if (users.length === 0) {
        return res.status(404).json({
            message: "Ese nombre no se encuentra registrado."
        });
    }

    return res.status(200).json(users);
};


//POST - Crea un usuario.
export const createUser = async (req: Request, res: Response) => {

    const { name, email } = req.body;

    if (
        typeof name !== "string" ||
        name.trim() === "" ||
        typeof email !== "string" ||
        email.trim() === ""
    ) {
        return res.status(400).json({
            message: "Name y email son obligatorios y deben ser texto."
        });
    }

    //Verificamos que el email no esté registrado.
    const existingUser = await getUserByEmailService(email);

    if (existingUser !== null) {
        return res.status(409).json({
            message: "Ya existe un usuario registrado con ese email."
        });
    }

    const user = await createUserService(name, email);

    return res.status(201).json({
        message: "Usuario creado correctamente.",
        user
    });
};


//PATCH - Actualiza el nombre del usuario.
export const updateUser = async (req: Request, res: Response) => {

    const id = Number(req.params.id);

    const { name } = req.body;

    if (Number.isNaN(id)) {
        return res.status(400).json({
            message: "El ID tiene que ser número."
        });
    }

    if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({
            message: "El nombre debe ser un texto válido."
        });
    }

    const user = await getUserByIdService(id);

    if (user === null) {
        return res.status(404).json({
            message: "No existe un usuario con ese ID."
        });
    }

    const updatedUser = await updateUserService(id, name);

    return res.status(200).json({
        message: "Usuario actualizado correctamente.",
        user: updatedUser
    });
};


//DELETE - Elimina usuario por ID.
export const deleteUser = async (req: Request, res: Response) => {

    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({
            message: "El ID debe ser un número."
        });
    }

    const user = await getUserByIdService(id);

    if (user === null) {
        return res.status(404).json({
            message: "El usuario con ese ID no existe."
        });
    }

    const deletedUser = await deleteUserService(id);

    return res.status(200).json({
        message: "Usuario eliminado correctamente.",
        user: deletedUser
    });
};