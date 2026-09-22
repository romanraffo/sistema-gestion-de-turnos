import { Router } from "express";

import {
    getAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment
} from "../controllers/appointment.controller";

const router = Router();


//routes. Responde: ¿Qué endpoints existen? define qué endpoints existen y qué controller atiende cada uno.

//Trae todos los turnos.
router.get("/", getAppointments);


//Trae un turno por ID.
router.get("/:id", getAppointmentById);


//Crea turno.
router.post("/", createAppointment);


//Actualiza turno.
router.patch("/:id", updateAppointment);


export default router;