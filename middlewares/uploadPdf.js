const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  // Carpeta donde se guardarán los archivos
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/submissions'); 
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  }
});

// Middleware para limitar la subida a archivos PDF
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (ext === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limitar el tamaño del archivo a 10MB
});

module.exports = upload;
