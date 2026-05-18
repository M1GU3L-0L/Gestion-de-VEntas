const mongoose = require('mongoose');

const itemVentaSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  codigo: String,
  nombre: String,
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  precioUnitario: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const ventaSchema = new mongoose.Schema({
  numeroFactura: {
    type: String,
    unique: true
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  items: [itemVentaSchema],
  subtotal: {
    type: Number,
    required: true
  },
  impuesto: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  metodoPago: {
    type: String,
    enum: ['Efectivo', 'Tarjeta', 'Transferencia'],
    default: 'Efectivo'
  },
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generar número de factura automáticamente ANTES de validar
ventaSchema.pre('validate', async function(next) {
  if (this.isNew && !this.numeroFactura) {
    try {
      // Contar documentos existentes
      const count = await this.constructor.countDocuments();
      const numero = String(count + 1).padStart(6, '0');
      this.numeroFactura = `FAC-${numero}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Venta', ventaSchema);