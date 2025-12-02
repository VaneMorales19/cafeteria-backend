const express = require('express');
const router = express.Router();
const Pedido = require('../models/Order');
const { protect } = require('../middleware/auth');

// Obtener pedidos del usuario actual
router.get('/', protect, async (req, res) => {
  try {
    console.log('Obteniendo pedidos del usuario:', req.user.id);
    
    const pedidos = await Pedido.find({ usuario: req.user.id })
      .sort({ createdAt: -1 });
    
    console.log('Pedidos encontrados:', pedidos.length);
    
    res.json(pedidos);
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});
// Crear nuevo pedido
router.post('/', protect, async (req, res) => {
  try {
    const { items, total, metodoPago, notasAdicionales } = req.body;

    console.log('Datos recibidos del pedido:', { items, total });

    // Validaciones
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'El carrito está vacío' });
    }

    if (!total) {
      return res.status(400).json({ message: 'Total es requerido' });
    }

    // GENERAR NÚMERO DE ORDEN ÚNICO
    let numeroOrden;
    let pedidoExiste = true;
    
    while (pedidoExiste) {
      // Generar número aleatorio de 6 dígitos
      numeroOrden = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Verificar si ya existe
      const existe = await Pedido.findOne({ numeroOrden });
      if (!existe) {
        pedidoExiste = false;
      }
    }

    console.log('Número de orden generado:', numeroOrden);

    // Crear pedido
    const nuevoPedido = new Pedido({
      numeroOrden,
      usuario: req.user.id,
      items: items.map(item => ({
        producto: item.producto,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
        opcionesSeleccionadas: item.opcionesSeleccionadas || [],
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

    console.log('Guardando pedido...');

    await nuevoPedido.save();

    console.log('Pedido guardado exitosamente');

    // Poblar información del usuario
    await nuevoPedido.populate('usuario', 'nombre apellido correo matricula numeroEmpleado');

    // Emitir evento de socket
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
module.exports = router;