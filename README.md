# E-commerce Admin API (For Forsit Test)

This is a back-end API for an e-commerce admin dashboard built with Node.js, Express, and Prisma. It provides detailed insights into sales, revenue, and inventory status, and allows for product management.

## Features

- **Sales Analytics**: Comprehensive sales analysis with daily, weekly, monthly, and annual reports
- **Inventory Management**: Track inventory levels, get low stock alerts, and view inventory history
- **Product Management**: Full CRUD operations for products with category management

## Setup Instructions

### Prerequisites

- Node.js 16 or higher
- MySQL server running locally
- npm (Node package manager)

### Installation

1. Clone this repository:
```bash
git clone https://github.com/FaizanMukhtar/Forsit-backend-test-express
cd Forsit-backend-test
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
DATABASE_URL="mysql://root:@localhost:3306/forsit_test_express_smfm"
PORT=3000
```

4. Initialize the database with Prisma:
```bash
npx prisma generate
npx prisma db push
```

5. Seed the database with demo data:
```bash
npm run seed
```

6. Run the application:
```bash
# For development with auto-reload:
npm run dev

# For production:
npm start
```

7. Access the API at: http://localhost:3000

## API Endpoints

### Products API

- `GET /api/products`: Get all products
- `GET /api/products/:id`: Get a specific product
- `POST /api/products`: Create a new product
- `PUT /api/products/:id`: Update product information
- `DELETE /api/products/:id`: Delete a product

### Inventory API

- `GET /api/inventory`: Get current inventory status for all products
- `GET /api/inventory/low-stock`: Get products with inventory below threshold
- `GET /api/inventory/product/:productId`: Get inventory for a specific product
- `PUT /api/inventory/:id`: Update inventory level

### Sales API

- `GET /api/sales`: Get all sales records
- `GET /api/sales/product/:productId`: Get sales for a specific product
- `POST /api/sales`: Create a new sale
- `GET /api/sales/statistics`: Get sales statistics

## Database Schema

The database consists of the following models:

### Category
```prisma
model Category {
  id          Int       @id @default(autoincrement())
  name        String    @unique @db.VarChar(100)
  description String?   @db.Text
  products    Product[]
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
}
```

### Product
```prisma
model Product {
  id          Int        @id @default(autoincrement())
  name        String     @db.VarChar(200)
  description String?    @db.Text
  price       Float
  categoryId  Int        @map("category_id")
  category    Category   @relation(fields: [categoryId], references: [id])
  inventory   Inventory?
  sales       Sale[]
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
}
```

### Inventory
```prisma
model Inventory {
  id                Int               @id @default(autoincrement())
  productId         Int               @unique @map("product_id")
  product           Product           @relation(fields: [productId], references: [id])
  quantity          Int               @default(0)
  lowStockThreshold Int               @default(10) @map("low_stock_threshold")
  history           InventoryHistory[]
  lastUpdated       DateTime          @updatedAt @map("last_updated")
}
```

### Inventory History
```prisma
model InventoryHistory {
  id              Int       @id @default(autoincrement())
  inventoryId     Int       @map("inventory_id")
  inventory       Inventory @relation(fields: [inventoryId], references: [id])
  previousQuantity Int      @map("previous_quantity")
  newQuantity     Int       @map("new_quantity")
  changeDate      DateTime  @default(now()) @map("change_date")
}
```

### Sale
```prisma
model Sale {
  id         Int      @id @default(autoincrement())
  productId  Int      @map("product_id")
  product    Product  @relation(fields: [productId], references: [id])
  quantity   Int
  totalPrice Float    @map("total_price")
  platform   String?  @db.VarChar(50)
  saleDate   DateTime @default(now()) @map("sale_date")
}
```

## Development

### Project Structure
```
src/
├── controllers/     # Business logic
├── routes/         # Route definitions
├── seeders/        # Database seeding scripts
└── index.js        # Application entry point
```

### Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with auto-reload
- `npm run seed`: Seed the database with demo data

### Database Management

To view and manage your database using Prisma Studio:
```bash
npx prisma studio
```

## Error Handling

The API uses a consistent error response format:
```json
{
  "error": "Error message description"
}
