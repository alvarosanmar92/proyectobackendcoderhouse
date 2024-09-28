// src/api/carts.js
const express = require('express');
const fs = require('fs');
const router = express.Router();

const cartsFilePath = './src/data/carts.json';

// Helper function to read carts
const readCarts = () => {
    const data = fs.readFileSync(cartsFilePath);
    return JSON.parse(data);
};

// Helper function to write carts
const writeCarts = (data) => {
    fs.writeFileSync(cartsFilePath, JSON.stringify(data, null, 2));
};

// GET /api/carts/:cid
router.get('/:cid', (req, res) => {
    const carts = readCarts();
    const cart = carts.find(c => c.id === req.params.cid);
    res.json(cart || { error: 'Cart not found' });
});

// POST /api/carts
router.post('/', (req, res) => {
    const carts = readCarts();
    const newCart = {
        id: `${carts.length + 1}`, // Simple ID generation
        products: []
    };
    carts.push(newCart);
    writeCarts(carts);
    res.status(201).json(newCart);
});

// POST /api/carts/:cid/product/:pid
router.post('/:cid/product/:pid', (req, res) => {
    const carts = readCarts();
    const cart = carts.find(c => c.id === req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;

    const existingProduct = cart.products.find(p => p.id === productId);
    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        cart.products.push({ id: productId, quantity });
    }
    
    writeCarts(carts);
    res.json(cart);
});

module.exports = router;
