const GroupComision = require("../models/groupComision");
const Comisiones = require("../models/comisiones");
const User = require("../models/user");
const Sede = require("../models/sede");
const Year = require("../models/year");

// Listar todos los usuarios por grupo y sede
const listUsersByGroupAndSede = async (req, res) => {
  const { group_id, sede_id } = req.query;
  const { sede_id: tokenSedeId } = req; // Sede extraída del token

  try {
    // Verificar que el `sede_id` del token coincida con el `sede_id` de la solicitud
    if (parseInt(sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res
        .status(403)
        .json({ message: "No tienes acceso a los usuarios de esta sede" });
    }

    // Verificar que el grupo de comisión exista
    const groupComision = await GroupComision.findOne({
      where: { group_id, sede_id },
    });
    if (!groupComision) {
      return res.status(404).json({
        message: "Grupo de comisión no encontrado para la sede especificada",
      });
    }

    // Obtener todas las comisiones en el grupo especificado
    const comisiones = await Comisiones.findAll({
      where: { group_id },
      include: [
        {
          model: User,
          attributes: ["user_id", "name", "email"],  // Asegúrate de que estos campos sean correctos
        }
      ],
    });

    // Formatear la respuesta con los datos de los usuarios
    const usuarios = comisiones.map((comision) => {
      const user = comision.User; // Acceder a la relación User correctamente

      // Si existe el usuario, devolver sus datos; si no, poner los valores por defecto
      return user ? {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
      } : {
        user_id: null,
        name: "Usuario no disponible",
        email: "No disponible",
      };
    });

    // Devolver la respuesta con los usuarios
    res.status(200).json({ group_id, sede_id, usuarios });
  } catch (error) {
    console.error("Error al listar los usuarios por grupo y sede:", error);
    res.status(500).json({
      message: "Error en el servidor al listar los usuarios por grupo y sede",
      error: error.message,
    });
  }
};


// Listar grupos por sede y año
const listGroupBySedeAndYear = async (req, res) => {
  const { sede_id, year } = req.query;
  const { sede_id: tokenSedeId } = req; // Sede extraída del token

  try {
    // Verificar que el `sede_id` del token coincida con el `sede_id` de la solicitud
    if (parseInt(sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res
        .status(403)
        .json({ message: "No tienes acceso a los grupos de esta sede" });
    }

    // Verificar que el año exista
    const yearData = await Year.findOne({ where: { year } });
    if (!yearData) {
      return res.status(404).json({ message: "Año no encontrado" });
    }
    const year_id = yearData.year_id;

    // Verificar que la sede exista
    const sede = await Sede.findByPk(sede_id);
    if (!sede) {
      return res.status(404).json({ message: "Sede no encontrada" });
    }

    // Obtener los grupos de comisión filtrados por sede y año
    const groups = await GroupComision.findAll({
      where: { sede_id, year_id },
    });

    res.status(200).json({ groups });
  } catch (error) {
    console.error("Error al listar los grupos de comisión:", error);
    res.status(500).json({
      message: "Error en el servidor al listar los grupos de comisión",
      error: error.message,
    });
  }
};

module.exports = {
  listUsersByGroupAndSede,
  listGroupBySedeAndYear,
};
