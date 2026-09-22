import prisma from "../lib/prisma";

//services: contienen la lógica que trabaja con los datos y muchas veces la lógica de negocio. Ahí es donde suele aparecer Prisma.
//La lógica de negocio son las reglas que hacen que el sistema funcione como el cliente necesita en la vida real.

//Trae todos los usuarios.
export const getAllUsers = async () => {
    return await prisma.user.findMany();
};

//Busca un usuario por ID.
export const getUserByIdService = async (id: number) => {
    return await prisma.user.findUnique({
        where: {
            id
        }
    });
};

//Busca usuarios por nombre.
export const getUsersByNameService = async (name: string) => {
    return await prisma.user.findMany({
        where: {
            name: {
                equals: name,
                mode: "insensitive"
            }
        }
    });
};

//Busca usuario por email.
export const getUserByEmailService = async (email: string) => {
    return await prisma.user.findUnique({
        where: {
            email
        }
    });
};

//Crea un usuario.
export const createUserService = async (name: string, email: string) => {
    return await prisma.user.create({
        data: {
            name,
            email
        }
    });
};

//Actualiza el nombre de un usuario.
export const updateUserService = async (id: number, name: string) => {
    return await prisma.user.update({
        where: {
            id
        },
        data: {
            name
        }
    });
};

//Elimina un usuario.
export const deleteUserService = async (id: number) => {
    return await prisma.user.delete({
        where: {
            id
        }
    });
};