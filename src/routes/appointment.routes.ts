import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

//GET QUE TRAE TODOS LOS TURNOS SOLICITADOS.
router.get("/", async(req, res) => {
    const appointments = await prisma.appointment.findMany({
        include: {
            user: true
        }
        });

    return res.status(200).json(appointments)
})

//GET PARA TRAER UN TURNO CONCRETO O POR ID.
router.get("/:id", async(req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
    return res.status(400).json({
      message: "El ID debe ser un número."
    });
    };

    const appointment = await prisma.appointment.findUnique({
        where: {
            id
        },
        include: {
            user: true
        }
    })

    if (appointment === null) {
        return res.status(404).json({
            message: "El turno el cual ingreso no existe."
        })
    };

    return res.status(200).json(appointment);
})


//POST QUE CREA LOS TURNOS Y LOS VINCULA AL USUARIO
router.post("/", async(req, res) => {
    const {userId, dateTime} = req.body;

    if(typeof userId !== "number" || Number.isNaN(userId)) {
        return res.status(400).json({
            message: "El id debe ser de número válido."
        })
    }

    if (typeof dateTime !== "string") {
        return res.status(400).json({
            message: "La fecha ingresada es inválida ya que debe ser texto."
        });
    }

    const parsedDate = new Date(dateTime); //JavaScript intenta transformarlo en un objeto Date el valor de la variable dateTime.
                                                    //parsedDate.getTime() intenta obtener el valor numérico interno de esa fecha.
    if (Number.isNaN(parsedDate.getTime())) { //Verifica si ese valor ingresado es válido. ya que si es inválido getTime() da = NaN.
        return res.status(400).json({
            message: "La fecha y hora no tienen un formato válido."
    });
    }

    if (parsedDate < new Date()){
        return res.status(409).json({
            message: "La fecha ingresada es antigua."
        })
    }

    const user = await prisma.user.findUnique({
        where: {
        id: userId
    }
    });

    if (user === null) {
        return res.status(404).json({
            message: "No existe un usuario con ese ID."
        })
    }

    //Este existingAppointment basicamente busca si existe un turno en la fecha que hay en "dateTime: parsedDate" y tambien que ese turno encontrado no tenga el estado "cancelado"
    const existingAppointment = await prisma.appointment.findFirst({ //busca en la Base de datos si existe un turno con la fecha ingresada en "parsedDate", si no existe es "null" y se puede crear
        where: {
            dateTime: parsedDate,
            status: {
                not: "CANCELLED" //Eso significa: “Buscame un turno en esa fecha cuyo estado sea distinto de CANCELLED.”
            }
        }
    });

    if (existingAppointment !== null) { //si existingAppointment es distinto de null, quiere decir que existe. sino se puede crear.
        return res.status(409).json({
            message: "El turno en esta fecha ya está ocupado."
        })
    }

    const appointmentCreate = await prisma.appointment.create({ 
        data: {
            userId,
            dateTime: parsedDate
        }
    })

    res.status(201).json({
        message: "Turno solicitado de forma correcta!",
        appointmentCreate
    })
})

//PATCH QUE ACTUALIZA DATOS DEL TURNO, COMO POR EJ CAMBIAR FECHA.
//PATCH
//→ los campos son opcionales
//→ valido cada uno solo si viene
//→ status debe pertenecer al enum
//→ dateTime debe convertirse a una fecha válida
router.patch("/:id", async (req, res) => {
    const id = Number(req.params.id);

    const { dateTime, status } = req.body; // campos opcionales del body que se pueden actualizar

    if (Number.isNaN(id)) {
        return res.status(400).json({
            message: "El ID debe ser un número."
        });
    }

    const appointment = await prisma.appointment.findUnique({
        where: {
            id
        }
    });

    if (appointment === null) {
        return res.status(404).json({
            message: "El turno no existe."
        });
    }

    let parsedDate: Date | undefined;

    if (dateTime !== undefined) { 
        // dateTime es opcional.
        // Si el usuario no quiere cambiar la fecha, este campo no viene en el body.

        if (typeof dateTime !== "string") {
            return res.status(400).json({
                message: "La fecha y hora deben enviarse como texto."
            });
        }

        parsedDate = new Date(dateTime); 
        // JavaScript intenta transformar el string en un objeto Date.

        if (Number.isNaN(parsedDate.getTime())) { 
            // Si getTime() da NaN, la fecha es inválida.

            return res.status(400).json({
                message: "La fecha y hora no tienen un formato válido."
            });
        }

        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                dateTime: parsedDate,
                status: {
                    not: "CANCELLED"
                },
                id: {
                    not: id
                    }
            }
        })

        if (existingAppointment !== null) {
            return res.status(409).json({
                message: "Ya existe otro turno activo en esa fecha y hora."
            });
        }
    }

    if (status !== undefined) { 
        // status es opcional.
        // Si el usuario no quiere cambiar el estado, este campo no viene en el body.

        if (typeof status !== "string" || status.trim() === "") {
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

    // Armamos el objeto solo con los campos que realmente queremos modificar.
    const dataToUpdate: any = {};

    if (parsedDate !== undefined) {
        dataToUpdate.dateTime = parsedDate;
    }

    if (status !== undefined) {
        dataToUpdate.status = status;
    }

    const updatedAppointment = await prisma.appointment.update({
        where: {
            id
        },
        data: dataToUpdate
    });

    return res.status(200).json({
        message: "Turno actualizado correctamente.",
        appointment: updatedAppointment
    });
});


export default router;