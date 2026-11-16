require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/veggieTrackDB';
const JWT_SECRET = process.env.JWT_SECRET || 'verysecret123';

console.log('JWT_SECRET:', JWT_SECRET);
console.log('MONGO_URI:', MONGO_URI);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

function getApiDocs(port) {
  return {
    message: 'VeggieTrack backend is running',
    routes: [
      { method: 'GET', path: '/api', access: 'public', note: 'API index' },
      { method: 'GET', path: '/api/routes', access: 'public', note: 'All API routes' },
      { method: 'POST', path: '/api/auth/register', access: 'public', note: 'Register user' },
      { method: 'POST', path: '/api/auth/login', access: 'public', note: 'Login user' },
      { method: 'GET', path: '/api/products', access: 'jwt', note: 'List products' },
      { method: 'POST', path: '/api/products', access: 'jwt', note: 'Create product' },
      { method: 'GET', path: '/api/products/:id', access: 'jwt', note: 'Get one product' },
      { method: 'PUT', path: '/api/products/:id', access: 'jwt', note: 'Update product' },
      { method: 'DELETE', path: '/api/products/:id', access: 'jwt', note: 'Delete product' }
    ]
  };
}

app.get('/', (req, res) => {
  const port = process.env.PORT || 5000;
  res.json(getApiDocs(port));
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend is running on this server: http://localhost:${PORT}`);
});
