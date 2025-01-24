/**
 * Middleware to handle the upload of Excel files.
 * 
 * This middleware uses the `multer` library to handle file uploads. It specifically allows
 * the uploading of Excel files with the `.xls` or `.xlsx` extension. The uploaded files are
 * stored in the 'uploads/excels' directory inside the 'public' folder. If the directory does not
 * exist, it is created automatically.
 * 
 * The middleware performs the following tasks:
 * 1. Checks if the 'uploads/excels' directory exists. If not, it creates it.
 * 2. Configures the storage options for the uploaded files (destination and filename).
 * 3. Restricts file uploads to only Excel files based on their MIME type.
 * 4. Limits the file size to a maximum of 5MB.
 * 
 * @param {Object} storage - Configuration for file storage.
 * @param {Function} destination - Function to specify the destination folder for file uploads.
 * @param {Function} filename - Function to specify the filename of the uploaded file.
 * @param {Object} fileFilter - Function to filter allowed file types (only Excel files).
 * @param {Object} limits - Configuration for file size limits (5MB).
 * @returns {Object} multer instance - Configured `multer` instance for file upload.
 * 
 * @throws {Error} - Throws an error if the uploaded file is not an Excel file or if the file exceeds the size limit.
 */
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Verifies if the folder exists, otherwise creates it
const uploadDir = path.join(__dirname, '../public/uploads/excels');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration to store files in the correct folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

// File filter to allow only Excel files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only Excel files (.xls, .xlsx) are allowed'), false);
  }
  cb(null, true);
};

// Multer instance to handle file uploads
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
});

module.exports = upload;
