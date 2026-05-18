const Caja = require('../models/Caja');
const Venta = require('../models/Venta');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { asyncHandler, successResponse, errorResponse } = require('../utils/errorHandler');

// @desc    Obtener saldo actual de caja
// @route   GET /api/caja/saldo
// @access  Private
exports.getSaldo = asyncHandler(async (req, res) => {
  // Obtener todas las ventas activas
  const ventas = await Venta.find({ activo: true });
  
  // Calcular totales
  const totalVentas = ventas.reduce((sum, venta) => sum + venta.total, 0);
  const cantidadVentas = ventas.length;
  
  // Ventas de hoy
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const ventasHoy = ventas.filter(venta => {
    const fechaVenta = new Date(venta.createdAt);
    return fechaVenta >= hoy;
  });
  
  const totalHoy = ventasHoy.reduce((sum, venta) => sum + venta.total, 0);
  
  successResponse(res, {
    saldoTotal: totalVentas.toFixed(2),
    cantidadVentas,
    ventasHoy: ventasHoy.length,
    totalHoy: totalHoy.toFixed(2)
  }, 'Saldo obtenido exitosamente');
});

// @desc    Obtener histórico de ventas con filtros
// @route   GET /api/caja/historico
// @access  Private
exports.getHistorico = asyncHandler(async (req, res) => {
  const { fechaInicio, fechaFin, metodoPago } = req.query;
  
  let filtro = { activo: true };
  
  // Filtro por fechas
  if (fechaInicio || fechaFin) {
    filtro.createdAt = {};
    
    if (fechaInicio) {
      filtro.createdAt.$gte = new Date(fechaInicio);
    }
    
    if (fechaFin) {
      const fecha = new Date(fechaFin);
      fecha.setHours(23, 59, 59, 999);
      filtro.createdAt.$lte = fecha;
    }
  }
  
  // Filtro por método de pago
  if (metodoPago && metodoPago !== 'Todos') {
    filtro.metodoPago = metodoPago;
  }
  
  const ventas = await Venta.find(filtro)
    .populate('cliente', 'nombre cedula')
    .populate('vendedor', 'nombre')
    .sort({ createdAt: -1 });
  
  // Calcular estadísticas
  const totalVentas = ventas.reduce((sum, venta) => sum + venta.total, 0);
  const totalSubtotal = ventas.reduce((sum, venta) => sum + venta.subtotal, 0);
  const totalImpuestos = ventas.reduce((sum, venta) => sum + venta.impuesto, 0);
  
  // Agrupar por método de pago
  const porMetodoPago = {
    Efectivo: 0,
    Tarjeta: 0,
    Transferencia: 0
  };
  
  ventas.forEach(venta => {
    porMetodoPago[venta.metodoPago] += venta.total;
  });
  
  successResponse(res, {
    ventas,
    estadisticas: {
      cantidad: ventas.length,
      totalVentas: totalVentas.toFixed(2),
      totalSubtotal: totalSubtotal.toFixed(2),
      totalImpuestos: totalImpuestos.toFixed(2),
      porMetodoPago: {
        Efectivo: porMetodoPago.Efectivo.toFixed(2),
        Tarjeta: porMetodoPago.Tarjeta.toFixed(2),
        Transferencia: porMetodoPago.Transferencia.toFixed(2)
      }
    }
  }, 'Histórico obtenido exitosamente');
});

// @desc    Generar reporte en PDF
// @route   GET /api/caja/reporte
// @access  Private
exports.generarReporte = asyncHandler(async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  
  let filtro = { activo: true };
  
  // Filtro por fechas
  if (fechaInicio || fechaFin) {
    filtro.createdAt = {};
    
    if (fechaInicio) {
      filtro.createdAt.$gte = new Date(fechaInicio);
    }
    
    if (fechaFin) {
      const fecha = new Date(fechaFin);
      fecha.setHours(23, 59, 59, 999);
      filtro.createdAt.$lte = fecha;
    }
  }
  
  const ventas = await Venta.find(filtro)
    .populate('cliente', 'nombre cedula')
    .populate('vendedor', 'nombre')
    .sort({ createdAt: -1 });
  
  // Crear PDF
  const doc = new PDFDocument({ margin: 50 });
  const fileName = `Reporte-Caja-${Date.now()}.pdf`;
  const filePath = path.join(__dirname, '../uploads', fileName);
  const stream = fs.createWriteStream(filePath);
  
  doc.pipe(stream);
  
  // Encabezado
  doc.fontSize(20)
     .text('REPORTE DE CAJA', { align: 'center' })
     .moveDown();
  
  doc.fontSize(12)
     .text('Sistema de Gestión de Ventas', { align: 'center' })
     .moveDown();
  
  // Período
  let periodo = 'Todas las ventas';
  if (fechaInicio && fechaFin) {
    periodo = `Del ${new Date(fechaInicio).toLocaleDateString('es-CO')} al ${new Date(fechaFin).toLocaleDateString('es-CO')}`;
  } else if (fechaInicio) {
    periodo = `Desde ${new Date(fechaInicio).toLocaleDateString('es-CO')}`;
  } else if (fechaFin) {
    periodo = `Hasta ${new Date(fechaFin).toLocaleDateString('es-CO')}`;
  }
  
  doc.fontSize(10)
     .text(`Período: ${periodo}`, { align: 'center' })
     .text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, { align: 'center' })
     .moveDown(2);
  
  // Línea separadora
  doc.moveTo(50, doc.y)
     .lineTo(550, doc.y)
     .stroke()
     .moveDown();
  
  // Resumen
  const totalVentas = ventas.reduce((sum, venta) => sum + venta.total, 0);
  const totalSubtotal = ventas.reduce((sum, venta) => sum + venta.subtotal, 0);
  const totalImpuestos = ventas.reduce((sum, venta) => sum + venta.impuesto, 0);
  
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('RESUMEN GENERAL', { underline: true })
     .moveDown();
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(`Total de ventas: ${ventas.length}`)
     .text(`Subtotal: $${totalSubtotal.toFixed(2)}`)
     .text(`Impuestos: $${totalImpuestos.toFixed(2)}`)
     .text(`Total: $${totalVentas.toFixed(2)}`, { continued: false })
     .moveDown(2);
  
  // Por método de pago
  const porMetodoPago = {
    Efectivo: 0,
    Tarjeta: 0,
    Transferencia: 0
  };
  
  ventas.forEach(venta => {
    porMetodoPago[venta.metodoPago] += venta.total;
  });
  
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('VENTAS POR MÉTODO DE PAGO')
     .moveDown();
  
  doc.fontSize(10)
     .font('Helvetica')
     .text(`Efectivo: $${porMetodoPago.Efectivo.toFixed(2)}`)
     .text(`Tarjeta: $${porMetodoPago.Tarjeta.toFixed(2)}`)
     .text(`Transferencia: $${porMetodoPago.Transferencia.toFixed(2)}`)
     .moveDown(2);
  
  // Línea separadora
  doc.moveTo(50, doc.y)
     .lineTo(550, doc.y)
     .stroke()
     .moveDown();
  
  // Detalle de ventas
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('DETALLE DE VENTAS')
     .moveDown();
  
  // Encabezado de tabla
  const tableTop = doc.y;
  doc.fontSize(9)
     .font('Helvetica-Bold')
     .text('Factura', 50, tableTop)
     .text('Fecha', 130, tableTop)
     .text('Cliente', 220, tableTop)
     .text('Método', 360, tableTop)
     .text('Total', 480, tableTop);
  
  doc.moveTo(50, tableTop + 15)
     .lineTo(550, tableTop + 15)
     .stroke();
  
  // Ventas
  let y = tableTop + 25;
  doc.font('Helvetica');
  
  ventas.forEach((venta, index) => {
    // Salto de página si es necesario
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
    
    doc.fontSize(8)
       .text(venta.numeroFactura, 50, y)
       .text(new Date(venta.createdAt).toLocaleDateString('es-CO'), 130, y)
       .text(venta.cliente.nombre.substring(0, 25), 220, y)
       .text(venta.metodoPago, 360, y)
       .text(`$${venta.total.toFixed(2)}`, 480, y);
    
    y += 18;
  });
  
  // Pie de página
  doc.fontSize(8)
     .text('Sistema de Gestión de Ventas', 50, 750, { align: 'center' })
     .text('Reporte generado automáticamente', { align: 'center' });
  
  doc.end();
  
  stream.on('finish', () => {
    res.download(filePath, fileName);
  });
  
  stream.on('error', (error) => {
    console.error('Error al generar reporte:', error);
    return errorResponse(res, 'Error al generar reporte', 500);
  });
});

// @desc    Obtener estadísticas generales
// @route   GET /api/caja/estadisticas
// @access  Private
exports.getEstadisticas = asyncHandler(async (req, res) => {
  const ventas = await Venta.find({ activo: true })
    .populate('items.producto');
  
  // Total de ventas
  const totalVentas = ventas.reduce((sum, venta) => sum + venta.total, 0);
  
  // Producto más vendido
  const productosVendidos = {};
  ventas.forEach(venta => {
    venta.items.forEach(item => {
      const nombre = item.nombre;
      if (!productosVendidos[nombre]) {
        productosVendidos[nombre] = {
          nombre,
          cantidad: 0,
          total: 0
        };
      }
      productosVendidos[nombre].cantidad += item.cantidad;
      productosVendidos[nombre].total += item.subtotal;
    });
  });
  
  const topProductos = Object.values(productosVendidos)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);
  
  // Ventas por mes (últimos 6 meses)
  const ventasPorMes = {};
  const hoy = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const mes = fecha.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    ventasPorMes[mes] = 0;
  }
  
  ventas.forEach(venta => {
    const fecha = new Date(venta.createdAt);
    const mes = fecha.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    if (ventasPorMes[mes] !== undefined) {
      ventasPorMes[mes] += venta.total;
    }
  });
  
  successResponse(res, {
    totalVentas: totalVentas.toFixed(2),
    cantidadVentas: ventas.length,
    promedioVenta: ventas.length > 0 ? (totalVentas / ventas.length).toFixed(2) : '0.00',
    topProductos,
    ventasPorMes
  }, 'Estadísticas obtenidas');
});