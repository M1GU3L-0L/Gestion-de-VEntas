const express = require('express');
const router = express.Router();
const {
  getClientes,
  getCliente,
  buscarPorCedula,
  createCliente,
  updateCliente,
  deleteCliente,
  descargarRut
} = require('../controllers/clientes.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Todas las rutas requieren autenticación
router.use(protect);

router.get('/', getClientes);
router.post('/', upload.single('rutFile'), createCliente);
router.get('/buscar/:cedula', buscarPorCedula);
router.get('/:id', getCliente);
router.put('/:id', upload.single('rutFile'), updateCliente);
router.delete('/:id', deleteCliente);
router.get('/:id/rut', descargarRut);

module.exports = router;