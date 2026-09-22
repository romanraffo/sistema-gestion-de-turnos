import type { Request, Response } from "express";

import {
    getAllAppointmentsService,
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
export const getAppointments = async (req: Request, res: Response) => {

    const appointments = await getAllAppointmentsService();

    return res.status(200).json(appointments);
};


//GET - Trae un turno por ID.
export const getAppointmentById = async (req: Request, res: Response) => {

    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({
            message: "El ID debe ser un número."
        });
    }

    const appointment = await getAppointmentByIdService(id);

    if (appointment === null) {
        return res.status(404).json({
            message: "El turno ingresado no existe."
        });
    }

    return res.status(200).json(appointment);
};


//POST - Crea un turno y lo vincula al usuario.
export const createAppointment = async (req: Request, res: Response) => {

    const { userId, dateTime } = req.body;


    if (typeof userId !== "number" || Number.isNaN(userId)) {

        return res.status(400).json({
            message: "El ID debe ser un número válido."
        });
    }


    if (typeof dateTime !== "string") {

        return res.status(400).json({
            message: "La fecha ingresada debe ser texto."
        });
    }


    //Transformamos el string recibido a Date.
    const parsedDate = new Date(dateTime);


    //Si getTime devuelve NaN, la fecha es inválida.
    if (Number.isNaN(parsedDate.getTime())) {

        return res.status(400).json({
            message: "La fecha y hora no tienen un formato válido."
        });
    }


    //No permitimos reservar fechas pasadas.
    if (parsedDate < new Date()) {

        return res.status(400).json({
            message: "La fecha ingresada ya pasó."
        });
    }


    //Verificamos que el usuario exista.
    const user = await getUserByIdService(userId);


    if (user === null) {

        return res.status(404).json({
            message: "No existe un usuario con ese ID."
        });
    }


    //Buscamos si ya existe un turno activo en esa fecha.
    const existingAppointment =
        await findAppointmentConflictService(parsedDate);


    if (existingAppointment !== null) {

        return res.status(409).json({
            message: "El turno en esta fecha ya está ocupado."
        });
    }


    const appointmentCreate =
        await createAppointmentService(userId, parsedDate);


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