import prisma from "../lib/prisma";

//services: contienen la lógica que trabaja con los datos y muchas veces la lógica de negocio. Ahí es donde suele aparecer Prisma.

//Trae todos los turnos junto con el usuario relacionado.
export const getAllAppointmentsService = async () => {

    return await prisma.appointment.findMany({
        include: {
            user: true
        }
    });
};

//Ese trae solo los turnos de un usuario específico.
export const getAppointmentsByUserService = async (userId: number) => {

    return await prisma.appointment.findMany({
        where: {
            userId
        },
        include: {
            user: true
        }
    });
};


//Busca un turno por ID.
export const getAppointmentByIdService = async (id: number) => {

    return await prisma.appointment.findUnique({
        where: {
            id
        },
        include: {
            user: true
        }
    });
};


//Busca si ya existe un turno activo en determinada fecha.
export const findAppointmentConflictService = async (
    dateTime: Date,
    excludeId?: number
) => {

    return await prisma.appointment.findFirst({
        where: {
            dateTime,

            status: {
                not: "CANCELLED"
            },

            //Si estamos editando un turno,
            //ignoramos el mismo turno.
            ...(excludeId !== undefined && {
                id: {
                    not: excludeId
                }
            })
        }
    });
};


//Crea un turno.
export const createAppointmentService = async (
    userId: number,
    dateTime: Date
) => {

    return await prisma.appointment.create({
        data: {
            userId,
            dateTime
        }
    });
};


//Actualiza un turno.
export const updateAppointmentService = async (
    id: number,
    dataToUpdate: any
) => {

    return await prisma.appointment.update({
        where: {
            id
        },
        data: dataToUpdate
    });
};
