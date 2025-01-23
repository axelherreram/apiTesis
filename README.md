# Proyecto: API para Gestión de Tesis y Asignación de Estudiantes

Este proyecto es una API desarrollada para la gestión de tesis y la asignación de estudiantes a catedráticos en un entorno académico. Está construido con Node.js y Express, utilizando Sequelize como ORM para interactuar con una base de datos MySQL.

## Tabla de Contenidos

1. [Características Principales](#características-principales)
2. [Middlewares Importantes](#middlewares-importantes)
3. [Requisitos Previos](#requisitos-previos)
4. [Configuración](#configuración)
5. [Scripts Disponibles](#scripts-disponibles)
6. [Documentación Swagger](#documentación-swagger)
7. [Contribución](#contribución)

---

## Características Principales

- Gestión de tesis y estudiantes.
- Asignación de catedráticos y comisiones.
- Seguimiento de tareas, entregas y comentarios.
- Generación de gráficas y reportes.
- Envío de correos electrónicos con notificaciones.
- Subida de archivos (PDFs y Excels).
- Validación y roles de usuarios.
- Documentación interactiva con Swagger.

---
## Middlewares Importantes

### `authMiddleware.js`
Valida si el usuario está autenticado mediante un token JWT.

### `roleMiddleware.js`
Verifica si el usuario tiene los permisos necesarios según su rol.

### `uploadMiddleware.js`
Maneja la subida de archivos, validando el tipo de archivo y su tamaño.

### `validateUser.js`
Comprueba que el usuario tiene acceso autorizado a los recursos que solicita.

### `obtenerUserIdDeToken.js`
Extrae el ID del usuario autenticado del token JWT.

---

## Requisitos Previos

- Node.js v14 o superior.
- MySQL instalado y configurado.
- Dependencias instaladas con `npm install`.

---

## Configuración

1. Renombra el archivo `.env.example` a `.env` y configura las variables de entorno.
3. Ejecuta el servidor con `npm run dev`.

---

## Scripts Disponibles

- `npm start`: Inicia el servidor en modo producción.
- `npm run dev`: Inicia el servidor en modo desarrollo.


---

## Documentación Swagger

La API incluye documentación interactiva generada con Swagger. Para acceder, inicia el servidor y dirígete a `http://localhost:3000/api-docs`.

