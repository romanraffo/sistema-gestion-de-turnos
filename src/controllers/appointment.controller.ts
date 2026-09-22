import type { Request, Response, NextFunction } from "express";

import {
    getAllAppointmentsService,
    getAppointmentsByUserService,
    getAppointmentByIdService,
    findAppointmentConflictService,
    createAppointmentService,
    updateAppointmentService
} from "../services/appointment.service";

import {
    getUserByIdService
} from "../services/user.service";


// CONTROLLERS
// Responden principalmente:
// ¿Qué vino en la request?
// ¿Qué response tengo que devolver?


// GET - Trae los turnos del usuario autenticado.
export const getAppointments = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        // Obtenemos el usuario autenticado desde el JWT.
        const userId = req.user?.userId;


        if (userId === undefined) {
            return res.status(401).json({
                message: "Usuario no autenticado."
            });
        }


        // Traemos solamente los turnos del usuario autenticado.
        const appointments =
            await getAppointmentsByUserService(userId);


        return res.status(200).json(appointments);

    } catch (error) {

        // Si ocurre un error inesperado,
        // lo enviamos al middleware global de errores.
        next(error);
    }
};


// GET - Trae un turno por ID.
export const getAppointmentById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const id = Number(req.params.id);

        // Obtenemos el usuario autenticado desde el JWT.
        const userId = req.user?.userId;


        if (Number.isNaN(id)) {
            return res.status(400).json({
                message: "El ID debe ser un número."
            });
        }


        if (userId === undefined) {
            return res.status(401).json({
                message: "Usuario no autenticado."
            });
        }


        const appointment =
            await getAppointmentByIdService(id);


        if (appointment === null) {
            return res.status(404).json({
                message: "El turno ingresado no existe."
            });
        }


        // Si NO es ADMIN,
        // el turno tiene que pertenecer al usuario autenticado.
        if (
            req.user?.role !== "ADMIN" &&
            appointment.userId !== userId
        ) {
            return res.status(403).json({
                message: "No tenés permiso para ver este turno."
            });
        }


        return res.status(200).json(appointment);

    } catch (error) {

        next(error);
    }
};


// POST - Crea un turno y lo vincula al usuario autenticado.
export const createAppointment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        // El usuario solamente envía la fecha.
        // El userId se obtiene desde el JWT.
        const { dateTime } = req.body;


        // El middleware de autenticación agregó
        // los datos del usuario a req.user.
        const userId = req.user?.userId;


        if (userId === undefined) {
            return res.status(401).json({
                message: "Usuario no autenticado."
            });
        }


        // dateTime debe llegar como texto.
        if (typeof dateTime !== "string") {
            return res.status(400).json({
                message: "La fecha ingresada debe ser texto."
            });
        }


        // JavaScript intenta transformar
        // el string recibido en un objeto Date.
        const parsedDate = new Date(dateTime);


        // Si getTime() devuelve NaN,
        // significa que la fecha ingresada es inválida.
        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                message: "La fecha y hora no tienen un formato válido."
            });
        }


        // No permitimos reservar turnos en fechas pasadas.
        if (parsedDate < new Date()) {
            return res.status(400).json({
                message: "La fecha ingresada ya pasó."
            });
        }


        // Verificamos que el usuario autenticado
        // todavía exista en la base de datos.
        const user =
            await getUserByIdService(userId);


        if (user === null) {
            return res.status(404).json({
                message: "El usuario autenticado no existe."
            });
        }


        // Buscamos si ya existe un turno activo
        // en la misma fecha y hora.
        const existingAppointment =
            await findAppointmentConflictService(parsedDate);


        if (existingAppointment !== null) {
            return res.status(409).json({
                message: "El turno en esta fecha ya está ocupado."
            });
        }


        // Si todo es válido, creamos el turno
        // asociado al usuario autenticado.
        const appointmentCreate =
            await createAppointmentService(
                userId,
                parsedDate
            );


        return res.status(201).json({
            message: "Turno solicitado de forma correcta!",
            appointment: appointmentCreate
        });

    } catch (error) {

        next(error);
    }
};


// PATCH - Actualiza fecha o estado del turno.
export const updateAppointment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const id = Number(req.params.id);

        const { dateTime, status } = req.body;


        if (Number.isNaN(id)) {
            return res.status(400).json({
                message: "El ID debe ser un número."
            });
        }


        // No tiene sentido hacer PATCH
        // si no se envía ningún campo para modificar.
        if (
            dateTime === undefined &&
            status === undefined
        ) {
            return res.status(400).json({
                message: "Debe ingresar al menos un campo para actualizar."
            });
        }


        // Buscamos el turno que se quiere modificar.
        const appointment =
            await getAppointmentByIdService(id);


        if (appointment === null) {
            return res.status(404).json({
                message: "El turno no existe."
            });
        }


        // Obtenemos el usuario autenticado desde el JWT.
        const userId = req.user?.userId;


        if (userId === undefined) {
            return res.status(401).json({
                message: "Usuario no autenticado."
            });
        }


        // Si NO es ADMIN,
        // solo puede modificar sus propios turnos.
        if (
            req.user?.role !== "ADMIN" &&
            appointment.userId !== userId
        ) {
            return res.status(403).json({
                message: "No tenés permiso para modificar este turno."
            });
        }


        let parsedDate: Date | undefined;


        // dateTime es opcional.
        // Solo lo validamos si vino en el body.
        if (dateTime !== undefined) {

            if (typeof dateTime !== "string") {
                return res.status(400).json({
                    message: "La fecha y hora deben enviarse como texto."
                });
            }


            parsedDate = new Date(dateTime);


            // Verificamos que la fecha sea válida.
            if (Number.isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    message: "La fecha y hora no tienen un formato válido."
                });
            }


            // No permitimos reprogramar
            // un turno hacia una fecha pasada.
            if (parsedDate < new Date()) {
                return res.status(400).json({
                    message: "No se puede cambiar el turno a una fecha pasada."
                });
            }


            // Buscamos otro turno activo en la nueva fecha.
            // Pasamos el ID para ignorar el propio turno.
            const existingAppointment =
                await findAppointmentConflictService(
                    parsedDate,
                    id
                );


            if (existingAppointment !== null) {
                return res.status(409).json({
                    message: "Ya existe otro turno activo en esa fecha y hora."
                });
            }
        }


        // status también es opcional.
        // Solo lo validamos si vino en el body.
        if (status !== undefined) {

            if (
                typeof status !== "string" ||
                status.trim() === ""
            ) {
                return res.status(400).json({
                    message: "El formato texto de STATUS es inválido."
                });
            }


            // Verificamos que el estado pertenezca
            // a los estados permitidos por el sistema.
            if (
                status !== "PENDING" &&
                status !== "CONFIRMED" &&
                status !== "CANCELLED"
            ) {
                return res.status(400).json({
                    message: "El STATUS ingresado no es válido."
                });
            }
        }


        // Armamos solamente los campos
        // que realmente queremos modificar.
        const dataToUpdate: any = {};


        if (parsedDate !== undefined) {
            dataToUpdate.dateTime = parsedDate;
        }


        if (status !== undefined) {
            dataToUpdate.status = status;
        }


        // Actualizamos el turno.
        const updatedAppointment =
            await updateAppointmentService(
                id,
                dataToUpdate
            );


        return res.status(200).json({
            message: "Turno actualizado correctamente.",
            appointment: updatedAppointment
        });

    } catch (error) {

        next(error);
    }
};


// GET ADMIN - Trae todos los turnos del sistema.
// Esta función se usa en una ruta protegida por:
// authenticateToken + requireAdmin.
export const getAllAppointmentsAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const appointments =
            await getAllAppointmentsService();


        return res.status(200).json(appointments);

    } catch (error) {

        next(error);
    }
};