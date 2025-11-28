const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/User'); // Importa User.js

// Registro de Estudiante
router.post('/register/estudiante', async (req, res) => {
  try {
    const { matricula, nombre, apellido, correo, password } = req.body;

    // Validaciones
    if (!matricula || !nombre || !apellido || !correo || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar que el correo sea institucional
    if (!correo.endsWith('@estudiantes.uv.mx')) {
      return res.status(400).json({ message: 'Debe usar su correo institucional @estudiantes.uv.mx' });
    }

    // Verificar formato de matrícula (empieza con S)
    if (!matricula.startsWith('S')) {
      return res.status(400).json({ message: 'Matrícula inválida. Debe comenzar con S' });
    }

    // Verificar si ya existe
    const existeUsuario = await Usuario.findOne({ 
      $or: [{ correo }, { matricula }] 
    });

    if (existeUsuario) {
      return res.status(400).json({ 
        message: existeUsuario.correo === correo 
          ? 'El correo ya está registrado' 
          : 'La matrícula ya está registrada' 
      });
    }

    // Hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const nuevoUsuario = new Usuario({
      matricula,
      nombre,
      apellido,
      correo,
      password: hashedPassword,
      rol: 'estudiante'
    });

    await nuevoUsuario.save();

    // Generar token
    const token = jwt.sign(
      { id: nuevoUsuario._id, rol: nuevoUsuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      usuario: {
        _id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        correo: nuevoUsuario.correo,
        matricula: nuevoUsuario.matricula,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    console.error('Error en registro de estudiante:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Registro de Docente
router.post('/register/docente', async (req, res) => {
  try {
    const { numeroEmpleado, nombre, apellido, correo, password } = req.body;

    // Validaciones
    if (!numeroEmpleado || !nombre || !apellido || !correo || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar que el correo sea institucional
    if (!correo.endsWith('@uv.mx')) {
      return res.status(400).json({ message: 'Debe usar su correo institucional @uv.mx' });
    }

    // Verificar si ya existe
    const existeUsuario = await Usuario.findOne({ 
      $or: [{ correo }, { numeroEmpleado }] 
    });

    if (existeUsuario) {
      return res.status(400).json({ 
        message: existeUsuario.correo === correo 
          ? 'El correo ya está registrado' 
          : 'El número de empleado ya está registrado' 
      });
    }

    // Hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear docente
    const nuevoDocente = new Usuario({
      numeroEmpleado,
      nombre,
      apellido,
      correo,
      password: hashedPassword,
      rol: 'docente'
    });

    await nuevoDocente.save();

    // Generar token
    const token = jwt.sign(
      { id: nuevoDocente._id, rol: nuevoDocente.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      usuario: {
        _id: nuevoDocente._id,
        nombre: nuevoDocente.nombre,
        apellido: nuevoDocente.apellido,
        correo: nuevoDocente.correo,
        numeroEmpleado: nuevoDocente.numeroEmpleado,
        rol: nuevoDocente.rol
      }
    });
  } catch (error) {
    console.error('Error en registro de docente:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Login unificado (sirve para estudiantes, docentes y admins)
router.post('/login', async (req, res) => {
  try {
    const { identificador, password } = req.body; // identificador puede ser matrícula o número de empleado

    if (!identificador || !password) {
      return res.status(400).json({ message: 'Identificador y contraseña requeridos' });
    }

    // Buscar por matrícula o número de empleado
    const usuario = await Usuario.findOne({
      $or: [
        { matricula: identificador },
        { numeroEmpleado: identificador }
      ]
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        matricula: usuario.matricula,
        numeroEmpleado: usuario.numeroEmpleado,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;