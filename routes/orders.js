const express = require('express');
const router = express.Router();
const Pedido = require('../models/Order');
const Producto = require('../models/Product');
const { protect } = require('../middleware/auth');

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

    // VERIFICAR STOCK DISPONIBLE ANTES DE CREAR EL PEDIDO
    for (const item of items) {
      const producto = await Producto.findById(item.producto);
      
      if (!producto) {
        return res.status(404).json({ 
          message: `Producto ${item.nombre} no encontrado` 
        });
      }

      if (producto.stock < item.cantidad) {
        return res.status(400).json({ 
          message: `Stock insuficiente para ${item.nombre}. Solo quedan ${producto.stock} unidades.` 
        });
      }
    }

    // Generar número de orden único
    let numeroOrden;
    let pedidoExiste = true;
    
    while (pedidoExiste) {
      numeroOrden = Math.floor(100000 + Math.random() * 900000).toString();
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

    //DESCONTAR STOCK DE CADA PRODUCTO
    console.log('Descontando stock...');
    for (const item of items) {
      const producto = await Producto.findById(item.producto);
      
      if (producto) {
        producto.stock -= item.cantidad;
        
        // Si el stock llega a 0, marcar como no disponible
        if (producto.stock <= 0) {
          producto.stock = 0;
          producto.disponible = false;
        }
        
        await producto.save();
        console.log(`Stock actualizado para ${producto.nombre}: ${producto.stock}`);
      }
    }

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

module.exports = router;