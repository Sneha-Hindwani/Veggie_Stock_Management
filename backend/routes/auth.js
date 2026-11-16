const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'verysecret123';

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });

  const existing = await User.findOne({ username: username.toLowerCase() });
  if (existing) return res.status(409).json({ message: 'Username already exists.' });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = new User({
    username: username.toLowerCase(),
    passwordHash
  });
  await user.save();

  const token = jwt.sign({ userId: user._id, username: user.username, isAdmin: false }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username: user.username, isAdmin: false });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });

  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: 'Invalid credentials.' });

  const token = jwt.sign({ userId: user._id, username: user.username, isAdmin: false }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username: user.username, isAdmin: false });
});

module.exports = router;
