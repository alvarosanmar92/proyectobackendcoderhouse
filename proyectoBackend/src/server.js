// src/server.js
const express = require('express');
const { Server } = require('socket.io'); 
const http = require('http');             
const path = require('path');
const exphbs = require('express-handlebars'); // Cambia aquí la importación

const app = express();
const PORT = 8080;

// Crear el servidor HTTP y Socket.IO
const server = http.createServer(app);
const io = new Server(server);

// Configuración de Handlebars como motor de plantillas
app.engine('handlebars', exphbs.engine()); // Cambia aquí la forma de configurar Handlebars
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importación de rutas de productos y carritos
const productsRouter = require('../api/products');
const cartsRouter = require('../api/carts');

// Usamos las rutas ya existentes
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Array temporal para almacenar productos (aquí podrías usar una base de datos real)
let productos = [];

// Ruta principal - Home
app.get('/', (req, res) => {
    res.render('home', { productos });
});

// Ruta para la vista en tiempo real
app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { productos });
});

// Manejo de conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log('Usuario conectado');

    // Enviar la lista actual de productos cuando un cliente se conecte
    socket.emit('updateProducts', productos);

    // Escuchar cuando se agrega un nuevo producto
    socket.on('newProduct', (product) => {
        productos.push(product);
        io.emit('updateProducts', productos); 
    });

    // Escuchar cuando se elimina un producto
    socket.on('deleteProduct', (productId) => {
        productos = productos.filter(p => p.id !== productId);
        io.emit('updateProducts', productos); 
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

// Ruta para manejar la creación de productos desde HTTP (si decides usar esto con HTTP)
app.post('/productos', (req, res) => {
    const product = req.body;
    productos.push(product);
    io.emit('updateProducts', productos);  
    res.redirect('/');
});

// Ruta para eliminar productos vía HTTP (opcional)
app.post('/productos/eliminar', (req, res) => {
    const { id } = req.body;
    productos = productos.filter(p => p.id !== id);
    io.emit('updateProducts', productos);  
    res.redirect('/');
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
