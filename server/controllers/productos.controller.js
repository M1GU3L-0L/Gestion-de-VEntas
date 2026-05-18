const Producto = require('../models/Producto');
const { asyncHandler, successResponse, errorResponse } = require('../utils/errorHandler');

// @desc    Obtener todos los productos
// @route   GET /api/productos
// @access  Private
exports.getProductos = asyncHandler(async (req, res) => {
  const productos = await Producto.find({ activo: true })
    .populate('creadoPor', 'nombre email')
    .sort({ createdAt: -1 });

  // Contar productos con stock bajo
  const stockBajo = productos.filter(p => p.stockBajo).length;

  successResponse(res, { 
    productos, 
    total: productos.length,
    stockBajo 
  }, 'Productos obtenidos exitosamente');
});

// @desc    Obtener productos con stock bajo
// @route   GET /api/productos/stock-bajo
// @access  Private
exports.getProductosStockBajo = asyncHandler(async (req, res) => {
  const productos = await Producto.find({ activo: true })
    .populate('creadoPor', 'nombre email');

  const productosStockBajo = productos.filter(p => p.stockBajo);

  successResponse(res, { 
    productos: productosStockBajo, 
    total: productosStockBajo.length 
  }, 'Productos con stock bajo');
});

// @desc    Obtener un producto por ID
// @route   GET /api/productos/:id
// @access  Private
exports.getProducto = asyncHandler(async (req, res) => {
  const producto = await Producto.findById(req.params.id)
    .populate('creadoPor', 'nombre email');

  if (!producto) {
    return errorResponse(res, 'Producto no encontrado', 404);
  }

  successResponse(res, { producto }, 'Producto obtenido exitosamente');
});

// @desc    Buscar producto por código
// @route   GET /api/productos/buscar/:codigo
// @access  Private
exports.buscarPorCodigo = asyncHandler(async (req, res) => {
  const producto = await Producto.findOne({ 
    codigo: req.params.codigo,
    activo: true 
  }).populate('creadoPor', 'nombre email');

  if (!producto) {
    return errorResponse(res, 'Producto no encontrado', 404);
  }

  successResponse(res, { producto }, 'Producto encontrado');
});

// @desc    Crear producto
// @route   POST /api/productos
// @access  Private
exports.createProducto = asyncHandler(async (req, res) => {
  const { codigo, nombre, descripcion, categoria, precio, costo, stock, stockMinimo } = req.body;

  // Verificar si ya existe un producto con ese código
  const productoExiste = await Producto.findOne({ codigo });
  if (productoExiste) {
    return errorResponse(res, 'Ya existe un producto con ese código', 400);
  }

  const producto = await Producto.create({
    codigo,
    nombre,
    descripcion,
    categoria,
    precio,
    costo,
    stock: stock || 0,
    stockMinimo: stockMinimo || 5,
    creadoPor: req.user.id
  });

  successResponse(res, { producto }, 'Producto creado exitosamente', 201);
});

// @desc    Actualizar producto
// @route   PUT /api/productos/:id
// @access  Private
exports.updateProducto = asyncHandler(async (req, res) => {
  let producto = await Producto.findById(req.params.id);

  if (!producto) {
    return errorResponse(res, 'Producto no encontrado', 404);
  }

  const { codigo, nombre, descripcion, categoria, precio, costo, stock, stockMinimo } = req.body;

  // Si se está cambiando el código, verificar que no exista otro
  if (codigo && codigo !== producto.codigo) {
    const codigoExiste = await Producto.findOne({ codigo });
    if (codigoExiste) {
      return errorResponse(res, 'Ya existe un producto con ese código', 400);
    }
  }

  // Actualizar datos
  producto.codigo = codigo || producto.codigo;
  producto.nombre = nombre || producto.nombre;
  producto.descripcion = descripcion !== undefined ? descripcion : producto.descripcion;
  producto.categoria = categoria || producto.categoria;
  producto.precio = precio !== undefined ? precio : producto.precio;
  producto.costo = costo !== undefined ? costo : producto.costo;
  producto.stock = stock !== undefined ? stock : producto.stock;
  producto.stockMinimo = stockMinimo !== undefined ? stockMinimo : producto.stockMinimo;

  await producto.save();

  successResponse(res, { producto }, 'Producto actualizado exitosamente');
});

// @desc    Eliminar producto (soft delete)
// @route   DELETE /api/productos/:id
// @access  Private
exports.deleteProducto = asyncHandler(async (req, res) => {
  const producto = await Producto.findById(req.params.id);

  if (!producto) {
    return errorResponse(res, 'Producto no encontrado', 404);
  }

  // Soft delete
  producto.activo = false;
  await producto.save();

  successResponse(res, null, 'Producto eliminado exitosamente');
});

// @desc    Ajustar stock de producto
// @route   PUT /api/productos/:id/stock
// @access  Private
exports.ajustarStock = asyncHandler(async (req, res) => {
  const producto = await Producto.findById(req.params.id);

  if (!producto) {
    return errorResponse(res, 'Producto no encontrado', 404);
  }

  const { cantidad, tipo } = req.body; // tipo: 'agregar' o 'quitar'

  if (!cantidad || cantidad <= 0) {
    return errorResponse(res, 'La cantidad debe ser mayor a 0', 400);
  }

  if (tipo === 'agregar') {
    producto.stock += cantidad;
  } else if (tipo === 'quitar') {
    if (producto.stock < cantidad) {
      return errorResponse(res, 'No hay suficiente stock disponible', 400);
    }
    producto.stock -= cantidad;
  } else {
    return errorResponse(res, 'Tipo de ajuste inválido. Use "agregar" o "quitar"', 400);
  }

  await producto.save();

  successResponse(res, { producto }, 'Stock ajustado exitosamente');
});