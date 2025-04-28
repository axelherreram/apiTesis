const multer = require('multer');
const path = require('path');

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads/revisionthesis');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

const uploadFilesMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB
}).fields([
  { name: 'approval_letter', maxCount: 1 }, // Campo para la carta de aprobación
  { name: 'thesis', maxCount: 1 } // Campo para la tesis
]);

module.exports = uploadFilesMiddleware;