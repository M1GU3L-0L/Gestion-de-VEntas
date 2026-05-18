const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const connectDB = require('./config/database');

// Inicializar Express
const app = express();

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../client')));

// AGREGAR ESTA LÍNEA - Servir archivos uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de la API
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/clientes', require('./routes/clientes.routes'));
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/ventas', require('./routes/ventas.routes'));
app.use('/api/caja', require('./routes/caja.routes'));

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta para servir el frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    error: config.nodeEnv === 'development' ? err : {}
  });
});

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║  🚀 Servidor iniciado exitosamente         ║
  ║  📡 Puerto: ${PORT}                        ║
  ║  🌍 Entorno: ${config.nodeEnv}            ║
  ║  📁 http://localhost:${PORT}               ║
  ╚════════════════════════════════════════════╝
  `);
});

// Manejo de promesas rechazadas
process.on('unhandledRejection', (err) => {
  console.error('❌ Error no manejado:', err);
  process.exit(1);
});

module.exports = app;