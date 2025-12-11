// Descripción: Define el schema de Mongoose para la colección 'orders'
const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
    // Identificador único del pedido generado automáticamente
  // Formato: 6 dígitos con padding de ceros (ejemplo: "000001", "000042")
  numeroOrden: {
    type: String,
    required: true,
    unique: true
  },
   // Referencia al usuario que realizó el pedido
  // Utiliza ObjectId para establecer una relación con la colección 'users'
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Array de productos incluidos en el pedido
  // Cada item es un subdocumento embebido que contiene información del producto
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
   // Estado actual del pedido en el flujo de preparación y entrega
  // Valores permitidos definidos en el enum
  estado: {
    type: String,
    enum: ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
    // Información del método de pago utilizado
  // Subdocumento embebido con detalles de la tarjeta
  metodoPago: {
    tipo: String,
    cardNumber: String
  },
   // Comentarios generales del pedido (no específicos de un item)
  notasAdicionales: String,
   // Array que registra todos los cambios de estado del pedido
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