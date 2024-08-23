const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Verifica si la carpeta existe, de lo contrario, la crea
const uploadDir = path.join(__dirname, '../public/uploads/estudianteExcel');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer para almacenar los archivos en la carpeta correcta
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Solo se permiten archivos Excel (.xls, .xlsx)'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // Limite de 5MB
  },
});

module.exports = upload;
