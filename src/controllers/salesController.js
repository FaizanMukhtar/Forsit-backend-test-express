const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all sales
const getAllSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get sales for a specific product
const getSalesByProductId = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      where: { productId: parseInt(req.params.productId) },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new sale
const createSale = async (req, res) => {
  try {
    const { productId, quantity, totalPrice, platform } = req.body;

    const sale = await prisma.$transaction(async (prisma) => {
      // Create the sale
      const newSale = await prisma.sale.create({
        data: {
          productId: parseInt(productId),
          quantity: parseInt(quantity),
          totalPrice: parseFloat(totalPrice),
          platform
        },
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      });

      // Update inventory
      const inventory = await prisma.inventory.findUnique({
        where: { productId: parseInt(productId) }
      });

      if (!inventory) {
        throw new Error('Inventory not found for product');
      }

      const newQuantity = inventory.quantity - parseInt(quantity);
      if (newQuantity < 0) {
        throw new Error('Insufficient inventory');
      }

      // Create inventory history
      await prisma.inventoryHistory.create({
        data: {
          inventoryId: inventory.id,
          previousQuantity: inventory.quantity,
          newQuantity
        }
      });

      // Update inventory
      await prisma.inventory.update({
        where: { id: inventory.id },
        data: { quantity: newQuantity }
      });

      return newSale;
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get sales statistics
const getSalesStatistics = async (req, res) => {
  try {
    const totalSales = await prisma.sale.aggregate({
      _sum: {
        totalPrice: true,
        quantity: true
      }
    });

    const salesByPlatform = await prisma.sale.groupBy({
      by: ['platform'],
      _sum: {
        totalPrice: true,
        quantity: true
      }
    });

    res.json({
      totalSales: totalSales._sum.totalPrice || 0,
      totalUnits: totalSales._sum.quantity || 0,
      salesByPlatform
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllSales,
  getSalesByProductId,
  createSale,
  getSalesStatistics
};