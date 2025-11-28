const express = require('express');
const router = express.Router();
const Pedido = require('../models/Order');
const { protect } = require('../middleware/auth');

// Crear nuevo pedido
router.post('/', protect, async (req, res) => {
  try {
    const { items, total, metodoPago, notasAdicionales } = req.body;

    console.log('Datos recibidos del pedido:', { items, total });
    console.log('Items detallados:', JSON.stringify(items, null, 2));

    // Validaciones
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'El carrito está vacío' });
    }

    if (!total) {
      return res.status(400).json({ message: 'Total es requerido' });
    }

    // Generar número de orden
    const count = await Pedido.countDocuments();
    const numeroOrden = String(count + 1).padStart(6, '0');

    // Crear pedido con las opciones incluidas
    const nuevoPedido = new Pedido({
      numeroOrden,
      usuario: req.user.id,
      items: items.map(item => ({
        producto: item.producto,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
        opcionesSeleccionadas: item.opcionesSeleccionadas || [], // ← CRÍTICO
        comentarios: item.comentarios || ''
      })),
      total,
      estado: 'pendiente',
      metodoPago: {
        tipo: 'tarjeta',
        cardNumber: metodoPago?.cardNumber || ''
      },
      notasAdicionales: notasAdicionales || '',
      historialEstados: [{
        estado: 'pendiente',
        fecha: new Date()
      }]
    });

    console.log('Pedido a guardar:', JSON.stringify(nuevoPedido.items, null, 2));

    await nuevoPedido.save();

    console.log('Pedido guardado exitosamente');

    // Poblar información del usuario
    await nuevoPedido.populate('usuario', 'nombre apellido correo matricula numeroEmpleado');

    // Emitir evento de socket (si está configurado)
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('new-order', nuevoPedido);
    }

    res.status(201).json(nuevoPedido);
  } catch (error) {
    console.error('Error creando pedido:', error);
    res.status(500).json({ 
      message: 'Error al crear pedido', 
      error: error.message 
    });
  }
});

// Obtener pedidos del usuario
router.get('/my-orders', protect, async (req, res) => {
  try {
    const pedidos = await Pedido.find({ usuario: req.user.id })
      .sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;