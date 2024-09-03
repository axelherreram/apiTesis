const Course = require("../models/course");

const listCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();

    const coursesResponse = courses.map((course) => {
        return {
            course_id: course.course_id,
            courseName: course.courseName,
        }});

    res.status(200).json(coursesResponse);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los cursos", error });
  }
};

module.exports = { listCourses };
