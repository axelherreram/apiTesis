/**
 * Middleware to handle the upload of profile photos (JPEG, JPG, PNG).
 * 
 * This middleware uses `multer` to handle the upload of image files, specifically images with
 * the MIME types 'image/jpeg', 'image/jpg', and 'image/png'. It saves the uploaded files in 
 * the 'public/profilephoto' directory and names them based on the current timestamp followed by 
 * the original file name.
 * 
 * The middleware performs the following tasks:
 * 1. Configures the storage for the uploaded files, saving them to the 'profilephoto' directory.
 * 2. Filters the uploaded files to ensure that only JPG and PNG images are allowed.
 * 3. Limits the file size to a maximum of 5MB.
 * 4. Provides error handling for Multer errors and invalid file types.
 * 
 * @param {Object} storage - Configuration for file storage, specifying the destination folder and filename.
 * @param {Function} destination - Function to specify the destination folder for the uploaded files.
 * @param {Function} filename - Function to specify the filename of the uploaded file.
 * @param {Object} fileFilter - Function to filter allowed file types (only JPG, PNG).
 * @param {Object} limits - Configuration for file size limits (5MB).
 * @param {Function} handleMulterErrors - Middleware to catch and handle errors thrown by Multer, returning a JSON response with the error message.
 * @returns {Object} upload - Configured `multer` instance for file upload, including error handling middleware.
 * 
 * @throws {Error} - Throws an error if the uploaded file is not a JPG or PNG image or exceeds the size limit.
 */

const multer = require("multer");
const path = require("path");

// Configuring multer to store uploaded files in the 'profilephoto' folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/profilephoto"));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter to only allow JPEG, JPG, and PNG files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only PNG and JPG files are allowed'), false);
  }
  cb(null, true);
};

// Multer configuration with storage, file filter, and file size limit
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
});

// Middleware to handle errors thrown by Multer (such as invalid file type or size)
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === 'Only PNG and JPG files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
};

module.exports = {
  upload,
  handleMulterErrors,
};
