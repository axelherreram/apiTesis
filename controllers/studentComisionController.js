const { Op } = require("sequelize");
const EstudianteComision = require("../models/estudianteComision");
const User = require("../models/user");
const Year = require("../models/year");
const GroupComision = require("../models/groupComision");

const getStudentsComisionByYear = async (req, res) => {
  const { year, sede_id } = req.params;
  const { sede_id: tokenSedeId } = req; 
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

    // Buscar los grupos de comisión asociados al año y sede
    const groups = await GroupComision.findAll({
      where: { year_id, sede_id },
      attributes: ["group_id", "year_id", "sede_id"],
      include: [
        {
          model: EstudianteComision,
          as: "estudianteComisiones",
          attributes: ["user_id"],
        },
      ],
    });

    if (groups.length === 0) {
      return res.status(404).json({
        message: "No se encontraron grupos de comisión para el año y la sede especificados",
      });
    }

    // Obtener todos los user_id asociados a las comisiones de los grupos
    const userIds = groups.flatMap((group) =>
      group.estudianteComisiones.map((estudiante) => estudiante.user_id)
    );

    // Buscar los usuarios con los user_id encontrados
    const users = await User.findAll({
      where: {
        user_id: {
          [Op.in]: userIds,
        },
      },
      attributes: ["user_id", "email", "name", "carnet", "profilePhoto"],
    });

    if (users.length === 0) {
      return res.status(404).json({ message: "No se encontraron usuarios" });
    }

    // Formatear la respuesta e incluir la URL de la foto de perfil usando la variable de entorno BASE_URL
    const result = users.map((user) => ({
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      carnet: user.carnet,
      profilePhoto: user.profilePhoto
        ? `${process.env.BASE_URL}/public/fotoPerfil/${user.profilePhoto}`
        : null,
    }));

    res.status(200).json({ users: result });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los usuarios por año y sede",
      error: error.message,
    });
  }
};

module.exports = {
  getStudentsComisionByYear,
};
