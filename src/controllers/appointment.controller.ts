import type { Request, Response } from "express";

import {
    getAppointmentsByUserService,
    getAppointmentByIdService,
    findAppointmentConflictService,
    createAppointmentService,
    updateAppointmentService
} from "../services/appointment.service";

import {
    getUserByIdService
} from "../services/user.service";


//controllers. Responde: ¿Qué vino en la request y qué response tengo que devolver?

//GET - Trae todos los turnos.
export const getAppointments = async (
    req: Request,
    res: Response
) => {

    const userId = req.user?.userId;

    if (userId === undefined) {
        return res.status(401).json({
            message: "Usuario no autenticado."
        });
    }

    const appointments =
        await getAppointmentsByUserService(userId);

    return res.status(200).json(appointments);
};


//GET - Trae un turno por ID.
export const getAppointmentById = async (
    req: Request,
    res: Response
) => {

    const id = Number(req.params.id);

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


    const appointment = await getAppointmentByIdService(id);


    if (appointment === null) {
        return res.status(404).json({
            message: "El turno ingresado no existe."
        });
    }


    //Verificamos que el turno pertenezca al usuario autenticado.
    if (appointment.userId !== userId) {
        return res.status(403).json({
            message: "No tenés permiso para ver este turno."
        });
    }


    return res.status(200).json(appointment);
};


//POST - Crea un turno y lo vincula al usuario.
export const createAppointment = async (
    req: Request,
    res: Response
) => {

    const { dateTime } = req.body;


    //El middleware de autenticación agregó
    //los datos del usuario a req.user.
    const userId = req.user?.userId;


    if (userId === undefined) {

        return res.status(401).json({
            message: "Usuario no autenticado."
        });
    }


    if (typeof dateTime !== "string") {

        return res.status(400).json({
            message: "La fecha ingresada debe ser texto."
        });
    }


    const parsedDate = new Date(dateTime);


    if (Number.isNaN(parsedDate.getTime())) {

        return res.status(400).json({
            message: "La fecha y hora no tienen un formato válido."
        });
    }


    if (parsedDate < new Date()) {

        return res.status(400).json({
            message: "La fecha ingresada ya pasó."
        });
    }


    const user = await getUserByIdService(userId);


    if (user === null) {

        return res.status(404).json({
            message: "El usuario autenticado no existe."
        });
    }


    const existingAppointment =
        await findAppointmentConflictService(parsedDate);


    if (existingAppointment !== null) {

        return res.status(409).json({
            message: "El turno en esta fecha ya está ocupado."
        });
    }


    const appointmentCreate =
        await createAppointmentService(
            userId,
            parsedDate
        );


    return res.status(201).json({
        message: "Turno solicitado de forma correcta!",
        appointment: appointmentCreate
    });
};


//PATCH - Actualiza fecha o estado del turno.
export const updateAppointment = async (req: Request, res: Response) => {

    const id = Number(req.params.id);

    const { dateTime, status } = req.body;


    if (Number.isNaN(id)) {

        return res.status(400).json({
            message: "El ID debe ser un número."
        });
    }


    //No tiene sentido hacer PATCH sin ningún campo.
    if (dateTime === undefined && status === undefined) {

        return res.status(400).json({
            message: "Debe ingresar al menos un campo para actualizar."
        });
    }


    const appointment = await getAppointmentByIdService(id);


    if (appointment === null) {

        return res.status(404).json({
            message: "El turno no existe."
        });
    }


    //Obtenemos el usuario autenticado desde el JWT.
    const userId = req.user?.userId;


    if (userId === undefined) {

        return res.status(401).json({
            message: "Usuario no autenticado."
        });
    }


    //Verificamos que el turno pertenezca al usuario autenticado.
    if (appointment.userId !== userId) {

        return res.status(403).json({
            message: "No tenés permiso para modificar este turno."
        });
    }


    let parsedDate: Date | undefined;


    if (dateTime !== undefined) {

        //dateTime es opcional.
        //Solo se valida si vino en el body.

        if (typeof dateTime !== "string") {

            return res.status(400).json({
                message: "La fecha y hora deben enviarse como texto."
            });
        }


        parsedDate = new Date(dateTime);


        if (Number.isNaN(parsedDate.getTime())) {

            return res.status(400).json({
                message: "La fecha y hora no tienen un formato válido."
            });
        }


        //No permitimos reprogramar hacia una fecha pasada.
        if (parsedDate < new Date()) {

            return res.status(400).json({
                message: "No se puede cambiar el turno a una fecha pasada."
            });
        }


        //Buscamos otro turno activo en la nueva fecha.
        //Pasamos id para ignorar el propio turno.
        const existingAppointment =
            await findAppointmentConflictService(parsedDate, id);


        if (existingAppointment !== null) {

            return res.status(409).json({
                message: "Ya existe otro turno activo en esa fecha y hora."
            });
        }
    }


    if (status !== undefined) {

        if (
            typeof status !== "string" ||
            status.trim() === ""
        ) {

            return res.status(400).json({
                message: "El formato texto de STATUS es inválido."
            });
        }


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


    //Armamos únicamente los campos que realmente vinieron.
    const dataToUpdate: any = {};


    if (parsedDate !== undefined) {

        dataToUpdate.dateTime = parsedDate;
    }


    if (status !== undefined) {

        dataToUpdate.status = status;
    }


    const updatedAppointment =
        await updateAppointmentService(id, dataToUpdate);


    return res.status(200).json({
        message: "Turno actualizado correctamente.",
        appointment: updatedAppointment
    });
};