require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to E-commerce Admin API (Forsit Test)' });
});

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.json({ status: 'unhealthy', database: error.message });
  }
});

// Import and use route handlers
const salesRoutes = require('./routes/salesRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});