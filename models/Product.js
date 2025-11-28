const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    default: ''
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  categoria: {
    type: String,
    required: true,
    enum: ['desayunos', 'comidas', 'bebidas']
  },
  imagen: {
    type: String,
    default: ''
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  disponible: {
    type: Boolean,
    default: true
  },
  opciones: [{
    nombre: String,
    requerido: Boolean,
    opciones: [{
      valor: String,
      precioExtra: {
        type: Number,
        default: 0
      }
    }]
  }]
}, { timestamps: true });

// Middleware para actualizar disponibilidad basado en stock
productSchema.pre('save', function(next) {
  if (this.stock === 0) {
    this.disponible = false;
  }
  next();
});

// Forzar a usar la colección 'productos' (o el nombre que ya tengas)
module.exports = mongoose.model('Product', productSchema, 'products');