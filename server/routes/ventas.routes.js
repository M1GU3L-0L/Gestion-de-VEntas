const express = require('express');
const router = express.Router();
const {
  getVentas,
  getVenta,
  createVenta,
  descargarFactura,
  getVentasHoy
} = require('../controllers/ventas.controller');
const { protect } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(protect);

router.get('/', getVentas);
router.get('/hoy/resumen', getVentasHoy);
router.post('/', createVenta);
router.get('/:id', getVenta);
router.get('/:id/factura', descargarFactura);

module.exports = router;