const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configurar el almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "public/uploads/taskSubmissions";
    
    // Crear el directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp_userId_taskId_originalName
    const timestamp = Date.now();
    const userId = req.body.user_id || "unknown";
    const taskId = req.body.task_id || "unknown";
    const originalName = path.parse(file.originalname).name;
    const extension = path.extname(file.originalname);
    
    const filename = `${timestamp}_${userId}_${taskId}_${originalName}${extension}`;
    cb(null, filename);
  }
});

// Filtro para validar archivos
const fileFilter = (req, file, cb) => {
  // Verificar que sea un PDF
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos PDF"), false);
  }
};

// Configurar multer
const uploadTaskSubmission = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
});

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "El archivo excede el tamaño máximo permitido (5MB)"
      });
    }
    return res.status(400).json({
      message: "Error al subir el archivo",
      error: error.message
    });
  }
  
  if (error.message === "Solo se permiten archivos PDF") {
    return res.status(400).json({
      message: "Solo se permiten archivos PDF"
    });
  }
  
  next(error);
};

module.exports = { uploadTaskSubmission, handleMulterError }; 