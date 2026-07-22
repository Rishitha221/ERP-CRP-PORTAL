import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

export const getInventoryLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where = productId ? { productId: parseInt(productId as string) } : {};

    const [logs, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { timestamp: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
          user: { select: { name: true } }
        }
      }),
      prisma.stockMovement.count({ where })
    ]);

    res.json({ logs, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const adjustStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity, type, reason } = req.body;
    
    if (!productId || !quantity || !type) {
      res.status(400).json({ message: 'productId, quantity, and type are required' });
      return;
    }

    if (quantity <= 0) {
      res.status(400).json({ message: 'Quantity must be positive' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const newStock = type === 'IN' ? product.currentStock + quantity : product.currentStock - quantity;

    if (newStock < 0) {
      res.status(400).json({ message: 'Insufficient stock. Stock cannot be negative.' });
      return;
    }

    const result = await prisma.$transaction([
      prisma.product.update({
        where: { id: product.id },
        data: { currentStock: newStock }
      }),
      prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantity,
          type,
          reason,
          userId: req.user.id
        }
      })
    ]);

    res.status(201).json({ message: 'Stock adjusted successfully', product: result[0], movement: result[1] });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
