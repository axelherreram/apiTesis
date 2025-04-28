const { Op } = require("sequelize");
const User = require("../models/user");
const Sede = require("../models/sede");
const Year = require("../models/year");


/**
 * The function `searchStudentByCarnet` searches for students based on their carnet number, filtering
 * by year, sede_id, and other criteria, and returns formatted student data in a response.
 * @param req - The code snippet you provided is a function that searches for students based on the
 * query parameters `sede_id`, `year`, and `carnet`. Here's a breakdown of the function:
 * @param res - This code snippet defines an asynchronous function `searchStudentByCarnet` that
 * searches for students based on the provided parameters. Here's a breakdown of the function:
 * @returns The function `searchStudentByCarnet` is returning a JSON response with the formatted
 * student data if students are found based on the provided parameters. If no students are found, it
 * returns a 404 status with a message indicating that no students were found. If there is an error
 * during the search process, it returns a 500 status with an error message.
 */
const searchStudentByCarnet = async (req, res) => {
  const {sede_id, year, carnet } = req.query;
  const { sede_id: tokenSedeId } = req;


  const yearRecord = await Year.findOne({
    where: {  year },
    attributes: ["year_id"],
  });
  const year_id = yearRecord ? yearRecord.year_id : null;


  // Validar que se envíe el parámetro carnet
  if (!carnet) {
    return res.status(400).json({
      message: "El parámetro 'carnet' es obligatorio.",
    });
  }

  // Validar que el carnet tenga al menos el formato "1890-21"
  const carnetPattern = /^[0-9]{4}-[0-9]{2}(-[0-9]+)?$/; // Formato "1890-21"
  if (!carnetPattern.test(carnet)) {
    return res.status(400).json({
      message:
        "El parámetro 'carnet' debe incluir al menos el código de carrera y el año en formato 'XXXX-YY'.",
    });
  }

  try {
    // Realizar la búsqueda de estudiantes, filtrando por sede_id
    const students = await User.findAll({
      where: {
        year_id,
        sede_id,
        carnet: {
          [Op.like]: `${carnet}%`,
        },
        rol_id: 1, // Solo estudiantes
        sede_id: tokenSedeId,
      },
      attributes: ["user_id", "name", "carnet", "email", "profilePhoto", "sede_id"],
    });

    // Verificar si se encontraron estudiantes
    if (students.length === 0) {
      return res.status(404).json({
        message: "No se encontraron estudiantes con los datos proporcionados.",
      });
    }

    // Formatear estudiantes para la respuesta
    const formattedUsers = students.map((student) => ({
      user_id: student.user_id,
      email: student.email,
      userName: student.name,
      profilePhoto: student.profilePhoto
        ? `${process.env.BASE_URL}/public/profilephoto/${student.profilePhoto}`
        : null,
      carnet: student.carnet,
      sede: student.sede_id,
    }));

    res.status(200).json({ formattedUsers });
  } catch (error) {
    console.error("Error al buscar estudiantes:", error);
    res.status(500).json({
      message: "Error al buscar estudiantes.",
      error: error.message || error,
    });
  }
};

/**
 * The function `searchProfessorByCarnet` searches for professors based on a provided carnet number and
 * returns formatted professor data if found.
 * @param req - The `req` parameter in the `searchProfessorByCarnet` function represents the request
 * object in Node.js. It contains information about the HTTP request that triggered the function, such
 * as request headers, query parameters, body content, and more.
 * @param res - The function `searchProfessorByCarnet` is an asynchronous function that searches for
 * professors based on the provided carnet parameter. It performs validation checks on the carnet
 * parameter and then queries the database to find professors matching the criteria.
 * @returns The `searchProfessorByCarnet` function returns a JSON response based on the conditions met
 * during the execution of the function. Here are the possible return scenarios:
 */
const searchProfessorByCarnet = async (req, res) => {
  const { carnet } = req.query;
  const { sede_id: tokenSedeId } = req;

  // Validar que se envíe el parámetro carnet
  if (!carnet) {
    return res.status(400).json({
      message: "El parámetro 'carnet' es obligatorio.",
    });
  }

  // Validar que el carnet tenga al menos el formato "1890-21"
  const carnetPattern = /^[0-9]{4}-[0-9]{2}(-[0-9]+)?$/;
  if (!carnetPattern.test(carnet)) {
    return res.status(400).json({
      message:
        "El parámetro 'carnet' debe incluir al menos el código de carrera y el año en formato 'XXXX-YY'.",
    });
  }

  try {
    // Realizar la búsqueda de catedráticos
    const professors = await User.findAll({
      where: {
        carnet: {
          [Op.like]: `${carnet}%`,
        },
        rol_id: 2, // Solo catedráticos
        sede_id: tokenSedeId,
      },
      attributes: ["user_id", "name", "carnet", "email", "profilePhoto", "active"],
    });

    // Verificar si se encontraron catedráticos
    if (professors.length === 0) {
      return res.status(404).json({
        message: "No se encontraron catedráticos con ese carnet en esta sede.",
      });
    }

    // Formatear catedráticos para la respuesta
    const formattedProfessors = professors.map((professor) => ({
      user_id: professor.user_id,
      email: professor.email,
      userName: professor.name,
      profilePhoto: professor.profilePhoto
        ? `${process.env.BASE_URL}/public/profilephoto/${professor.profilePhoto}`
        : null,
      carnet: professor.carnet,
      active: professor.active,
    }));

    res.status(200).json({ formattedProfessors });
  } catch (error) {
    console.error("Error al buscar catedráticos:", error);
    res.status(500).json({
      message: "Error al buscar catedráticos.",
      error: error.message || error,
    });
  }
};

/**
 * The function `searchStudentByCarnetWithoutSede` searches for students by their carnet number without
 * filtering by sede_id and returns formatted student information including the sede name.
 * @param req - The function `searchStudentByCarnetWithoutSede` is an asynchronous function that
 * searches for students based on their carnet number without considering the sede_id filter. Here's a
 * breakdown of the function:
 * @param res - The function `searchStudentByCarnetWithoutSede` is an asynchronous function that
 * searches for students based on their carnet number without considering the sede_id filter. It
 * performs several validations on the carnet parameter and then queries the database to find students
 * matching the criteria.
 * @returns The function `searchStudentByCarnetWithoutSede` is returning JSON responses based on
 * different conditions:
 * 1. If the required parameter 'carnet' is not provided in the request query, it returns a 400 status
 * with a message indicating that the 'carnet' parameter is mandatory.
 * 2. If the 'carnet' parameter does not match the specified format "XXXX
 */
const searchStudentByCarnetWithoutSede = async (req, res) => {
  const { carnet } = req.query;

  // Validar que se envíe el parámetro carnet
  if (!carnet) {
    return res.status(400).json({
      message: "El parámetro 'carnet' es obligatorio.",
    });
  }

  // Validar que el carnet tenga al menos el formato "1890-21"
  const carnetPattern = /^[0-9]{4}-[0-9]{2}(-[0-9]+)?$/;
  if (!carnetPattern.test(carnet)) {
    return res.status(400).json({
      message:
        "El parámetro 'carnet' debe incluir al menos el código de carrera y el año en formato 'XXXX-YY'.",
    });
  }

  try {
    // Realizar la búsqueda de estudiantes sin el filtro de sede_id
    const students = await User.findAll({
      where: {
        carnet: {
          [Op.like]: `${carnet}%`,
        },
        rol_id: 1, // Buscar solo estudiantes
      },
      attributes: ["user_id", "name", "carnet", "email", "profilePhoto", "sede_id"],
    });

    // Verificar si se encontraron estudiantes
    if (students.length === 0) {
      return res.status(404).json({
        message: "No se encontraron estudiantes con ese carnet.",
      });
    }

    // Obtener la información de la sede en una sola consulta
    const sedeIds = [...new Set(students.map((student) => student.sede_id))];
    const sedes = await Sede.findAll({
      where: { sede_id: sedeIds },
      attributes: ["sede_id", "nameSede"],
    });

    // Crear un mapa para acceder rápidamente a la sede por sede_id
    const sedeMap = sedes.reduce((acc, sede) => {
      acc[sede.sede_id] = sede.nameSede;
      return acc;
    }, {});

    // Formatear estudiantes con información de la sede
    const formattedUsers = students.map((student) => ({
      user_id: student.user_id,
      email: student.email,
      userName: student.name,
      profilePhoto: student.profilePhoto
        ? `${process.env.BASE_URL}/public/profilephoto/${student.profilePhoto}`
        : null,
      carnet: student.carnet,
      Sede: sedeMap[student.sede_id] || null, // Asignar el nombre de la sede desde el mapa
    }));

    res.status(200).json({ formattedUsers });
  } catch (error) {
    console.error("Error al buscar estudiantes:", error);
    res.status(500).json({
      message: "Error al buscar estudiantes.",
      error: error.message || error,
    });
  }
};


module.exports = {
  searchStudentByCarnet,
  searchProfessorByCarnet,
  searchStudentByCarnetWithoutSede,
};
