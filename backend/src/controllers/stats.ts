import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalCustomers = await prisma.customer.count();
    const totalProducts = await prisma.product.count();
    const pendingChallans = await prisma.salesChallan.count({
      where: { status: 'DRAFT' }
    });
    
    // Check low stock items (currentStock <= minStock)
    const products = await prisma.product.findMany({
      select: { currentStock: true, minStock: true }
    });
    
    const lowStockItems = products.filter(p => p.currentStock <= (p.minStock || 5)).length;

    res.json({
      totalCustomers,
      totalProducts,
      pendingChallans,
      lowStockItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error });
  }
};
