const { sequelize, Sequelize } = require('../config/database');
const ternaAsignGroup = require("../models/ternaAsignGroup");
const groupTerna = require("../models/groupTerna");
const { logActivity } = require("../sql/appLog");
const User = require("../models/user");
const Year = require('../models/year');
const Sede = require('../models/sede');

const createTernaAsignGroup = async (req, res) => {
  const assignments = req.body; // Aquí se espera un array de asignaciones
  const admin_user_id = req.user_id;
  
  try {
    const yearNow = new Date().getFullYear();
    
    for (const { user_id, sede_id, year, rolTerna_id } of assignments) {
      if (year > yearNow) {
        return res.status(400).json({ message: "El año no puede ser mayor al actual" });
      }

      // Verificar si el año existe
      let yearRecord = await Year.findOne({ where: { year } });
      if (!yearRecord) {
        yearRecord = await Year.create({ year });
      }
      const year_id = yearRecord.year_id;

      // Crear un nuevo grupo basado en la información recibida
      const newGroup = await groupTerna.create({
        sede_id,
        year_id,
      });
      const groupTernaId = newGroup.groupTerna_id;

      // Crear el registro en la tabla ternaAsignGroup
      await ternaAsignGroup.create({
        user_id,
        groupTerna_id: groupTernaId,
        rolTerna_id,
      });

      // Buscar la información del usuario administrador
      const userAdmin = await User.findOne({ where: { user_id: admin_user_id } });

      if (!userAdmin) {
        return res.status(404).json({ message: "Admin user not found" });
      }

      // Buscar la información de la sede
      const sede = await Sede.findOne({ where: { sede_id } });  
      const userAsing = await User.findOne({ where: { user_id } });

      // Registrar la actividad
      await logActivity(
        admin_user_id,
        userAdmin.sede_id,
        userAdmin.name,
        `Asignación de usuario: ${userAsing.name} a grupo en sede: ${sede.nameSede} y año: ${year}`,
        "Asignación de usuario a grupo"
      );
    }

    res.status(201).json({ message: "Asignaciones creadas exitosamente" });
  } catch (error) {
    console.error("Error creando las asignaciones de terna:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const listGroupAsingTerna = async (req, res) => {
  const { groupTerna_id } = req.params; // Captura el parámetro de la URL

  if (!groupTerna_id) {
    return res.status(400).json({ message: "El ID del grupo es requerido" });
  }

  try {
    // Buscar los grupos de ternas correspondientes al groupTerna_id
    const groups = await groupTerna.findAll({
      where: {
        groupTerna_id, // Usa el parámetro correctamente
      },
      include: [
        {
          model: ternaAsignGroup,
          attributes: ['rolTerna_id'], // Incluye el rol asignado al usuario en la terna
          include: [
            {
              model: User,
              attributes: ['user_id', 'name'], // Solo obtenemos los campos necesarios
            },
          ],
        },
      ],
    });

    if (groups.length === 0) {
      return res.status(404).json({ message: "No se encontraron grupos de ternas para el ID proporcionado" });
    }

    // Estructurar la respuesta incluyendo los usuarios asignados y su rol en la terna
    const response = groups.map(group => ({
      groupTerna_id: group.groupTerna_id,
      users: group.ternaAsignGroups.map(assignment => ({
        user_id: assignment.User.user_id,
        name: assignment.User.name,
        rolTerna_id: assignment.rolTerna_id, // Incluye el rol del usuario en la terna
      })),
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error al listar los grupos de ternas:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

module.exports = { createTernaAsignGroup, listGroupAsingTerna };
