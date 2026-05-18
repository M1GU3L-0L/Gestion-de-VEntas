const mongoose = require('mongoose');

const movimientoCajaSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['venta', 'apertura', 'cierre', 'ajuste'],
    required: true
  },
  venta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venta'
  },
  monto: {
    type: Number,
    required: true
  },
  descripcion: String,
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const cajaSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    default: Date.now
  },
  saldoInicial: {
    type: Number,
    default: 0
  },
  movimientos: [movimientoCajaSchema],
  saldoFinal: {
    type: Number,
    default: 0
  },
  estado: {
    type: String,
    enum: ['abierta', 'cerrada'],
    default: 'abierta'
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calcular saldo final automáticamente
cajaSchema.methods.calcularSaldo = function() {
  const totalMovimientos = this.movimientos.reduce((sum, mov) => {
    if (mov.tipo === 'venta') {
      return sum + mov.monto;
    }
    return sum;
  }, 0);
  
  this.saldoFinal = this.saldoInicial + totalMovimientos;
  return this.saldoFinal;
};

module.exports = mongoose.model('Caja', cajaSchema);