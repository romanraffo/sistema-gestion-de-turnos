# Notas del proyecto

## Estructura

### src/routes

La carpeta `routes` agrupa las rutas/endpoints del backend.

Cada archivo representa un grupo de endpoints relacionados con una entidad o funcionalidad.

Ejemplos:

- `user.routes.ts` -> rutas de usuarios por ej, crear un endpoint delete, etc...
- `appointment.routes.ts` -> rutas de turnos
- `auth.routes.ts` -> login, registro, recuperación de contraseña

Ejemplo:

`router.get("/")` dentro de `user.routes.ts`

junto con:

`app.use("/users", userRoutes)`

genera:

`GET /users`