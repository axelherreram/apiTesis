const AsignacionEstudiante = require("../models/asignacionEstudiante");
const { registrarBitacora } = require("../sql/bitacora");
const Usuario = require("../models/usuarios");
const Sede = require("../models/sede");

const crearAsignacion = async (req, res) => {
  const user_id = req.user_id;
  try {
    const { catedratico_id, estudiante_id } = req.body;

    if (!catedratico_id || !estudiante_id) {
      return res
        .status(400)
        .json({ message: "Se requiere catedratico_id y estudiante_id" });
    }

    const nuevaAsignacion = await AsignacionEstudiante.create({
      catedratico_id,
      estudiante_id,
    });

    const User = await Usuario.findByPk(user_id);
    const Catedratico = await Usuario.findByPk(catedratico_id);
    const Estudiante = await Usuario.findByPk(estudiante_id);

    await registrarBitacora(
      user_id,
      User.nombre,
      `Creó una asignación para el estudiante: ${Estudiante.nombre} con el catedrático: ${Catedratico.nombre}`,
      'Creacion de asignación para estudiante' 
    );

    return res.status(201).json({
      message: "Asignación creada exitosamente",
      data: nuevaAsignacion,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al crear la asignación", error });
  }
};

const listarEstudiantesPorCatedratico = async (req, res) => {
  try {
    const { catedratico_id } = req.params;

    if (!catedratico_id) {
      return res.status(400).json({ message: "Se requiere el catedratico_id" });
    }

    const asignaciones = await AsignacionEstudiante.findAll({
      where: {
        catedratico_id,
      },
      attributes: ["catedratico_id"],
      include: [
        {
          model: Usuario,
          as: "estudiante",
          attributes: ["user_id", "nombre", "email", "carnet", "fotoPerfil"],
          // include: [
          //   {
          //     model: Sede,
          //     as: "sede",
          //     attributes: ["nombreSede"],
          //   },
          // ],
        },
      ],
    });

    if (asignaciones.length === 0) {
      return res.status(404).json({
        message: `No se encontraron estudiantes asignados para el catedrático con ID ${catedratico_id}`,
      });
    }

    const Catedratico = await Usuario.findByPk(catedratico_id, {
      include: [
        {
          model: Sede,
          as: "sede",
          attributes: ["nombreSede"],
        },
      ],
    });

    await registrarBitacora(
      catedratico_id,
      Catedratico.nombre,
      `Listó los estudiantes asignados a su cuenta con sede: ${Catedratico.sede.nombreSede}`,
      "Listar estudiantes"
    );

    return res.status(200).json({
      message: "Estudiantes asignados",
      data: asignaciones,
    });
  } catch (error) {
    console.error("Error al listar los estudiantes:", error);
    return res.status(500).json({
      message: "Error al listar estudiantes",
      error: error.message,
    });
  }
};

module.exports = {
  crearAsignacion,
  listarEstudiantesPorCatedratico,
};
