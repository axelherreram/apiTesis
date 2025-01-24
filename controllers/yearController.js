const Year = require("../models/year");

/**
 * The function `listYears` retrieves all available years from the database 
 * and returns them as a JSON response.
 * @param req - The `req` parameter in the `listYears` function represents the 
 * HTTP request object, though it is not explicitly used in this function.
 * @param res - The `res` parameter in the `listYears` function represents the 
 * HTTP response object used to send a response back to the client.
 * @returns The `listYears` function returns a JSON response containing the list 
 * of years if successful (status 200). In case of an error, it returns a 500 status 
 * with an error message.
 */
const listYears = async (req, res) => {
  try {
    const years = await Year.findAll();
    res.status(200).json(years);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener años", error: error.message });
  }
};

module.exports = {
  listYears,
};