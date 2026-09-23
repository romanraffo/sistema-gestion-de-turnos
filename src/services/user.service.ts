import prisma from "../lib/prisma";

//services: contienen la lógica que trabaja con los datos y muchas veces la lógica de negocio. Ahí es donde suele aparecer Prisma.
//La lógica de negocio son las reglas que hacen que el sistema funcione como el cliente necesita en la vida real.

//Trae todos los usuarios.
export const getAllUsers = async () => {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });
};

//Busca un usuario por ID.
export const getUserByIdService = async (id: number) => {
  return await prisma.user.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
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
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
};


//Busca usuario por email.
export const getUserByEmailService = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
};


//Crea un usuario.
export const createUserService = async (
  name: string,
  email: string,
  password: string
) => {
  return await prisma.user.create({
    data: {
      name,
      email,
      password
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
};


//Actualiza el nombre de un usuario.
export const updateUserService = async (
  id: number,
  name: string
) => {
  return await prisma.user.update({
    where: {
      id
    },
    data: {
      name
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
};


//Elimina un usuario.
export const deleteUserService = async (id: number) => {
  return await prisma.user.delete({
    where: {
      id
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
};