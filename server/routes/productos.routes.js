const express = require('express');
const router = express.Router();
const {
  getProductos,
  getProductosStockBajo,
  getProducto,
  buscarPorCodigo,
  createProducto,
  updateProducto,
  deleteProducto,
  ajustarStock
} = require('../controllers/productos.controller');
const { protect } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(protect);

router.get('/', getProductos);
router.get('/stock-bajo', getProductosStockBajo);
router.post('/', createProducto);
router.get('/buscar/:codigo', buscarPorCodigo);
router.get('/:id', getProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);
router.put('/:id/stock', ajustarStock);

module.exports = router;