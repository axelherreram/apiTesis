const multer = require("multer");
const path = require("path");

// Configuración de multer para limitar los tipos de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/fotoPerfil"));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Solo se permiten archivos PNG y JPG'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
});

// Middleware para capturar errores de Multer y devolver JSON
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === 'Solo se permiten archivos PNG y JPG') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
};

module.exports = {
  upload,
  handleMulterErrors,
};
