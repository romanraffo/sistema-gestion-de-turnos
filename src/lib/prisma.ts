import "dotenv/config"; //carga las variables del .env.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL!; //Entonces por "import "dotenv/config";" process.env.DATABASE_URL puede leer DATABASE_URL="postgresql://postgres:postgres@localhost:5432/turnos_db"

const adapter = new PrismaPg({ //crea el adaptador de PostgreSQL.
  connectionString
});

const prisma = new PrismaClient({
  adapter
});

export default prisma;