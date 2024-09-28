// src/server.js
const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json());

const productsRouter = require('../api/products');
const cartsRouter = require('../api/carts');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
