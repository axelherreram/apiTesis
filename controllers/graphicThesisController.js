const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const ApprovalThesis = require("../models/approvalThesis");
const RevisionThesis = require("../models/revisionThesis");
const Sede = require("../models/sede");
const User = require("../models/user");

/**
 * The function `getRevisionStatistics` retrieves statistics related to thesis revisions.
 * It counts the total number of revisions, approved revisions, rejected revisions, active revisions, and the total number of reviewers.
 * These statistics are then returned in a JSON response.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object to send back the statistics data or an error message.
 * @returns A JSON response with revision statistics or an error message.
 */
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

/**
 * The function `getRevisionStatisticsBySede` retrieves the total number of thesis revision requests
 * grouped by sede, including the name of the sede for each group.
 * @param req - The `req` parameter represents the HTTP request object, which contains the parameters
 * for the request, though no specific parameters are required for this function.
 * @param res - The `res` parameter represents the HTTP response object used to send back the result
 * of the operation, including the total number of requests for each sede.
 * @returns A JSON response with a message indicating success and the data containing the total number of
 * requests per sede, or an error message if the request fails.
 */
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

/**
 * The function `getRevisionStatisticsByDateRange` retrieves the statistics of thesis revisions, including
 * the total number of approved and rejected revisions within a given date range.
 * @param req - The `req` parameter represents the HTTP request object, which contains the `startMonth`
 * and `endMonth` query parameters that define the range of dates for filtering the revision statistics.
 * @param res - The `res` parameter represents the HTTP response object used to send back the result of the operation,
 * including the statistics for approved and rejected revisions.
 * @returns A JSON response with a message indicating success and the data containing the total number of approved and 
 * rejected revisions within the specified date range, or an error message if validation or the request fails.
 */
const getRevisionStatisticsByDateRange = async (req, res) => {
  try {
    const { startMonth, endMonth } = req.query;

    // Validar que se proporcionen los parámetros de fecha
    if (!startMonth || !endMonth) {
      return res.status(400).json({
        message: "Se requieren los parámetros startMonth y endMonth",
      });
    }

    // Convertir los meses a fechas válidas
    const startDate = new Date(startMonth);
    const endDate = new Date(endMonth);

    // Validar que las fechas sean válidas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        message: "Formato de fecha inválido. Use el formato YYYY-MM",
      });
    }

    // Asegurarse de que endDate sea el último día del mes
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    // Obtener revisiones aprobadas y no aprobadas en el rango de fechas
    const approvedRevisions = await ApprovalThesis.count({
      where: {
        status: "approved",
        date_approved: {
          [Op.between]: [startDate, endDate], // Filtrar por rango de fechas
        },
      },
    });

    const rejectedRevisions = await ApprovalThesis.count({
      where: {
        status: "rejected",
        date_approved: {
          [Op.between]: [startDate, endDate], // Filtrar por rango de fechas
        },
      },
    });

    // Respuesta exitosa
    res.status(200).json({
      message: "Estadísticas de revisiones obtenidas con éxito",
      data: {
        totalApprovedRevisions: approvedRevisions,
        totalRejectedRevisions: rejectedRevisions,
        startMonth: startMonth,
        endMonth: endMonth,
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

module.exports = {
  getRevisionStatistics,
  getRevisionStatisticsBySede,
  getRevisionStatisticsByDateRange,
};
