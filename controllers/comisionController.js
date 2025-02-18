const Comisiones = require("../models/comisiones");
const GroupComision = require("../models/groupComision");
const rolComision = require("../models/rolComision");
const User = require("../models/user");
const Year = require("../models/year");
const { logActivity } = require("../sql/appLog");
const CourseSedeAssignment = require("../models/courseSedeAssignment");
const CourseAssignment = require("../models/courseAssignment");
const studentComision = require("../models/studentComision");
const { sequelize } = require("../config/database");

/**
 * The function `createGroupComision` creates a commission group with specific validations and
 * assignments based on the provided data.
 * @param req - The `req` parameter in the `createGroupComision` function represents the request
 * object, which contains information sent to the server as part of an HTTP request. This information
 * typically includes data submitted through a form, query parameters, request headers, and more.
 * @param res - The `res` parameter in the `createGroupComision` function is the response object that
 * will be used to send back the response to the client making the request. It is typically used to set
 * the status code and send JSON data back to the client.
 * @returns The `createGroupComision` function returns a response with status code and a JSON object
 * containing a message based on the outcome of the function execution. Here are the possible return
 * scenarios:
 */
const createGroupComision = async (req, res) => {
  const { year, sede_id: requestSedeId, groupData } = req.body;
  const { sede_id: tokenSedeId } = req;

  const transaction = await sequelize.transaction(); // Inicia una transacción

  try {
    // 1. Validar coincidencia de sede
    if (parseInt(requestSedeId, 10) !== parseInt(tokenSedeId, 10)) {
      return res
        .status(403)
        .json({ message: "No tienes acceso para esta sede" });
    }

    // 2. Validar existencia del año
    const yearData = await Year.findOne({ where: { year } });
    if (!yearData) {
      return res.status(404).json({ message: "Año no encontrado" });
    }
    const year_id = yearData.year_id;
    // 3. Validar tamaño mínimo del grupo
    if (groupData.length < 3) {
      return res.status(400).json({
        message: "La comisión debe tener al menos 3 usuarios",
      });
    }
    // 3. Verificar que no exista otro grupo para el mismo año y sede
    const existingGroup = await GroupComision.findOne({
      where: { year_id, sede_id: requestSedeId },
    });
    if (existingGroup) {
      return res
        .status(400)
        .json({ message: "Ya existe una comisión para este año y sede" });
    }

    // 4. Validar asignación del curso
    const courseSede = await CourseSedeAssignment.findOne({
      where: { year_id, sede_id: requestSedeId, course_id: 2 },
    });
    if (!courseSede) {
      return res
        .status(404)
        .json({ message: "Curso no asignado: Proyecto de Graduación II" });
    }

    // 5. Validar estudiantes asignados al curso
    const estudiantes = await CourseAssignment.findAll({
      where: { asigCourse_id: courseSede.asigCourse_id },
      include: [{ model: User, attributes: ["user_id"] }],
    });
    if (!estudiantes || estudiantes.length === 0) {
      return res
        .status(404)
        .json({ message: "No hay estudiantes asignados al curso" });
    }

    // 6. Crear grupo de comisión
    const group = await GroupComision.create(
      { year_id, sede_id: requestSedeId },
      { transaction }
    );

    // 7. Validar roles únicos en groupData antes de asignar
    const existingRoles = new Set();
    for (const member of groupData) {
      const { rol_comision_id } = member;

      if (existingRoles.has(rol_comision_id)) {
        throw new Error(
          `El rol ${rol_comision_id} ya está asignado en el grupo.`
        );
      }
      existingRoles.add(rol_comision_id);

      const rol = await rolComision.findByPk(rol_comision_id);
      if (!rol) {
        throw new Error(`El rol ${rol_comision_id} no existe.`);
      }
    }

    // 8. Asignar usuarios al grupo
    for (const member of groupData) {
      const { user_id, rol_comision_id } = member;

      const user = await User.findByPk(user_id);
      if (!user) {
        throw new Error(`El usuario ${user_id} no existe.`);
      }

      await Comisiones.create(
        { group_id: group.group_id, year_id, user_id, rol_comision_id },
        { transaction }
      );
    }

    // 9. Asignar estudiantes al grupo
    for (const estudiante of estudiantes) {
      await studentComision.create(
        {
          group_id: group.group_id,
          user_id: estudiante.User.user_id,
          year_id,
        },
        { transaction }
      );
    }

    // Confirmar la transacción
    await transaction.commit();

    res.status(201).json({ message: "Grupo de comisión creado exitosamente" });
  } catch (error) {
    // Revertir cambios si hay un error
    await transaction.rollback();
    res
      .status(500)
      .json({ message: "Error al crear el grupo", error: error.message });
  }
};

/**
 * The function `removeUserFromComision` removes a user from a commission group based on certain
 * conditions and permissions.
 * @param req - The `removeUserFromComision` function is designed to handle a request to remove a user
 * from a commission group. It performs several checks and validations before proceeding with the
 * removal. Here's a breakdown of the process:
 * @param res - The `res` parameter in the `removeUserFromComision` function is the response object
 * that will be used to send back the response to the client making the request. It is typically used
 * to send HTTP responses with status codes, headers, and data back to the client. In this function,
 * @returns The function `removeUserFromComision` is returning JSON responses based on different
 * scenarios:
 * 1. If the year data is not found, it returns a 404 status with a message "Año no encontrado".
 * 2. If the group of comision is not found, it returns a 404 status with a message "Grupo de comisión
 * no encontrado".
 * 3. If the user tries to remove
 */
const removeUserFromComision = async (req, res) => {
  const { group_id, user_id } = req.params;
  const { sede_id: tokenSedeId } = req; // Sede extraída del token

  try {
    const currentYear = new Date().getFullYear();
    const yearData = await Year.findOne({ where: { year: currentYear } });
    if (!yearData) {
      return res.status(404).json({ message: "Año no encontrado" });
    }
    const year_id = yearData.year_id;

    // Verificar si el grupo existe
    const group = await GroupComision.findOne({ where: { group_id } });
    if (!group) {
      return res
        .status(404)
        .json({ message: "Grupo de comisión no encontrado" });
    }

    const year_id_group = group.year_id;

    if (parseInt(year_id, 10) !== parseInt(year_id_group, 10)) {
      return res.status(400).json({
        message: "No es posible eliminar usuarios de grupos de años anteriores",
      });
    }

    // Validar que el grupo pertenezca a la sede autorizada
    if (parseInt(group.sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res
        .status(403)
        .json({ message: "No tienes acceso para esta sede" });
    }

    // Buscar al usuario en la comisión
    const comision = await Comisiones.findOne({ where: { group_id, user_id, year_id } });
    if (!comision) {
      return res
        .status(404)
        .json({ message: "Usuario no encontrado en esta comisión" });
    }

    // Verificar el número actual de usuarios en la comisión
    const existingComisionCount = await Comisiones.count({
      where: { group_id },
    });

    // Validar que el grupo no quede con menos de 3 usuarios
    if (existingComisionCount <= 2) {
      return res.status(400).json({
        message:
          "No se puede eliminar al usuario, el grupo debe tener al menos 2 usuarios",
      });
    }

    // Eliminar al usuario de la comisión
    await comision.destroy();
    res
      .status(200)
      .json({ message: "Usuario eliminado de la comisión exitosamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor al eliminar el usuario de la comisión",
      error: error.message,
    });
  }
};

/**
 * The function `addUserToComision` adds a user with a specific role to a commission group while
 * performing various validations and error handling.
 * @param req - The `req` parameter in the `addUserToComision` function represents the HTTP request
 * object, which contains information about the incoming request from the client, such as request
 * headers, parameters, body, etc. It is typically provided by the Express.js framework when handling
 * HTTP requests in a Node.js
 * @param res - The `res` parameter in the `addUserToComision` function is the response object that
 * will be used to send back the response to the client making the request. It is typically used to
 * send HTTP responses with status codes, headers, and data back to the client. In the provided code
 * @returns The function `addUserToComision` returns a response with status code and a JSON object
 * containing a message based on different scenarios:
 */
const addUserToComision = async (req, res) => {
  const { group_id } = req.params;
  const { user_id, rol_comision_id } = req.body;
  const { sede_id: tokenSedeId } = req; // Sede extraída del token

  try {
    // Verificar si el grupo de comisión existe
    const groupExists = await GroupComision.findByPk(group_id);
    if (!groupExists) {
      return res
        .status(404)
        .json({ message: "Grupo de comisión no encontrado" });
    }

    // Validar si el grupo pertenece a la sede autorizada
    if (parseInt(groupExists.sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res
        .status(403)
        .json({ message: "No tienes acceso para esta sede" });
    }

    // Verificar que el usuario y el rol de comisión existan
    const user = await User.findByPk(user_id);
    const rol = await rolComision.findByPk(rol_comision_id);

    if (!user || !rol) {
      return res
        .status(400)
        .json({ message: "Usuario o rol de comisión no válido" });
    }

    // Verificar si el usuario ya está en la comisión
    const existingUserInComision = await Comisiones.findOne({
      where: { group_id, user_id },
    });

    if (existingUserInComision) {
      return res.status(400).json({
        message: "El usuario ya está asignado a esta comisión",
      });
    }

    // Verificar el número de usuarios actuales en la comisión
    const existingComisionCount = await Comisiones.count({
      where: { group_id: groupExists.group_id },
    });

    // Validar que no haya más de 5 usuarios en la comisión
    if (existingComisionCount >= 5) {
      return res.status(400).json({
        message: "No se pueden agregar más de 5 usuarios a la comisión",
      });
    }

    // Verificar que el rol no se repita en la comisión
    const existingRoleInComision = await Comisiones.findOne({
      where: { group_id, rol_comision_id },
    });

    if (existingRoleInComision) {
      return res.status(400).json({
        message: "El rol de comisión ya está asignado a esta comisión",
      });
    }

    // Crear la nueva entrada en la tabla Comisiones
    const comision = await Comisiones.create({
      group_id,
      year_id: groupExists.year_id,
      sede_id: groupExists.sede_id,
      user_id,
      rol_comision_id,
    });

    res.status(201).json({
      message: "Usuario agregado a la comisión exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor al agregar el usuario a la comisión",
      error: error.message,
    });
  }
};

/**
 * The function `getGroupsAndUsersBySedeAndYear` retrieves groups of commission and their users based
 * on a specific location and year, handling error cases appropriately.
 * @param req - The function `getGroupsAndUsersBySedeAndYear` is an asynchronous function that
 * retrieves groups and users based on the `sede_id` (location ID) and `year` parameters from the
 * request object (`req`). Here's a breakdown of the function:
 * @param res - The function `getGroupsAndUsersBySedeAndYear` is an asynchronous function that
 * retrieves groups of users based on the provided `sede_id` (location ID) and `year`. Here's a
 * breakdown of the function:
 * @returns The function `getGroupsAndUsersBySedeAndYear` is returning JSON responses based on the
 * logic within the function. Here are the possible responses:
 */
const getGroupsAndUsersBySedeAndYear = async (req, res) => {
  const { sede_id, year } = req.params;
  const { sede_id: tokenSedeId } = req; // Sede extraída del token

  try {
    // Verificar si el año existe en la base de datos
    const yearData = await Year.findOne({ where: { year } });
    if (!yearData) {
      return res.status(404).json({ message: "Año no encontrado" });
    }
    const year_id = yearData.year_id;

    // Validar que el `sede_id` del token coincida con el `sede_id` de la solicitud
    if (parseInt(sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res
        .status(403)
        .json({ message: "No tienes acceso a los grupos de esta sede" });
    }

    // Buscar los grupos de comisión para el año y la sede
    const groups = await GroupComision.findAll({
      where: { year_id, sede_id },
      attributes: ["group_id", "year_id", "sede_id"],
      include: [
        {
          model: Comisiones,
          as: "comisiones",
          attributes: ["user_id"],
          include: [
            {
              model: User,
              attributes: [
                "user_id",
                "email",
                "name",
                "carnet",
                "profilePhoto",
              ],
            },
            {
              model: rolComision,
              attributes: ["rolComisionName"],
            },
          ],
        },
      ],
    });

    if (groups.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron grupos de comisión para la sede y el año especificados",
      });
    }

    // Formatear la respuesta para incluir solo los grupos con sus usuarios y roles
    const result = groups.map((group) => {
      return {
        group_id: group.group_id,
        year_id: group.year_id,
        sede_id: group.sede_id,
        users: (group.comisiones || []).map((comision) => {
          return {
            user_id: comision.User.user_id,
            email: comision.User.email,
            nombre: comision.User.name,
            carnet: comision.User.carnet,
            rol: comision.rolComision.rolComisionName, // Rol asociado al usuario
            profilePhoto: comision.User.profilePhoto
              ? `${process.env.BASE_URL}/public/profilephoto/${comision.User.profilePhoto}`
              : null, // Ruta de la foto de perfil si existe
          };
        }),
      };
    });

    res.status(200).json({ groups: result });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los grupos de comisión y los usuarios",
      error: error.message,
    });
  }
};

module.exports = {
  createGroupComision,
  removeUserFromComision,
  addUserToComision,
  getGroupsAndUsersBySedeAndYear, 
};
