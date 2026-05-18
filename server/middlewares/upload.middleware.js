const multer = require('multer');
const path = require('path');
const config = require('../config/config');

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'RUT-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de archivos - solo PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.maxFileSize // 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;