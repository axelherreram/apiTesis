/**
 * Middleware to handle PDF file uploads.
 * 
 * This middleware uses `multer` to handle the upload of PDF files. It saves the uploaded files
 * in the 'public/uploads/submissions' folder and names them based on the current timestamp followed 
 * by the original file name.
 * 
 * The middleware performs the following tasks:
 * 1. Configures the storage for the uploaded files, saving them in the 'submissions' folder.
 * 2. Filters the uploaded files to ensure that only PDF files are allowed.
 * 3. Limits the file size to a maximum of 10MB.
 * 
 * @param {Object} storage - Configuration for file storage, specifying the destination folder and filename.
 * @param {Function} destination - Function to specify the destination folder for the uploaded files.
 * @param {Function} filename - Function to specify the filename of the uploaded file.
 * @param {Object} fileFilter - Function to filter allowed file types (only PDF files).
 * @param {Object} limits - Configuration for file size limits (10MB).
 * @returns {Object} upload - Configured `multer` instance for file upload.
 * 
 * @throws {Error} - Throws an error if the uploaded file is not a PDF or exceeds the size limit.
 */
const multer = require('multer');
const path = require('path');

// Configure multer to store the uploaded files in the 'submissions' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/submissions');
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  }
});

// File filter to only allow PDF files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (ext === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

// Multer configuration with storage, file filter, and file size limit (10MB)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

module.exports = upload;
