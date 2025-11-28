const express = require('express');
const router = express.Router();
const Producto = require('../models/Product');

// Obtener todos los productos (con filtros para usuarios)
router.get('/', async (req, res) => {
  try {
    const { search, categoria, precioMin, precioMax, ordenar } = req.query;
    
    // Query base: solo productos disponibles
    let query = { disponible: true };
    
    // Filtro por búsqueda
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
      case 'precio-asc':
        sortOption = { precio: 1 };
        break;
      case 'precio-desc':
        sortOption = { precio: -1 };
        break;
      case 'nombre-asc':
        sortOption = { nombre: 1 };
        break;
      case 'nombre-desc':
        sortOption = { nombre: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const productos = await Producto.find(query).sort(sortOption);
    
    res.json(productos);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json(producto);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});


module.exports = router;