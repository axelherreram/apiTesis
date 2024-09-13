const { sequelize, Sequelize } = require('../config/database');
const ternaAsignGroup = require("../models/ternaAsignGroup");
const groupTerna = require("../models/groupTerna");
const { logActivity } = require("../sql/appLog");
const User = require("../models/user");
const Year = require('../models/year');
const Sede = require('../models/sede');

const createTernaAsignGroup = async (req, res) => {
  const { user_id, sede_id, year, rolTerna_id } = req.body;
  const admin_user_id = req.user_id;
  try {
    
    const yearNow = new Date().getFullYear();
    if(year > yearNow){
      return res.status(400).json({ message: "El año no puede ser mayor al actual" });
    }

    // Verificar si el año existe
    let yearRecord = await Year.findOne({ where: { year } });
    if (!yearRecord) {
      yearRecord = await Year.create({ year });
    }
    const year_id = yearRecord.year_id;

    // Verificar si el usuario ya está asignado a un grupo en el mismo año 
    const existingAssignment = await ternaAsignGroup.findOne({
      include: [{
        model: groupTerna,
        where: {
          year_id
        }
      }],
      where: {
        user_id
      }
    });

    if (existingAssignment) {
      return res.status(400).json({ message: "El usuario ya está asignado a un grupo en el mismo año y sede" });
    }

    // Encontrar el grupo con menos de 3 usuarios asignados
    const group = await sequelize.query(
      `
      SELECT groupTerna.groupTerna_id 
      FROM groupTerna 
      LEFT JOIN ternaAsignGroup 
      ON groupTerna.groupTerna_id = ternaAsignGroup.groupTerna_id
      WHERE groupTerna.sede_id = :sede_id
      AND groupTerna.year_id = :year_id
      GROUP BY groupTerna.groupTerna_id
      HAVING COUNT(ternaAsignGroup.ternaAsignGroup_id) < 3
      ORDER BY groupTerna.groupTerna_id DESC
      LIMIT 1
      `,
      {
        replacements: { sede_id, year_id },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    // Si no hay ningún grupo con menos de 3 usuarios, creamos uno nuevo
    let groupTernaId;
    if (group.length === 0) {
      const newGroup = await groupTerna.create({
        sede_id,
        year_id,
      });
      groupTernaId = newGroup.groupTerna_id;
    } else {
      groupTernaId = group[0].groupTerna_id;
    }

    // Crear el registro en la tabla ternaAsignGroup
    const newTernaAsignGroup = await ternaAsignGroup.create({
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

    res.status(201).json({ message: "Asignación creada exitosamente" });
  } catch (error) {
    console.error("Error creando la asignación de terna:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createTernaAsignGroup };