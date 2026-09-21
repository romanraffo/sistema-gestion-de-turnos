//Si el endpoint tiene que ver con usuarios, lo lógico es definirlo en: src/routes/user.routes.ts

import { Router } from "express";
import prisma from "../lib/prisma";
import { getUsers } from "../controllers/user.controller";

const router = Router();

router.get("/", getUsers);

//devuelve los usuarios buscados por id
router.get("/id/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({
      message: "El ID debe ser un número."
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: id
    }
  });

  if (user === null) {
    return res.status(404).json({
      message: "El usuario con ese ID no existe."
    });
  }

  return res.status(200).json(user);
});

//buscar usuarios por nombre
router.get("/name/:name", async (req, res) => {
  const name = req.params.name;

  if (typeof name !== "string") {
    return res.status(400).json({
      message: "El nombre debe ser texto."
  });
  }

  const users = await prisma.user.findMany({ //Esa línea es básicamente la consulta a la base de datos a través de Prisma. y los usuarios encontrados en la db se guardan en la variable users.
  where: {
    name: name
  }
  });
  
  if (users.length === 0) {
    return res.status(404).json({
      message: "Ese nombre no se encuentra registrado"
    });
  }

  return res.status(200).json(users)
  
})

//actualizar datos concretos de usuarios con PATCH
router.patch("/id/:id", async(req, res) => {
  const id = Number(req.params.id);

  const { name } = req.body; //campo del body, donde se pone el nombre a cambiar.

  if(Number.isNaN(id)) {
    return res.status(400).json({
      message: "El id tiene que ser número."
    })
  }

  if (typeof name !== "string" || name.trim() === "") { //cuando en el json pongame el nuevo "nombre" del usuario, verificar si es string y si no es "vacio"
    return res.status(400).json({
      message: "El nombre debe ser un texto válido."
    });
  }

  const user = await prisma.user.findUnique({ //Esa línea es básicamente la consulta a la base de datos a través de Prisma. y los usuarios encontrados en la db se guardan en la variable users.
  where: {
    id: id 
  }
  });

  if (user === null) {
    return res.status(404).json({
      message: "No existe un usuario con ese ID."
    })
  }


  const updateUser = await prisma.user.update({
    where: { //where significa “buscá el usuario que tenga este id”
      id
    },
    data: { //data significa “a ese usuario, cambiale estos campos”
      name
    }
  });

  return res.status(200).json({
    message: "Usuario actualizado correctamente.",
    user: updateUser
  });
})

//crea usuarios, si el Email se repite no se crea
router.post("/", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      message: "Name y email son obligatorios"
    });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email
    }
  });

  return res.status(201).json({
    message: "Usuario creado correctamente",
    user
  });
});

//Borra el usuario por id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({
      message: "El ID debe ser un número."
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id
    }
  });

  if (user === null) {
    return res.status(404).json({
      message: "El usuario con ese ID no existe."
    });
  }

  const deletedUser = await prisma.user.delete({
    where: {
      id
    }
  });

  return res.status(200).json({
    message: "Usuario eliminado correctamente.",
    user: deletedUser
  });
});

export default router;