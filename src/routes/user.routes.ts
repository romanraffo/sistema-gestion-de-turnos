import { Router } from "express";

import {
    getUsers,
    getUserById,
    getUsersByName,
    createUser,
    updateUser,
    deleteUser
} from "../controllers/user.controller";

const router = Router();

//routes. Responde: ¿Qué endpoints existen? define qué endpoints existen y qué controller atiende cada uno.

//Trae todos los usuarios.
router.get("/", getUsers);


//Busca usuario por ID.
router.get("/id/:id", getUserById);


//Busca usuarios por nombre.
router.get("/name/:name", getUsersByName);


//Crea usuario.
router.post("/", createUser);


//Actualiza usuario.
router.patch("/id/:id", updateUser);


//Elimina usuario.
router.delete("/:id", deleteUser);


export default router;