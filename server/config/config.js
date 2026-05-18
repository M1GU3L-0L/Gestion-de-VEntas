require('dotenv').config();

module.exports = {
  // Configuración del servidor
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configuración de MongoDB
  mongoUri: process.env.MONGODB_URI,
  
  // Configuración JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // Configuración de Email
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
  },
  
  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Rutas
  uploadPath: process.env.UPLOAD_PATH || './server/uploads/',
  
  // Límites
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['application/pdf'],
};