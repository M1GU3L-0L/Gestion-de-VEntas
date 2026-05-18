const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: [true, 'El código es obligatorio'],
    unique: true,
    trim: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: ['Electrónica', 'Ropa', 'Alimentos', 'Hogar', 'Deportes', 'Otros'],
    default: 'Otros'
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  costo: {
    type: Number,
    required: [true, 'El costo es obligatorio'],
    min: [0, 'El costo no puede ser negativo']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es obligatorio'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  stockMinimo: {
    type: Number,
    default: 5,
    min: [0, 'El stock mínimo no puede ser negativo']
  },
  activo: {
    type: Boolean,
    default: true
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Índice para búsqueda rápida
productoSchema.index({ codigo: 1 });
productoSchema.index({ nombre: 'text' });

// Método virtual para calcular ganancia
productoSchema.virtual('ganancia').get(function() {
  return this.precio - this.costo;
});

// Método virtual para verificar stock bajo
productoSchema.virtual('stockBajo').get(function() {
  return this.stock <= this.stockMinimo;
});

// Asegurar que los virtuals se incluyan en JSON
productoSchema.set('toJSON', { virtuals: true });
productoSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Producto', productoSchema);