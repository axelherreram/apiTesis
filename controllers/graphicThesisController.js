const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const ApprovalThesis = require("../models/approvalThesis");
const RevisionThesis = require("../models/revisionThesis");
const Sede = require("../models/sede");
const User = require("../models/user");

const getRevisionStatistics = async (req, res) => {
  try {
    // Total de revisiones recibidas (todas las revisiones)
    const totalRevisions = await RevisionThesis.count();

    // Total de revisiones aprobadas
    const totalApprovedRevisions = await ApprovalThesis.count({
      where: { status: "approved" },
    });

    // Total de revisiones no aprobadas (rechazadas)
    const totalRejectedRevisions = await ApprovalThesis.count({
      where: { status: "rejected" },
    });

    // Total de revisiones activas
    const totalActiveRevisions = await RevisionThesis.count({
      where: { active_process: true },
    });
    // total de revisores
    const totalRevisores = await User.count({
      where: { rol_id: { [Op.in]: [6] } },
    });

    // Respuesta exitosa
    res.status(200).json({
      message: "Estadísticas de revisiones obtenidas con éxito",
      data: {
        totalRevisions,
        totalApprovedRevisions,
        totalRejectedRevisions,
        totalActiveRevisions,
        totalRevisores,
      },
    });
  } catch (error) {
    console.error("Error al obtener las estadísticas de revisiones:", error);
    res.status(500).json({
      message: "Error al obtener las estadísticas de revisiones",
      error: error.message,
    });
  }
};

const getRevisionStatisticsBySede = async (req, res) => {
  try {
    // Obtener el total de solicitudes por sede
    const revisionsBySede = await RevisionThesis.findAll({
      attributes: [
        "sede_id", // Agrupar por sede_id
        [
          sequelize.fn("COUNT", sequelize.col("revision_thesis_id")),
          "totalRequests",
        ], // Contar solicitudes
      ],
      include: [
        {
          model: Sede,
          attributes: ["nameSede"], // Incluir el nombre de la sede
        },
      ],
      group: ["sede_id"], // Agrupar por sede_id
    });

    // Respuesta exitosa
    res.status(200).json({
      message: "Solicitudes por sede obtenidas con éxito",
      data: revisionsBySede,
    });
  } catch (error) {
    console.error("Error al obtener las solicitudes por sede:", error);
    res.status(500).json({
      message: "Error al obtener las solicitudes por sede",
      error: error.message,
    });
  }
};

module.exports = { getRevisionStatistics, getRevisionStatisticsBySede };
