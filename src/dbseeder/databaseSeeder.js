const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Sample data
const categories = [
  { name: "Electronics", description: "Electronic devices and accessories" },
  { name: "Clothing", description: "Apparel and fashion items" },
  { name: "Home & Kitchen", description: "Items for home and kitchen use" }
];

const products = [
  { name: "Smartphone X", description: "Latest smartphone with advanced features", price: 799.99, categoryName: "Electronics" },
  { name: "Laptop Pro", description: "High-performance laptop for professionals", price: 1299.99, categoryName: "Electronics" },
  { name: "Wireless Earbuds", description: "Noise-cancelling wireless earbuds", price: 129.99, categoryName: "Electronics" },
  { name: "Smart Watch", description: "Fitness and health tracking smartwatch", price: 249.99, categoryName: "Electronics" },
  { name: "Bluetooth Speaker", description: "Portable Bluetooth speaker with deep bass", price: 89.99, categoryName: "Electronics" },

  { name: "Men's T-Shirt", description: "Comfortable cotton t-shirt", price: 19.99, categoryName: "Clothing" },
  { name: "Women's Jeans", description: "Stylish and durable jeans", price: 49.99, categoryName: "Clothing" },
  { name: "Running Shoes", description: "Lightweight shoes for running and athletics", price: 79.99, categoryName: "Clothing" },
  { name: "Winter Jacket", description: "Warm jacket for cold weather", price: 129.99, categoryName: "Clothing" },
  { name: "Summer Dress", description: "Flowy dress for summer days", price: 39.99, categoryName: "Clothing" },

  { name: "Coffee Maker", description: "Programmable coffee maker", price: 69.99, categoryName: "Home & Kitchen" },
  { name: "Blender", description: "High-speed blender for smoothies", price: 59.99, categoryName: "Home & Kitchen" },
  { name: "Toaster", description: "2-slice toaster with multiple settings", price: 29.99, categoryName: "Home & Kitchen" },
  { name: "Bedding Set", description: "Soft cotton bedding set", price: 79.99, categoryName: "Home & Kitchen" },
  { name: "Cutting Board", description: "Durable bamboo cutting board", price: 24.99, categoryName: "Home & Kitchen" }
];

const platforms = ["Amazon", "Daraz", "Direct Website", "OLX"];

async function seedDatabase() {
  try {
    const existingCategories = await prisma.category.count();
    if (existingCategories > 0) {
      console.log("Database already contains data. Skipping seeding.");
      return;
    }

    console.log("Seeding database...");

    const dbCategories = await Promise.all(
      categories.map(category => 
        prisma.category.create({
          data: category
        })
      )
    );
    console.log("Categories created");

    const dbProducts = await Promise.all(
      products.map(async product => {
        const category = dbCategories.find(c => c.name === product.categoryName);
        const { categoryName, ...productData } = product;
        
        return prisma.product.create({
          data: {
            ...productData,
            categoryId: category.id,
            inventory: {
              create: {
                quantity: Math.floor(Math.random() * 96) + 5,
                lowStockThreshold: Math.floor(Math.random() * 16) + 5
              }
            }
          }
        });
      })
    );
    console.log("Products and inventory created");

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - 1);

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const numSales = Math.floor(Math.random() * 16);
      
      for (let i = 0; i < numSales; i++) {
        const product = dbProducts[Math.floor(Math.random() * dbProducts.length)];
        const quantity = Math.floor(Math.random() * 5) + 1;
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const discount = Math.random() * 0.2;
        const unitPrice = product.price * (1 - discount);
        const totalPrice = unitPrice * quantity;

        const saleTime = new Date(currentDate);
        saleTime.setHours(Math.floor(Math.random() * 24));
        saleTime.setMinutes(Math.floor(Math.random() * 60));
        saleTime.setSeconds(Math.floor(Math.random() * 60));

        await prisma.sale.create({
          data: {
            productId: product.id,
            quantity,
            totalPrice: Number(totalPrice.toFixed(2)),
            saleDate: saleTime,
            platform
          }
        });

        const inventory = await prisma.inventory.findUnique({
          where: { productId: product.id }
        });

        await prisma.inventory.update({
          where: { id: inventory.id },
          data: {
            quantity: inventory.quantity - quantity
          }
        });

        await prisma.inventoryHistory.create({
          data: {
            inventoryId: inventory.id,
            previousQuantity: inventory.quantity,
            newQuantity: inventory.quantity - quantity
          }
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
    console.log("Sales created");

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase()
  .then(() => {
    console.log("Seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });