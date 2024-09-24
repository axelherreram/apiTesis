const Course = require("../models/course");
const TimelineEventos = require("../models/timelineEventos");

const listTimeline = async (req, res) => {
  const { user_id, course_id } = req.params;

  try {
    const timeline = await TimelineEventos.findAll({
      where: {
        user_id: user_id,
        course_id: course_id, // Agrega esto si necesitas filtrar por course_id
      },
      include: [
        {
          model: Course,
        },
      ],
    });

    res.json(timeline);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error en el servidor");
  }
};

// Cambié la exportación a un formato más común
module.exports = { listTimeline };
