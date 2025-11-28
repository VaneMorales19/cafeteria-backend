const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  numeroOrden: {
    type: String,
    required: true,
    unique: true
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    nombre: String,
    precio: Number,
    cantidad: Number,
    opcionesSeleccionadas: [{
      nombre: String,
      valor: String,
      precioExtra: {
        type: Number,
        default: 0
      }
    }],
    comentarios: String
  }],
  total: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  metodoPago: {
    tipo: String,
    cardNumber: String
  },
  notasAdicionales: String,
  historialEstados: [{
    estado: String,
    fecha: {
      type: Date,
      default: Date.now
    },
    comentario: String
  }]
}, { timestamps: true });

// Middleware para generar número de orden
pedidoSchema.pre('save', async function(next) {
  if (!this.numeroOrden) {
    const count = await mongoose.model('Order').countDocuments();
    this.numeroOrden = String(count + 1).padStart(6, '0');
  }
  next();
});

module.exports = mongoose.model('Order', pedidoSchema, 'orders');