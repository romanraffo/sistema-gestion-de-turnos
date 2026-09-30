import { Router } from "express";

import { authenticateToken } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";

import {
    getUsers,
    getUserById,
    getUsersByName,
    updateUser,
    deleteUser
} from "../controllers/user.controller";

const router = Router();

// Todas las rutas de usuarios requieren autenticación.
router.use(authenticateToken);

// Todas las operaciones de usuarios requieren rol ADMIN.

// Trae todos los usuarios.
router.get("/", requireAdmin, getUsers);

// Busca usuario por ID.
router.get("/id/:id", requireAdmin, getUserById);

// Busca usuarios por nombre.
router.get("/name/:name", requireAdmin, getUsersByName);

// Actualiza usuario.
router.patch("/id/:id", requireAdmin, updateUser);

// Elimina usuario.
router.delete("/:id", requireAdmin, deleteUser);

export default router;