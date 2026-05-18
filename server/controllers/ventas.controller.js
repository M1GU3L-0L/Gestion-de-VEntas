const Venta = require('../models/Venta');
const Cliente = require('../models/Cliente');
const Producto = require('../models/Producto');
const pdfService = require('../services/pdf.service');
const { asyncHandler, successResponse, errorResponse } = require('../utils/errorHandler');

// @desc    Obtener todas las ventas
// @route   GET /api/ventas
// @access  Private
exports.getVentas = asyncHandler(async (req, res) => {
  const ventas = await Venta.find({ activo: true })
    .populate('cliente', 'nombre cedula')
    .populate('vendedor', 'nombre email')
    .populate('items.producto', 'nombre codigo')
    .sort({ createdAt: -1 });

  // Calcular total de ventas
  const totalVentas = ventas.reduce((sum, venta) => sum + venta.total, 0);

  successResponse(res, { 
    ventas, 
    total: ventas.length,
    totalVentas: totalVentas.toFixed(2)
  }, 'Ventas obtenidas exitosamente');
});

// @desc    Obtener una venta por ID
// @route   GET /api/ventas/:id
// @access  Private
exports.getVenta = asyncHandler(async (req, res) => {
  const venta = await Venta.findById(req.params.id)
    .populate('cliente')
    .populate('vendedor', 'nombre email')
    .populate('items.producto');

  if (!venta) {
    return errorResponse(res, 'Venta no encontrada', 404);
  }

  successResponse(res, { venta }, 'Venta obtenida exitosamente');
});

// @desc    Crear venta
// @route   POST /api/ventas
// @access  Private
exports.createVenta = asyncHandler(async (req, res) => {
  const { clienteId, items, metodoPago, aplicarImpuesto } = req.body;

  // Validar cliente
  const cliente = await Cliente.findById(clienteId);
  if (!cliente) {
    return errorResponse(res, 'Cliente no encontrado', 404);
  }

  // Validar items y calcular totales
  let subtotal = 0;
  const itemsVenta = [];

  for (const item of items) {
    const producto = await Producto.findById(item.productoId);
    
    if (!producto) {
      return errorResponse(res, `Producto ${item.productoId} no encontrado`, 404);
    }

    if (producto.stock < item.cantidad) {
      return errorResponse(
        res, 
        `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`, 
        400
      );
    }

    const itemSubtotal = producto.precio * item.cantidad;
    subtotal += itemSubtotal;

    itemsVenta.push({
      producto: producto._id,
      codigo: producto.codigo,
      nombre: producto.nombre,
      cantidad: item.cantidad,
      precioUnitario: producto.precio,
      subtotal: itemSubtotal
    });

    // Reducir stock
    producto.stock -= item.cantidad;
    await producto.save();
  }

  // Calcular impuesto (19% si se aplica)
  const impuesto = aplicarImpuesto ? subtotal * 0.19 : 0;
  const total = subtotal + impuesto;

  // Crear venta
  const venta = await Venta.create({
    cliente: clienteId,
    items: itemsVenta,
    subtotal,
    impuesto,
    total,
    metodoPago: metodoPago || 'Efectivo',
    vendedor: req.user.id
  });

  // Poblar información para respuesta
  await venta.populate('cliente');
  await venta.populate('vendedor', 'nombre email');

  // Generar factura PDF
  try {
    const { fileName, filePath } = await pdfService.generarFactura(
      venta, 
      cliente, 
      req.user
    );
    
    successResponse(res, { 
      venta,
      facturaPDF: fileName
    }, 'Venta registrada exitosamente', 201);
  } catch (error) {
    console.error('Error al generar PDF:', error);
    successResponse(res, { venta }, 'Venta registrada (error al generar PDF)', 201);
  }
});

// @desc    Descargar factura PDF
// @route   GET /api/ventas/:id/factura
// @access  Private
exports.descargarFactura = asyncHandler(async (req, res) => {
  const venta = await Venta.findById(req.params.id)
    .populate('cliente')
    .populate('vendedor', 'nombre email');

  if (!venta) {
    return errorResponse(res, 'Venta no encontrada', 404);
  }

  try {
    // Regenerar factura
    const { filePath } = await pdfService.generarFactura(
      venta, 
      venta.cliente, 
      venta.vendedor
    );

    res.download(filePath, `Factura-${venta.numeroFactura}.pdf`);
  } catch (error) {
    console.error('Error al generar factura:', error);
    return errorResponse(res, 'Error al generar factura', 500);
  }
});

// @desc    Obtener ventas del día
// @route   GET /api/ventas/hoy/resumen
// @access  Private
exports.getVentasHoy = asyncHandler(async (req, res) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const ventas = await Venta.find({
    activo: true,
    createdAt: { $gte: hoy }
  }).populate('cliente', 'nombre cedula');

  const totalVentas = ventas.reduce((sum, venta) => sum + venta.total, 0);

  successResponse(res, {
    ventas,
    cantidad: ventas.length,
    total: totalVentas.toFixed(2)
  }, 'Ventas del día obtenidas');
});