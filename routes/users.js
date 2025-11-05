const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/users/profile - Obtener perfil del usuario
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
  }
});

// PUT /api/users/profile - Actualizar perfil
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.nombre = req.body.nombre || user.nombre;
      user.apellido = req.body.apellido || user.apellido;
      user.correo = req.body.correo || user.correo;
      user.telefono = req.body.telefono || user.telefono;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        matricula: updatedUser.matricula,
        nombre: updatedUser.nombre,
        apellido: updatedUser.apellido,
        correo: updatedUser.correo,
        telefono: updatedUser.telefono,
        rol: updatedUser.rol
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
  }
});

// POST /api/users/payment-methods - Agregar método de pago
router.post('/payment-methods', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const { cardNumber, cardName, expiry } = req.body;
    
    // Solo guardar los últimos 4 dígitos por seguridad
    const ultimosDigitos = cardNumber.slice(-4);
    
    const newPaymentMethod = {
      cardNumber: ultimosDigitos,
      cardName,
      expiry,
      isDefault: user.metodospago.length === 0 // Primera tarjeta es predeterminada
    };

    user.metodospago.push(newPaymentMethod);
    await user.save();

    res.status(201).json({ 
      message: 'Método de pago agregado',
      paymentMethods: user.metodospago 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar método de pago', error: error.message });
  }
});

// GET /api/users/payment-methods - Obtener métodos de pago
router.get('/payment-methods', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('metodospago');
    res.json(user.metodospago);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener métodos de pago', error: error.message });
  }
});

// DELETE /api/users/payment-methods/:id - Eliminar método de pago
router.delete('/payment-methods/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.metodospago = user.metodospago.filter(
      method => method._id.toString() !== req.params.id
    );
    await user.save();
    res.json({ message: 'Método de pago eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar método de pago', error: error.message });
  }
});

module.exports = router;