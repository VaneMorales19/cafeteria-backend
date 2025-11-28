const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Agregar método de pago
router.post('/payment-methods', protect, async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('User ID:', req.user.id);
    
    const { cardNumber, cardName, expiry } = req.body;

    if (!cardNumber || !cardName || !expiry) {
      console.log('Campos faltantes');
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const user = await User.findById(req.user.id);
    console.log('Usuario encontrado:', user ? 'Sí' : 'No');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Inicializar metodosPago si no existe
    if (!user.metodosPago) {
      user.metodosPago = [];
    }

    console.log('Métodos de pago actuales:', user.metodosPago.length);

    // Si es la primera tarjeta, marcarla como predeterminada
    const isFirstCard = user.metodosPago.length === 0;

    // Agregar nueva tarjeta
    user.metodosPago.push({
      tipo: 'tarjeta',
      cardNumber: cardNumber.slice(-4), // Solo guardar últimos 4 dígitos
      cardName,
      expiry,
      isDefault: isFirstCard
    });

    console.log('Guardando usuario...');
    await user.save();
    console.log('Usuario guardado exitosamente');
    console.log('Total de métodos de pago:', user.metodosPago.length);

    res.status(201).json(user.metodosPago);
  } catch (error) {
    console.error('Error agregando método de pago:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Obtener métodos de pago del usuario
router.get('/payment-methods', protect, async (req, res) => {
  try {
    console.log('Obteniendo métodos de pago para usuario:', req.user.id);
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    console.log('Usuario encontrado, métodos de pago:', user.metodosPago?.length || 0);
    
    res.json(user.metodosPago || []);
  } catch (error) {
    console.error('Error obteniendo métodos de pago:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Eliminar método de pago
router.delete('/payment-methods/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (!user.metodosPago) {
      return res.status(404).json({ message: 'No hay métodos de pago' });
    }

    // Filtrar el método de pago a eliminar
    user.metodosPago = user.metodosPago.filter(
      method => method._id.toString() !== req.params.id
    );

    await user.save();

    res.json({ message: 'Método de pago eliminado' });
  } catch (error) {
    console.error('Error eliminando método de pago:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Actualizar perfil de usuario
router.put('/profile', protect, async (req, res) => {
  try {
    const { nombre, apellido, correo, telefono } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar campos
    if (nombre) user.nombre = nombre;
    if (apellido) user.apellido = apellido;
    if (correo) user.correo = correo;
    if (telefono !== undefined) user.telefono = telefono;

    await user.save();

    res.json({
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      telefono: user.telefono
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;