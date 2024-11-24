const Comisiones = require("../models/comisiones");
const GroupComision = require("../models/groupComision");
const rolComision = require("../models/rolComision");
const User = require("../models/user");
const Year = require("../models/year");
const { logActivity } = require("../sql/appLog");
const CourseSedeAssignment = require("../models/courseSedeAssignment");
const CourseAssignment = require("../models/courseAssignment");
const EstudianteComision = require("../models/estudianteComision");

// Crear un grupo de comisión
const createGroupComision = async (req, res) => {
  const { year, sede_id, groupData } = req.body;
  try {
    // Verificar año y sede
    const yearData = await Year.findOne({ where: { year } });
    if (!yearData) {
      return res.status(404).json({ message: "Año no encontrado" });
    }
    const year_id = yearData.year_id;

    // Validar que no exista más de una comisión por año y sede
    const existingGroup = await GroupComision.findOne({
      where: { year_id, sede_id },
    });

    if (existingGroup) {
      return res.status(400).json({
        message:
          "Ya existe un grupo de comisión para el año y sede especificados",
      });
    }

    // Crear el grupo de comisión
    const group = await GroupComision.create({ year_id, sede_id });

    // Verificar el número de usuarios ya asignados a la comisión
    const existingComisionCount = await Comisiones.count({
      where: { group_id: group.group_id },
    });

    // Validar que no haya más de 6 usuarios
    if (existingComisionCount + groupData.length > 6) {
      return res.status(400).json({
        message: "No se pueden agregar más de 6 usuarios a la comisión",
      });
    }

    // Asignar usuarios al grupo de comisión y obtener el comision_id
    let group_id = null;
    for (const member of groupData) {
      const { user_id, rol_comision_id } = member;

      const user = await User.findByPk(user_id);
      const rol = await rolComision.findByPk(rol_comision_id);

      if (user && rol) {
        const comision = await Comisiones.create({
          group_id: group.group_id,
          year_id,
          user_id,
          rol_comision_id,
        });
        group_id = comision.group_id; // Guardar el comision_id generado
      }
    }

    // Si no se encontró comision_id, abortamos
    if (!group_id) {
      return res.status(500).json({ message: "Error al crear la comisión" });
    }

    // Obtener el asigCourse_id de CourseSedeAssignment
    const courseSede = await CourseSedeAssignment.findOne({
      where: { year_id, sede_id, course_id: 2 },
    });

    if (!courseSede) {
      return res.status(404).json({
        message: "No se encontró la asignación para el curso con course_id: 2",
      });
    }

    // Obtener los estudiantes asociados a ese asigCourse_id
    const estudiantes = await CourseAssignment.findAll({
      where: { asigCourse_id: courseSede.asigCourse_id },
      include: [
        {
          model: User,
          attributes: ["user_id"],
        },
      ],
    });

    // Formatear los estudiantes para devolver solo la información que se necesita
    const estudiantesFormat = estudiantes.map((estudiante) => {
      return {
        User: estudiante.User, // Obtener solo la información del usuario
      };
    });

    // Registrar los estudiantes en la tabla EstudianteComision
    for (let estudiante of estudiantesFormat) {
      const estudianteData = estudiante.User;

      await EstudianteComision.create({
        group_id, // Usamos el comision_id generado
        user_id: estudianteData.user_id, // ID del usuario (estudiante)
        year_id: year_id, // Año de registro
      });
    }

    // Respuesta exitosa
    res.status(201).json({
      message: "Grupo de comisión creado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor al crear el grupo de comisión",
      error: error.message,
    });
  }
};

// Eliminar usuario de una comisión
const removeUserFromComision = async (req, res) => {
  const { group_id, user_id } = req.params;

  try {
    const comision = await Comisiones.findOne({ where: { group_id, user_id } });
    if (!comision) {
      return res
        .status(404)
        .json({ message: "Usuario no encontrado en esta comisión" });
    }

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

// Agregar usuario a una comisión existente
const addUserToComision = async (req, res) => {
  const { group_id } = req.params;
  const { user_id, rol_comision_id } = req.body;

  try {
    const groupExists = await GroupComision.findByPk(group_id);
    if (!groupExists) {
      return res
        .status(404)
        .json({ message: "Grupo de comisión no encontrado" });
    }

    const user = await User.findByPk(user_id);
    const rol = await rolComision.findByPk(rol_comision_id);

    if (!user || !rol) {
      return res
        .status(400)
        .json({ message: "Usuario o rol de comisión no válido" });
    }

    // Verificar el número de usuarios actuales en la comisión
    const existingComisionCount = await Comisiones.count({
      where: { group_id: groupExists.group_id },
    });

    // Validar que no haya más de 6 usuarios
    if (existingComisionCount >= 6) {
      return res.status(400).json({
        message: "No se pueden agregar más de 6 usuarios a la comisión",
      });
    }
    const comision = await Comisiones.create({
      group_id,
      year_id: groupExists.year_id,
      sede_id: groupExists.sede_id,
      user_id,
      rol_comision_id,
    });

    res.status(201).json({
      message: "Usuario agregado a la comisión exitosamente",
      comision,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor al agregar el usuario a la comisión",
      error: error.message,
    });
  }
};

// Obtener grupos de comisión y usuarios por sede y año
const getGroupsAndUsersBySedeAndYear = async (req, res) => {
  const { sede_id, year } = req.params;

  try {
    // Verificar si el año existe en la base de datos
    const yearData = await Year.findOne({ where: { year } });
    if (!yearData) {
      return res.status(404).json({ message: "Año no encontrado" });
    }
    const year_id = yearData.year_id;

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
              ? `${process.env.BASE_URL}/public/fotoPerfil/${comision.User.profilePhoto}`
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
  getGroupsAndUsersBySedeAndYear, // Función unificada
};
