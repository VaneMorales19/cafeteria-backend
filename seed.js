const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error:', err));

const products = [
  // Desayunos
  {
  nombre: 'Huevos al gusto',
  descripcion: 'Huevos revueltos con tu proteína favorita',
  precio: 45,
  categoria: 'desayunos',
  stock: 50,
  imagen: 'https://i.imgur.com/MREJsfR.jpeg',
  opciones: [
    {
      nombre: 'Proteína',
      opciones: [
        { valor: 'Jamón', precioExtra: 0 },
        { valor: 'Salchicha', precioExtra: 0 },
        { valor: 'Longaniza', precioExtra: 5 }
      ],
      requerido: true
    },
    {
      nombre: 'Acompañamiento',
      opciones: [
        { valor: 'Frijoles', precioExtra: 0 },
        { valor: 'Chilaquiles', precioExtra: 8 }
      ],
      requerido: false
    }
  ]
},

{
  nombre: 'Omelet de Huevo',
  descripcion: 'Omelet esponjoso con tus ingredientes favoritos',
  precio: 48,
  categoria: 'desayunos',
  stock: 40,
  imagen: 'https://i.imgur.com/34PEiJh.jpeg',
  opciones: [
    {
      nombre: 'Relleno',
      opciones: [
        { valor: 'Jamón y queso', precioExtra: 0 },
        { valor: 'Champiñones', precioExtra: 5 },
        { valor: 'Espinacas y queso', precioExtra: 5 },
        { valor: 'Mixto', precioExtra: 10 }
      ],
      requerido: true
    }
  ]
},
{
  nombre: 'Hot Cakes',
  descripcion: 'Esponjosos hot cakes con miel',
  precio: 42,
  categoria: 'desayunos',
  stock: 35,
  imagen: 'https://i.imgur.com/Sg5PJFs.jpeg',
  opciones: [
    {
      nombre: 'Acompañamiento',
      opciones: [
        { valor: 'Solo miel', precioExtra: 0 },
        { valor: 'Con fruta', precioExtra: 10 },
        { valor: 'Con nutella', precioExtra: 12 }
      ],
      requerido: true
    }
  ]
},

{
  nombre: 'Coctel de Fruta',
  descripcion: 'Fruta fresca de temporada con yogurt',
  precio: 40,
  categoria: 'desayunos',
  stock: 35,
  imagen: 'https://i.imgur.com/FEaOERP.jpeg',
  opciones: [
    {
      nombre: 'Tamaño',
      opciones: [
        { valor: 'Chico', precioExtra: 0 },
        { valor: 'Mediano', precioExtra: 10 },
        { valor: 'Grande', precioExtra: 15 }
      ],
      requerido: true
    },
    {
      nombre: 'Extras',
      opciones: [
        { valor: 'Sin extras', precioExtra: 0 },
        { valor: 'Con granola', precioExtra: 8 },
        { valor: 'Con miel', precioExtra: 5 },
        { valor: 'Con amaranto', precioExtra: 8 }
      ],
      requerido: false
    }
  ]
},

{
  nombre: 'Yogurt con Granola',
  descripcion: 'Yogurt natural con granola crujiente y fruta',
  precio: 38,
  categoria: 'desayunos',
  stock: 45,
  imagen: 'https://i.imgur.com/bgKQxla.jpeg',
  opciones: [
    {
      nombre: 'Tipo de Yogurt',
      opciones: [
        { valor: 'Natural', precioExtra: 0 },
        { valor: 'Griego', precioExtra: 8 },
        { valor: 'Con miel', precioExtra: 5 }
      ],
      requerido: true
    },
    {
      nombre: 'Fruta',
      opciones: [
        { valor: 'Fresa', precioExtra: 0 },
        { valor: 'Plátano', precioExtra: 0 },
        { valor: 'Mixta', precioExtra: 5 }
      ],
      requerido: false
    }
  ]
},
  {
    nombre: 'Chilaquiles',
    descripcion: 'Deliciosos chilaquiles con tu salsa favorita',
    precio: 45,
    categoria: 'desayunos',
    stock: 50,
    imagen: 'https://i.imgur.com/2Z2nYFN.jpeg',
    opciones: [
      {
        nombre: 'Tipo de Salsa',
        opciones: [
          { valor: 'Verde', precioExtra: 0 },
          { valor: 'Roja', precioExtra: 0 }
        ],
        requerido: true
      },
      {
        nombre: 'Proteína',
        opciones: [
          { valor: 'Sin proteína', precioExtra: 0 },
          { valor: 'Con pollo', precioExtra: 15 },
          { valor: 'Con huevo', precioExtra: 10 }
        ],
        requerido: false
      }
    ]
  },
  {
    nombre: 'Molletes',
    descripcion: 'Con frijoles y queso gratinado',
    precio: 35,
    categoria: 'desayunos',
    stock: 40,
    imagen: 'https://i.imgur.com/21GOKNF.jpeg',
    opciones: [
      {
        nombre: 'Extra',
        opciones: [
          { valor: 'Sin extra', precioExtra: 0 },
          { valor: 'Con chorizo', precioExtra: 12 },
          { valor: 'Con jamón', precioExtra: 10 }
        ],
        requerido: false
      }
    ]
  },
  {
    nombre: 'Quesadillas',
    descripcion: 'Quesadillas calientitas',
    precio: 40,
    categoria: 'desayunos',
    stock: 60,
    imagen: 'https://i.imgur.com/f5YdrYV.jpeg',
    opciones: [
      {
        nombre: 'Relleno',
        opciones: [
          { valor: 'Solo queso', precioExtra: 0 },
          { valor: 'Champiñones', precioExtra: 8 },
          { valor: 'Flor de calabaza', precioExtra: 10 },
          { valor: 'Pollo', precioExtra: 12 }
        ],
        requerido: true
      }
    ]
  },
 
{
  nombre: 'Sopes',
  descripcion: 'Sopes tradicionales con frijoles y queso',
  precio: 42,
  categoria: 'desayunos',
  stock: 40,
  imagen: 'https://i.imgur.com/WB7a78K.jpeg',
  opciones: [
    {
      nombre: 'Cantidad',
      opciones: [
        { valor: '2 piezas', precioExtra: 0 },
        { valor: '3 piezas', precioExtra: 15 },
        { valor: '4 piezas', precioExtra: 25 }
      ],
      requerido: true
    },
    {
      nombre: 'Guisado',
      opciones: [
        { valor: 'Solo frijoles', precioExtra: 0 },
        { valor: 'Con pollo', precioExtra: 10 },
        { valor: 'Con chorizo', precioExtra: 12 },
        { valor: 'Con tinga', precioExtra: 12 }
      ],
      requerido: true
    },
    {
      nombre: 'Salsa',
      opciones: [
        { valor: 'Verde', precioExtra: 0 },
        { valor: 'Roja', precioExtra: 0 }
      ],
      requerido: true
    }
  ]
},

{
  nombre: 'Picadas',
  descripcion: 'Picadas veracruzanas con salsa',
  precio: 40,
  categoria: 'desayunos',
  stock: 35,
  imagen: 'https://i.imgur.com/bgcQW1z.jpeg',
  opciones: [
    {
      nombre: 'Cantidad',
      opciones: [
        { valor: '2 piezas', precioExtra: 0 },
        { valor: '3 piezas', precioExtra: 15 }
      ],
      requerido: true
    },
    {
      nombre: 'Salsa',
      opciones: [
        { valor: 'Verde', precioExtra: 0 },
        { valor: 'Roja', precioExtra: 0 }
      ],
      requerido: true
    },
    {
      nombre: 'Extra',
      opciones: [
        { valor: 'Sin extra', precioExtra: 0 },
        { valor: 'Con carne', precioExtra: 15 }
      ],
      requerido: false
    }
  ]
},

{
  nombre: 'Empanadas',
  descripcion: 'Empanadas horneadas rellenas',
  precio: 35,
  categoria: 'desayunos',
  stock: 50,
  imagen: 'https://i.imgur.com/78iqMee.jpeg',
  opciones: [
    {
      nombre: 'Cantidad',
      opciones: [
        { valor: '2 piezas', precioExtra: 0 },
        { valor: '3 piezas', precioExtra: 12 },
        { valor: '4 piezas', precioExtra: 20 }
      ],
      requerido: true
    },
    {
      nombre: 'Relleno',
      opciones: [
        { valor: 'Queso', precioExtra: 0 },
        { valor: 'Pollo', precioExtra: 5 },
        { valor: 'Carne molida', precioExtra: 5 }
      ],
      requerido: true
    }
  ]
},
  
  // Comidas
  {
    nombre: 'Tacos de Guisado',
    descripcion: '3 tacos con guisado del día',
    precio: 50,
    categoria: 'comidas',
    stock: 70,
    imagen: 'https://i.imgur.com/9XEn8qM.jpeg',
    opciones: [
      {
        nombre: 'Tipo de Tortilla',
        opciones: [
          { valor: 'Maíz', precioExtra: 0 },
          { valor: 'Harina', precioExtra: 5 }
        ],
        requerido: true
      }
    ]
  },
  {
    nombre: 'Torta',
    descripcion: 'Variedad de ingredientes',
    precio: 45,
    categoria: 'comidas',
    stock: 55,
    imagen: 'https://i.imgur.com/icxojEB.jpeg',
    opciones: [
      {
        nombre: 'Tipo de Torta',
        opciones: [
          { valor: 'Jamón', precioExtra: 0 },
          { valor: 'Milanesa', precioExtra: 10 },
          { valor: 'Pierna', precioExtra: 8 },
          { valor: 'Cubana', precioExtra: 15 }
        ],
        requerido: true
      }
    ]
  },
  {
    nombre: 'Hamburguesa',
    descripcion: 'Con papas',
    precio: 55,
    categoria: 'comidas',
    stock: 40,
    imagen: 'https://i.imgur.com/WPFc631.jpeg',
    opciones: [
      {
        nombre: 'Extras',
        opciones: [
          { valor: 'Sin extras', precioExtra: 0 },
          { valor: 'Queso extra', precioExtra: 8 },
          { valor: 'Tocino', precioExtra: 12 },
          { valor: 'Doble carne', precioExtra: 20 }
        ],
        requerido: false
      }
    ]
  },
  {
    nombre: 'Ensalada',
    descripcion: 'Fresca y saludable',
    precio: 48,
    categoria: 'comidas',
    stock: 30,
    imagen: 'https://i.imgur.com/B7AO8Zt.jpeg',
    opciones: [
      {
        nombre: 'Aderezo',
        opciones: [
          { valor: 'Ranch', precioExtra: 0 },
          { valor: 'Vinagreta', precioExtra: 0 },
          { valor: 'César', precioExtra: 0 }
        ],
        requerido: true
      }
    ]
  },

{
  nombre: 'Enchiladas',
  descripcion: 'Enchiladas con tu salsa y proteína favorita',
  precio: 55,
  categoria: 'comidas',
  stock: 45,
  imagen: 'https://i.imgur.com/gGFbhmE.jpeg',
  opciones: [
    {
      nombre: 'Tipo de Salsa',
      opciones: [
        { valor: 'Rojas', precioExtra: 0 },
        { valor: 'Verdes', precioExtra: 0 },
        { valor: 'Mole', precioExtra: 8 }
      ],
      requerido: true
    },
    {
      nombre: 'Proteína',
      opciones: [
        { valor: 'Pollo', precioExtra: 0 },
        { valor: 'Carne asada', precioExtra: 10 },
        { valor: 'Solo queso', precioExtra: -5 }
      ],
      requerido: true
    },
    {
      nombre: 'Cantidad',
      opciones: [
        { valor: '3 piezas', precioExtra: 0 },
        { valor: '4 piezas', precioExtra: 12 },
        { valor: '5 piezas', precioExtra: 20 }
      ],
      requerido: true
    }
  ]
},

{
  nombre: 'Pollo a la Plancha',
  descripcion: 'Pechuga de pollo a la plancha con guarnición',
  precio: 65,
  categoria: 'comidas',
  stock: 35,
  imagen: 'https://i.imgur.com/8Gd5Ya8.jpeg',
  opciones: [
    {
      nombre: 'Guarnición',
      opciones: [
        { valor: 'Arroz y frijoles', precioExtra: 0 },
        { valor: 'Ensalada', precioExtra: 0 },
        { valor: 'Papas', precioExtra: 5 },
        { valor: 'Vegetales', precioExtra: 8 }
      ],
      requerido: true
    },
    {
      nombre: 'Salsa',
      opciones: [
        { valor: 'Sin salsa', precioExtra: 0 },
        { valor: 'Champiñones', precioExtra: 12 },
        { valor: 'BBQ', precioExtra: 8 },
        { valor: 'Mostaza y miel', precioExtra: 10 }
      ],
      requerido: false
    }
  ]
},

{
  nombre: 'Tampiqueña',
  descripcion: 'Carne asada estilo tampiqueña con guarniciones',
  precio: 85,
  categoria: 'comidas',
  stock: 25,
  imagen: 'https://i.imgur.com/PzaBouM.jpeg',
  opciones: [
    {
      nombre: 'Extras',
      opciones: [
        { valor: 'Sin extras', precioExtra: 0 },
        { valor: 'Con quesadilla', precioExtra: 15 },
        { valor: 'Con guacamole', precioExtra: 12 }
      ],
      requerido: false
    }
  ]
},

{
  nombre: 'Tacos Dorados',
  descripcion: 'Tacos dorados crujientes',
  precio: 48,
  categoria: 'comidas',
  stock: 50,
  imagen: 'https://i.imgur.com/sE7Hokr.jpeg',
  opciones: [
    {
      nombre: 'Cantidad',
      opciones: [
        { valor: '3 piezas', precioExtra: 0 },
        { valor: '4 piezas', precioExtra: 12 },
        { valor: '5 piezas', precioExtra: 20 }
      ],
      requerido: true
    },
    {
      nombre: 'Relleno',
      opciones: [
        { valor: 'Pollo', precioExtra: 0 },
        { valor: 'Papa con chorizo', precioExtra: 0 },
        { valor: 'Carne deshebrada', precioExtra: 5 }
      ],
      requerido: true
    }
  ]
},

{
  nombre: 'Club Sandwich',
  descripcion: 'Sándwich triple con pollo y vegetales',
  precio: 58,
  categoria: 'comidas',
  stock: 40,
  imagen: 'https://i.imgur.com/JYgY6hO.jpeg',
  opciones: [
    {
      nombre: 'Tipo de Pan',
      opciones: [
        { valor: 'Blanco', precioExtra: 0 },
        { valor: 'Integral', precioExtra: 3 },
        { valor: 'Multigrano', precioExtra: 5 }
      ],
      requerido: true
    },
    {
      nombre: 'Acompañamiento',
      opciones: [
        { valor: 'Papas a la francesa', precioExtra: 0 },
        { valor: 'Ensalada', precioExtra: 0 }
      ],
      requerido: true
    }
  ]
},

  
  
  // Bebidas
  {
  nombre: 'Agua Natural Embotellada',
  descripcion: 'Agua purificada embotellada',
  precio: 12,
  categoria: 'bebidas',
  stock: 100,
  imagen: 'https://i.imgur.com/UNUjkTX.jpeg',
  opciones: [
    {
      nombre: 'Tamaño',
      opciones: [
        { valor: '500ml', precioExtra: 0 },
        { valor: '1 litro', precioExtra: 8 }
      ],
      requerido: true
    }
  ]
  },
  {
    nombre: 'Café',
    descripcion: 'Café recién hecho',
    precio: 20,
    categoria: 'bebidas',
    stock: 100,
    imagen: 'https://i.imgur.com/I6ONVNw.jpeg',
    opciones: [
      {
        nombre: 'Tipo',
        opciones: [
          { valor: 'Americano', precioExtra: 0 },
          { valor: 'Con leche', precioExtra: 5 },
          { valor: 'Capuchino', precioExtra: 10 }
        ],
        requerido: true
      },
      {
        nombre: 'Tamaño',
        opciones: [
          { valor: 'Chico', precioExtra: 0 },
          { valor: 'Mediano', precioExtra: 5 },
          { valor: 'Grande', precioExtra: 10 }
        ],
        requerido: true
      }
    ]
  },
  {
    nombre: 'Agua Fresca',
    descripcion: 'Del día',
    precio: 15,
    categoria: 'bebidas',
    stock: 80,
    imagen: 'https://i.imgur.com/aRInFwT.jpeg',
    opciones: [
      {
        nombre: 'Tamaño',
        opciones: [
          { valor: 'Chico', precioExtra: 0 },
          { valor: 'Mediano', precioExtra: 5 },
          { valor: 'Grande', precioExtra: 10 }
        ],
        requerido: true
      }
    ]
  },
  {
  nombre: 'Té',
  descripcion: 'Té caliente',
  precio: 22,
  categoria: 'bebidas',
  stock: 60,
  imagen: 'https://i.imgur.com/ESnHyM4.jpeg',
  opciones: [
    {
      nombre: 'Sabor',
      opciones: [
        { valor: 'Limón', precioExtra: 0 },
        { valor: 'Durazno', precioExtra: 0 },
        { valor: 'Frutos rojos', precioExtra: 3 }
      ],
      requerido: true
    }
  ]
  },


  {
    nombre: 'Jugo Natural',
    descripcion: 'Recién exprimido',
    precio: 25,
    categoria: 'bebidas',
    stock: 60,
    imagen: 'https://i.imgur.com/YlhfAYc.jpeg',
    opciones: [
      {
        nombre: 'Sabor',
        opciones: [
          { valor: 'Naranja', precioExtra: 0 },
          { valor: 'Zanahoria', precioExtra: 0 },
          { valor: 'Mixto', precioExtra: 5 }
        ],
        requerido: true
      }
    ]
  }
];

const seedDB = async () => {
  try {
    await Product.deleteMany({});
    console.log('Productos eliminados');

    await Product.insertMany(products);
    console.log('Productos agregados con imágenes y opciones');

    const adminExists = await User.findOne({ correo: 'admin@uv.mx' });
    
    if (!adminExists) {
      await User.create({
        matricula: 'ADMIN001',
        nombre: 'Administrador',
        apellido: 'Cafetería',
        correo: 'admin@uv.mx',
        password: 'admin123',
        rol: 'admin'
      });
      console.log('   Usuario administrador creado');
      console.log('   Matrícula: ADMIN001');
      console.log('   Password: admin123');
    }

    console.log(' Base de datos inicializada');
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedDB();