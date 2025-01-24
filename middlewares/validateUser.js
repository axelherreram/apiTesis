/**
 * Middleware to validate that the user exists and that the user ID in the token matches the requested user ID.
 * 
 * This middleware performs two key validations:
 * 1. It checks if the user with the given `user_id` exists in the database.
 * 2. It compares the `user_id` from the request body with the `user_id` decoded from the JWT token to ensure that the user is authorized to perform the action.
 * 
 * If either validation fails, an appropriate error response is returned.
 * 
 * @param {Object} req - The request object, containing the `user_id` in the body and the token user ID.
 * @param {Object} res - The response object, used to send error responses in case of validation failure.
 * @param {Function} next - The next middleware function to be called if the validation is successful.
 * 
 * @throws {Error} - Throws an error if there is an issue with the server or user validation.
 */
const User = require("../models/user");

const validateUser = async (req, res, next) => {
  const { user_id } = req.body;
  const { user_id: token_user_id } = req; // Ensure that this value comes from the token

  try {
    // Check if the user exists in the database
    const userExist = await User.findByPk(user_id);
    if (!userExist) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Check if the user ID from the token matches the requested user ID
    if (userExist.user_id !== token_user_id) {
      return res.status(401).json({ message: "Unauthorized to perform this action" });
    }

    // Proceed to the next middleware if validation passes
    next(); 
  } catch (error) {
    console.error("Error in the validateUser middleware:", error);
    res.status(500).json({
      message: "Server error while validating user",
      error: error.message,
    });
  }
};

module.exports = validateUser;
