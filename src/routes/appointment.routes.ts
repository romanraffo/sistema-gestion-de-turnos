import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";

import {
    getAllAppointmentsAdmin,
    getAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment
} from "../controllers/appointment.controller";

const router = Router();


//routes. Responde: ¿Qué endpoints existen? define qué endpoints existen y qué controller atiende cada uno.

//Trae todos los turnos.
router.get("/", authenticateToken, getAppointments);

//Admin que ve todos los turnos 
router.get(
    "/admin/all",
    authenticateToken,
    requireAdmin,
    getAllAppointmentsAdmin
);

//Trae un turno por ID.
router.get("/:id", authenticateToken, getAppointmentById);


//Crea turno.
router.post("/", authenticateToken, createAppointment);


//Actualiza turno.
router.patch("/:id", authenticateToken, updateAppointment);


export default router;