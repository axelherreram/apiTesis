const Cursos = require("../models/cursos");

const listarCursos = async (req, res) => {
  try {
    const cursos = await Cursos.findAll();

    const cursosResponse = cursos.map((curso) => {
        return {
            curso_id: curso.curso_id,
            nombreCurso: curso.nombreCurso,
        }});

    res.status(200).json(cursosResponse);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los cursos", error });
  }
};


module.exports = { listarCursos };