const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        inventory: true
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single product
const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true,
        inventory: true
      }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, categoryId } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId: parseInt(categoryId)
      },
      include: {
        category: true
      }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, categoryId } = req.body;
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId: parseInt(categoryId)
      },
      include: {
        category: true
      }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
}; 