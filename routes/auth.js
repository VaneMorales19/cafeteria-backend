const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { matricula, nombre, apellido, correo, password } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ $or: [{ correo }, { matricula }] });

    if (userExists) {
      return res.status(400).json({ 
        message: 'Usuario ya existe con ese correo o matrícula' 
      });
    }

    // Crear usuario
    const user = await User.create({
      matricula,
      nombre,
      apellido,
      correo,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        matricula: user.matricula,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        rol: user.rol,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
});

// POST /api/auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { matricula, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ matricula });

    if (!user) {
      return res.status(401).json({ message: 'Matrícula o contraseña incorrecta' });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Matrícula o contraseña incorrecta' });
    }

    // Enviar respuesta con token
    res.json({
      _id: user._id,
      matricula: user.matricula,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      rol: user.rol,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
});

module.exports = router;