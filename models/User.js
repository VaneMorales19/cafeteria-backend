const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Campos comunes
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['estudiante', 'docente', 'admin'], default: 'estudiante' },
  telefono: String,
  
  // Para estudiantes
  matricula: { 
    type: String, 
    sparse: true,
    unique: true 
  },
  
  // Para docentes
  numeroEmpleado: { 
    type: String, 
    sparse: true,
    unique: true 
  },
  
  // Métodos de pago
  metodosPago: [{
    tipo: { type: String, enum: ['tarjeta', 'efectivo'], default: 'efectivo' },
    cardNumber: String,
    cardName: String,
    expiry: String,
    isDefault: { type: Boolean, default: false }
  }]
}, { timestamps: true });

// Forzar a usar la colección 'users' (el nombre que ya existe)
module.exports = mongoose.model('User', userSchema, 'users');