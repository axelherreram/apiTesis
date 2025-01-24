const Course = require("../models/course");

/**
 * The function `listCourses` retrieves all courses from the database and returns a JSON response with
 * course IDs and names, handling errors appropriately.
 * @param req - The `req` parameter in the `listCourses` function typically represents the request
 * object, which contains information about the incoming HTTP request such as headers, parameters,
 * body, etc. It is used to access data sent from the client to the server. In this context, `req` is
 * likely an
 * @param res - The `res` parameter in the `listCourses` function is the response object that is used
 * to send a response back to the client making the request. In this case, it is being used to send a
 * JSON response with a status code of 200 (OK) along with the list of courses
 */
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
