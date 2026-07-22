import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const totalCustomers = await prisma.customer.count();
  const totalProducts = await prisma.product.count();
  const pendingChallans = await prisma.salesChallan.count({
    where: { status: 'DRAFT' }
  });
  
  const products = await prisma.product.findMany({
    select: { currentStock: true, minStock: true }
  });
  
  const lowStockItems = products.filter(p => p.currentStock <= (p.minStock || 5)).length;
  console.log({totalCustomers, totalProducts, pendingChallans, lowStockItems});
}
main().catch(console.error).finally(() => prisma.$disconnect());
