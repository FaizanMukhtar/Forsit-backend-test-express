const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all inventory items
const getAllInventory = async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get inventory for a specific product
const getInventoryByProductId = async (req, res) => {
  try {
    const inventory = await prisma.inventory.findUnique({
      where: { productId: parseInt(req.params.productId) },
      include: {
        product: {
          include: {
            category: true
          }
        },
        history: true
      }
    });
    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update inventory quantity
const updateInventoryQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const inventory = await prisma.inventory.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    const updatedInventory = await prisma.$transaction(async (prisma) => {
      // Create inventory history
      await prisma.inventoryHistory.create({
        data: {
          inventoryId: inventory.id,
          previousQuantity: inventory.quantity,
          newQuantity: parseInt(quantity)
        }
      });

      // Update inventory
      return await prisma.inventory.update({
        where: { id: inventory.id },
        data: { quantity: parseInt(quantity) },
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      });
    });

    res.json(updatedInventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get low stock items
const getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        quantity: {
          lte: prisma.inventory.fields.lowStockThreshold
        }
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });
    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllInventory,
  getInventoryByProductId,
  updateInventoryQuantity,
  getLowStockItems
};