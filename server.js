// Al inicio del archivo, después de los requires
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error conectando a MongoDB:', err));

// Socket.IO - Gestión de conexiones
const activeUsers = new Map(); // Guardar userId -> socketId

io.on('connection', (socket) => {
  console.log(' Usuario conectado:', socket.id);
  
  // Usuario se identifica con su ID
  socket.on('register-user', (userId) => {
    activeUsers.set(userId, socket.id);
    console.log(`Usuario ${userId} registrado en socket ${socket.id}`);
  });

  // Admin se une a sala especial
  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log('Administrador unido a admin-room');
  });

  socket.on('disconnect', () => {
    // Eliminar usuario del mapa
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        console.log(`Usuario ${userId} desconectado`);
        break;
      }
    }
  });
});

// Hacer io y activeUsers accesibles en las rutas
app.set('io', io);
app.set('activeUsers', activeUsers);

// Rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users')); 
app.use('/api/reviews', require('./routes/reviews'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Cafetería UV funcionando' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
// En server.js, después de las otras rutas
const reviewRoutes = require('./routes/reviews');
app.use('/api/reviews', reviewRoutes);
