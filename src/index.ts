import express from "express";
import userRoutes from "./routes/user.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";

//En routes van los endpoints que existen en la API. Normalmente son líneas cortas y con poca lógica, porque solo indican qué ruta existe y qué función se va a ejecutar.
//Después están los controllers, donde se maneja lo que viene en la request, como parámetros o datos del body, se hacen algunas validaciones y también se arma la response que se le devuelve al cliente.
//Por último están los services, donde va la lógica que trabaja con los datos y con la base de datos. Ahí suelen estar las consultas con Prisma, por ejemplo await prisma.user.findUnique(), create(), update(), etc. También puede ir lógica de negocio relacionada con esas operaciones.

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/users", userRoutes);
app.use("/appointments", appointmentRoutes)

app.get("/", (req, res) => {
  res.send("API de gestión de turnos funcionando");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});