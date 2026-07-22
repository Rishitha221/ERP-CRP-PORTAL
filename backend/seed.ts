import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.salesChallanItem.deleteMany();
  await prisma.salesChallan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin User
  const hashedPassword = await bcrypt.hash('password', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  // Create Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'John Smith',
        mobile: '+1 234 567 8900',
        email: 'john@smithindustries.com',
        businessName: 'Smith Industries',
        gst: 'GSTIN12345678',
        customerType: 'WHOLESALE',
        address: '123 Industrial Parkway, Suite 100',
        status: 'ACTIVE',
        notes: 'Premium client, fast payer'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Sarah Johnson',
        mobile: '+1 987 654 3210',
        email: 'sarah@retailhub.com',
        businessName: 'Retail Hub',
        customerType: 'RETAIL',
        address: '456 Main St, Downtown',
        status: 'ACTIVE'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Michael Davis',
        mobile: '+1 555 123 4567',
        businessName: 'Davis Distributors',
        customerType: 'DISTRIBUTOR',
        status: 'LEAD',
        followUpDate: new Date(new Date().setDate(new Date().getDate() + 5))
      }
    })
  ]);

  // Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Ultra HD Monitor 27"',
        sku: 'MON-4K-027',
        category: 'Electronics',
        unitPrice: 299.99,
        currentStock: 45,
        minStock: 10,
        location: 'Aisle 4, Rack A'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Ergonomic Office Chair',
        sku: 'FURN-CHR-001',
        category: 'Furniture',
        unitPrice: 199.50,
        currentStock: 8,
        minStock: 15,
        location: 'Aisle 1, Rack B'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Mechanical Keyboard',
        sku: 'PER-KEY-002',
        category: 'Electronics',
        unitPrice: 89.99,
        currentStock: 120,
        minStock: 30,
        location: 'Aisle 4, Rack C'
      }
    })
  ]);

  // Create Stock Movements
  await prisma.stockMovement.create({
    data: {
      productId: products[0].id,
      quantity: 50,
      type: 'IN',
      reason: 'Initial delivery from supplier',
      userId: admin.id
    }
  });

  // Create Sales Challans
  await prisma.salesChallan.create({
    data: {
      challanNumber: 'CHL-' + Date.now().toString().slice(-6),
      customerId: customers[0].id,
      totalQuantity: 2,
      status: 'CONFIRMED',
      createdById: admin.id,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 2,
            unitPrice: products[0].unitPrice
          }
        ]
      }
    }
  });

  await prisma.salesChallan.create({
    data: {
      challanNumber: 'CHL-' + (Date.now() + 1).toString().slice(-6),
      customerId: customers[1].id,
      totalQuantity: 5,
      status: 'DRAFT',
      createdById: admin.id,
      items: {
        create: [
          {
            productId: products[1].id,
            quantity: 5,
            unitPrice: products[1].unitPrice
          }
        ]
      }
    }
  });

  console.log('Database seeded successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
