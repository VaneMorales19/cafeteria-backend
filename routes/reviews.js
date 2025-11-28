const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect, admin } = require('../middleware/auth');

// POST /api/reviews - Crear reseña
router.post('/', protect, async (req, res) => {
  try {
    const { pedidoId, calificacion, comentario } = req.body;

    const review = await Review.create({
      usuario: req.user._id,
      pedido: pedidoId,
      calificacion,
      comentario
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear reseña', error: error.message });
  }
});

// GET /api/reviews - Obtener todas las reseñas (admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('usuario', 'nombre apellido matricula')
      .populate('pedido', 'numeroOrden')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reseñas', error: error.message });
  }
});

module.exports = router;