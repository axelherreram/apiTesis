# Proyecto: API para Gestión de Tesis y Asignación de Estudiantes

Este proyecto es una API desarrollada para la gestión de tesis y la asignación de estudiantes a catedráticos en un entorno académico. Está construido con Node.js y Express, utilizando Sequelize como ORM para interactuar con una base de datos MySQL.

## Tabla de Contenidos

1. [Características Principales](#características-principales)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Seguridad](#seguridad)
4. [Middlewares Importantes](#middlewares-importantes)
5. [Estructura de la API](#estructura-de-la-api)
6. [Requisitos Previos](#requisitos-previos)
7. [Configuración](#configuración)
8. [Scripts Disponibles](#scripts-disponibles)
9. [Documentación Swagger](#documentación-swagger)
10. [Contribución](#contribución)

---

## Características Principales

- Gestión completa de tesis y estudiantes
- Sistema de asignación de catedráticos y comisiones
- Seguimiento de tareas, entregas y comentarios
- Generación de gráficas y reportes estadísticos
- Sistema de notificaciones por correo electrónico
- Gestión de archivos (PDFs y Excels)
- Sistema de autenticación y autorización basado en roles
- Documentación interactiva con Swagger
- Rate limiting para protección contra abusos
- CORS configurado para múltiples orígenes

---

## Arquitectura del Proyecto

El proyecto sigue una arquitectura modular con las siguientes capas:

- **Routes**: Manejo de rutas y endpoints de la API
- **Controllers**: Lógica de negocio y procesamiento de requests
- **Models**: Definición de modelos de datos y relaciones
- **Middlewares**: Funciones intermedias para validación y procesamiento
- **Config**: Configuraciones de la aplicación
- **Utils**: Funciones de utilidad y helpers
- **Docs**: Documentación de la API (Swagger)

---

## Seguridad

El proyecto implementa varias capas de seguridad:

- **Rate Limiting**: Limita las peticiones por IP (100 requests/15min)
- **JWT Authentication**: Autenticación basada en tokens
- **Role-based Access Control**: Control de acceso basado en roles
- **CORS Protection**: Configuración de orígenes permitidos
- **Input Validation**: Validación de datos de entrada
- **Secure Headers**: Headers de seguridad configurados
- **File Upload Restrictions**: Validación de tipos y tamaños de archivo

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

### `getUserIdToken.js`
Extrae el ID del usuario autenticado del token JWT.

---

## Estructura de la API

La API está organizada en los siguientes módulos principales:

- `/auth`: Autenticación y gestión de usuarios
- `/api/users`: Gestión de usuarios
- `/api/tasks`: Gestión de tareas
- `/api/courses`: Gestión de cursos
- `/api/students`: Gestión de estudiantes
- `/api/thesis`: Gestión de tesis
- `/api/comments`: Sistema de comentarios
- `/api/notifications`: Sistema de notificaciones
- `/api/graphics`: Generación de reportes y gráficas

---

## Requisitos Previos

- Node.js v14 o superior
- MySQL 8.0 o superior
- npm o yarn como gestor de paquetes
- Git para control de versiones

---

## Configuración

1. Clona el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   - Copia `.env.example` a `.env`
   - Configura las variables necesarias (DB, JWT_SECRET, etc.)

4. Inicia la base de datos:
   ```bash
   npm run db:setup
   ```

5. Inicia el servidor:
   ```bash
   npm run dev
   ```

---

## Scripts Disponibles

- `npm start`: Inicia el servidor en modo producción
- `npm run dev`: Inicia el servidor en modo desarrollo con nodemon
- `npm run db:setup`: Configura la base de datos inicial
- `npm run test`: Ejecuta las pruebas unitarias
- `npm run lint`: Ejecuta el linter para verificar el código

---

## Documentación Swagger

La API incluye documentación interactiva generada con Swagger. Para acceder:

1. Inicia el servidor
2. Visita `http://localhost:3000/api-docs`
3. Explora los endpoints disponibles
4. Prueba las operaciones directamente desde la interfaz

---

## Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

