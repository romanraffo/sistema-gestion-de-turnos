# Frontend demo v4 — Sistema de Gestión de Turnos

Versión aprobada visualmente antes de conectarla al backend.

## Branding
- Marca: **ROTECH**
- Producto: **Sistema de turnos**
- Footer:
  - © 2026 Rotech · Sistema de turnos
  - Desarrollado por Román Raffo
  - Link al repositorio GitHub

## Responsive
Se reforzó el diseño para:
- desktop;
- notebook;
- tablet;
- celulares medianos;
- celulares angostos (~320–420px).

## Flujo
- Sin sesión: no aparece el bloque Próximo turno.
- USER: ve solo sus turnos.
- USER sin reservas: ve “No tenés reservas”.
- ADMIN: ve el próximo turno activo del sistema.
- ADMIN sin turnos: ve mensaje de sistema vacío.
- ADMIN puede editar fecha, hora y estado en Gestión general.

## Repo
https://github.com/romanraffo/sistema-gestion-de-turnos

## Usuarios de demo
- `roman@gmail.com` → USER con turno.
- cualquier otro email normal → USER sin reservas.
- `admin@gmail.com` → ADMIN.

## Ejecutar
```bash
npm install
npm run dev
```
