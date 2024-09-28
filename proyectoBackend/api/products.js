// src/api/products.js
const express = require('express');
const fs = require('fs');
const router = express.Router();

const productsFilePath = './src/data/products.json';

// Helper function to read products
const readProducts = () => {
    const data = fs.readFileSync(productsFilePath);
    return JSON.parse(data);
};

// Helper function to write products
const writeProducts = (data) => {
    fs.writeFileSync(productsFilePath, JSON.stringify(data, null, 2));
};

// GET /api/products
router.get('/', (req, res) => {
    const products = readProducts();
    const limit = parseInt(req.query.limit);
    res.json(limit ? products.slice(0, limit) : products);
});

// GET /api/products/:pid
router.get('/:pid', (req, res) => {
    const products = readProducts();
    const product = products.find(p => p.id === req.params.pid);
    res.json(product || { error: 'Product not found' });
});

// POST /api/products
router.post('/', (req, res) => {
    const products = readProducts();
    const newProduct = {
        id: `${products.length + 1}`, // Simple ID generation
        ...req.body,
        status: req.body.status !== undefined ? req.body.status : true,
        thumbnails: req.body.thumbnails || []
    };
    products.push(newProduct);
    writeProducts(products);
    res.status(201).json(newProduct);
});

// PUT /api/products/:pid
router.put('/:pid', (req, res) => {
    const products = readProducts();
    const index = products.findIndex(p => p.id === req.params.pid);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });

    products[index] = { ...products[index], ...req.body };
    writeProducts(products);
    res.json(products[index]);
});

// DELETE /api/products/:pid
router.delete('/:pid', (req, res) => {
    const products = readProducts();
    const newProducts = products.filter(p => p.id !== req.params.pid);
    if (newProducts.length === products.length) return res.status(404).json({ error: 'Product not found' });

    writeProducts(newProducts);
    res.status(204).send();
});

module.exports = router;
