const express = require('express');
const router = express.Router();
const Pedido = require('../models/Order');
const Producto = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const nodemailer = require('nodemailer'); 
// Configurar transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// GET /api/admin/dashboard - Estadísticas del dashboard
// Dashboard con estadísticas
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const totalPedidos = await Pedido.countDocuments();
    const pedidosPendientes = await Pedido.countDocuments({ estado: 'pendiente' });
    
    const ventasHoy = await Pedido.aggregate([
      {
        $match: {
          createdAt: { $gte: hoy },
          estado: { $ne: 'cancelado' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    const productosStockBajo = await Producto.countDocuments({ 
      stock: { $gt: 0, $lt: 10 } 
    });

    res.json({
      totalOrders: totalPedidos,
      pendingOrders: pedidosPendientes,
      todaySales: ventasHoy[0]?.total || 0,
      lowStock: productosStockBajo
    });
  } catch (error) {
    console.error('Error en dashboard:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas', 
      error: error.message 
    });
  }
});

// Obtener todos los pedidos (con filtros)
router.get('/orders', protect, admin, async (req, res) => {
  try {
    const { estado } = req.query;
    
    let query = {};
    if (estado && estado !== 'todos') {
      query.estado = estado;
    }
    
    const orders = await Pedido.find(query)
      .populate('usuario', 'nombre apellido correo matricula numeroEmpleado')
      .sort({ createdAt: -1 });
    
    res.json(orders || []); // Si orders es null/undefined, retornar array vacío
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// PUT /api/admin/orders/:id/status - Actualizar estado del pedido
// Actualizar estado de pedido
router.put('/orders/:id/status', protect, admin, async (req, res) => {
  try {
    const { estado, comentario } = req.body;
    
    const order = await Pedido.findById(req.params.id)
      .populate('usuario', 'correo nombre _id');

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    order.estado = estado;
    
    if (comentario) {
      order.historialEstados[order.historialEstados.length - 1].comentario = comentario;
    }

    await order.save();

    // Obtener Socket.IO
    const io = req.app.get('io');
    const activeUsers = req.app.get('activeUsers');

    // Notificar al usuario
    const userSocketId = activeUsers.get(order.usuario._id.toString());
    
    if (userSocketId) {
      io.to(userSocketId).emit('order-status-changed', {
        orderId: order._id,
        numeroOrden: order.numeroOrden,
        estado: order.estado,
        message: getStatusMessage(estado)
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Error actualizando pedido:', error);
    res.status(500).json({ message: 'Error al actualizar pedido', error: error.message });
  }
});

function getStatusMessage(estado) {
  const messages = {
    'pendiente': 'Tu pedido ha sido recibido',
    'preparando': 'Tu pedido se está preparando',
    'listo': '¡Tu pedido está listo! Recógelo en la cafetería',
    'entregado': 'Pedido entregado. ¡Gracias!',
    'cancelado': 'Tu pedido ha sido cancelado'
  };
  return messages[estado] || 'Estado actualizado';
}
// GET /api/admin/products/inventory - Obtener inventario
router.get('/products/inventory', protect, admin, async (req, res) => {
  try {
    const products = await Product.find().sort({ stock: 1 });
    
    const inventory = {
      all: products,
      lowStock: products.filter(p => p.stock < 10),
      outOfStock: products.filter(p => p.stock === 0)
    };

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener inventario', error: error.message });
  }
});

// PUT /api/admin/products/:id/stock - Actualizar stock
router.put('/products/:id/stock', protect, admin, async (req, res) => {
  try {
    const { stock } = req.body;
    
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    product.stock = stock;
    product.disponible = stock > 0;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar stock', error: error.message });
  }
});

// GET /api/admin/users - Obtener todos los usuarios
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
});
// ==================== GESTIÓN DE INVENTARIO ====================

// Obtener todos los productos (con filtros y búsqueda)
router.get('/products', protect, admin, async (req, res) => {
  try {
    const { search, categoria, precioMin, precioMax, ordenar } = req.query;
    
    let query = {};
    
    // Filtro por búsqueda (nombre o descripción)
    if (search) {
      query.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { descripcion: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtro por categoría
    if (categoria && categoria !== 'todos') {
      query.categoria = categoria;
    }
    
    // Filtro por rango de precio
    if (precioMin || precioMax) {
      query.precio = {};
      if (precioMin) query.precio.$gte = parseFloat(precioMin);
      if (precioMax) query.precio.$lte = parseFloat(precioMax);
    }
    
    // Ordenamiento
    let sortOption = {};
    switch(ordenar) {
      case 'nombre-asc':
        sortOption = { nombre: 1 };
        break;
      case 'nombre-desc':
        sortOption = { nombre: -1 };
        break;
      case 'precio-asc':
        sortOption = { precio: 1 };
        break;
      case 'precio-desc':
        sortOption = { precio: -1 };
        break;
      case 'stock-asc':
        sortOption = { stock: 1 };
        break;
      case 'stock-desc':
        sortOption = { stock: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const productos = await Producto.find(query).sort(sortOption);
    
    res.json({
      productos,
      total: productos.length,
      filtros: { search, categoria, precioMin, precioMax, ordenar }
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Crear nuevo producto
router.post('/products', protect, admin, async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria, stock, imagen, opciones } = req.body;
    
    // Validaciones
    if (!nombre || !precio || !categoria) {
      return res.status(400).json({ 
        message: 'Nombre, precio y categoría son requeridos' 
      });
    }
    
    // Verificar si ya existe un producto con ese nombre
    const existeProducto = await Producto.findOne({ nombre });
    if (existeProducto) {
      return res.status(400).json({ 
        message: 'Ya existe un producto con ese nombre' 
      });
    }
    
    const nuevoProducto = new Producto({
      nombre,
      descripcion: descripcion || '',
      precio: parseFloat(precio),
      categoria,
      stock: parseInt(stock) || 0,
      imagen: imagen || '',
      opciones: opciones || [],
      disponible: true
    });
    
    await nuevoProducto.save();
    
    res.status(201).json({
      message: 'Producto creado exitosamente',
      producto: nuevoProducto
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ 
      message: 'Error del servidor', 
      error: error.message 
    });
  }
});

// Actualizar producto
router.put('/products/:id', protect, admin, async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria, stock, imagen, opciones, disponible } = req.body;
    
    const producto = await Producto.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Actualizar campos
    if (nombre) producto.nombre = nombre;
    if (descripcion !== undefined) producto.descripcion = descripcion;
    if (precio) producto.precio = parseFloat(precio);
    if (categoria) producto.categoria = categoria;
    if (stock !== undefined) producto.stock = parseInt(stock);
    if (imagen !== undefined) producto.imagen = imagen;
    if (opciones !== undefined) producto.opciones = opciones;
    if (disponible !== undefined) producto.disponible = disponible;
    
    await producto.save();
    
    res.json({
      message: 'Producto actualizado exitosamente',
      producto
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ 
      message: 'Error del servidor', 
      error: error.message 
    });
  }
});

// Actualizar solo el stock de un producto
router.patch('/products/:id/stock', protect, admin, async (req, res) => {
  try {
    const { cantidad, operacion } = req.body; // operacion: 'agregar' o 'reducir' o 'establecer'
    
    const producto = await Producto.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    const cantidadNum = parseInt(cantidad);
    
    switch(operacion) {
      case 'agregar':
        producto.stock += cantidadNum;
        break;
      case 'reducir':
        producto.stock = Math.max(0, producto.stock - cantidadNum);
        break;
      case 'establecer':
        producto.stock = cantidadNum;
        break;
      default:
        return res.status(400).json({ message: 'Operación inválida' });
    }
    
    // Marcar como no disponible si el stock es 0
    producto.disponible = producto.stock > 0;
    
    await producto.save();
    
    res.json({
      message: 'Stock actualizado exitosamente',
      producto
    });
  } catch (error) {
    console.error('Error actualizando stock:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Eliminar producto
router.delete('/products/:id', protect, admin, async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    await Producto.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Producto eliminado exitosamente',
      productoEliminado: producto.nombre
    });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener estadísticas de inventario
router.get('/inventory-stats', protect, admin, async (req, res) => {
  try {
    const totalProductos = await Producto.countDocuments();
    const productosAgotados = await Producto.countDocuments({ stock: 0 });
    const productosStockBajo = await Producto.countDocuments({ stock: { $gt: 0, $lt: 10 } });
    
    const valorInventario = await Producto.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$precio', '$stock'] } }
        }
      }
    ]);
    
    res.json({
      totalProductos,
      productosAgotados,
      productosStockBajo,
      valorInventario: valorInventario[0]?.total || 0
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});
module.exports = router;