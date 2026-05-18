const express = require('express');
const router = express.Router();
const {
  getSaldo,
  getHistorico,
  generarReporte,
  getEstadisticas
} = require('../controllers/caja.controller');
const { protect } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(protect);

router.get('/saldo', getSaldo);
router.get('/historico', getHistorico);
router.get('/reporte', generarReporte);
router.get('/estadisticas', getEstadisticas);

module.exports = router;