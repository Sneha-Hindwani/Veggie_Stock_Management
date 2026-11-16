const express = require('express');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'verysecret123';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing.' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const allProducts = await Product.find().lean();
      return res.json({ products: allProducts });
    }
    const products = await Product.find({ userId: req.user.userId }).lean();
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const payload = {
      userId: req.user.userId,
      name: req.body.name,
      sku: req.body.sku || `VEG-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      category: req.body.category,
      quantity: req.body.quantity || 0,
      safetyStock: req.body.safetyStock || 0,
      unitPrice: req.body.unitPrice || 0,
      shelfLifeDays: req.body.shelfLifeDays || 7,
      dateAdded: req.body.dateAdded ? new Date(req.body.dateAdded) : new Date(),
      salesHistory: req.body.salesHistory || []
    };

    const product = new Product(payload);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!req.user.isAdmin && product.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!req.user.isAdmin && product.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updates = ['name','sku','category','quantity','safetyStock','unitPrice','shelfLifeDays','dateAdded','salesHistory'];
    updates.forEach(key => {
      if (req.body[key] !== undefined) product[key] = req.body[key];
    });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!req.user.isAdmin && product.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await product.remove();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
