import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

export const getChallans = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = status ? { status: status as string } : {};

    const [challans, total] = await Promise.all([
      prisma.salesChallan.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, businessName: true } },
          createdBy: { select: { name: true } }
        }
      }),
      prisma.salesChallan.count({ where })
    ]);

    res.json({ challans, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getChallanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const challan = await prisma.salesChallan.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true } }
          }
        }
      }
    });
    
    if (!challan) {
      res.status(404).json({ message: 'Challan not found' });
      return;
    }
    
    res.json(challan);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customerId, items, status } = req.body;
    
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'customerId and items are required' });
      return;
    }

    const totalQuantity = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
    const count = await prisma.salesChallan.count();
    const challanNumber = `CH-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${(count + 1).toString().padStart(4, '0')}`;

    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productsMap = new Map(products.map(p => [p.id, p]));

    if (status === 'CONFIRMED') {
      for (const item of items) {
        const p = productsMap.get(item.productId);
        if (!p || p.currentStock < item.quantity) {
          res.status(400).json({ message: `Insufficient stock for product ${p?.name || item.productId}` });
          return;
        }
      }
    }

    const challanItemsData = items.map((item: any) => {
      const p = productsMap.get(item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice || (p?.unitPrice ?? 0),
        snapshotData: p ? JSON.parse(JSON.stringify(p)) : {}
      };
    });

    const result = await prisma.$transaction(async (tx) => {
      const newChallan = await tx.salesChallan.create({
        data: {
          challanNumber,
          customerId,
          totalQuantity,
          status: status || 'DRAFT',
          createdById: req.user.id,
          items: {
            create: challanItemsData
          }
        },
        include: { items: true }
      });

      if (status === 'CONFIRMED') {
        for (const item of items) {
          const p = productsMap.get(item.productId)!;
          await tx.product.update({
            where: { id: p.id },
            data: { currentStock: p.currentStock - item.quantity }
          });
          
          await tx.stockMovement.create({
            data: {
              productId: p.id,
              quantity: item.quantity,
              type: 'OUT',
              reason: `Sales Challan ${challanNumber}`,
              userId: req.user.id
            }
          });
        }
      }

      return newChallan;
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const confirmChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const challan = await prisma.salesChallan.findUnique({
      where: { id: parseInt(id) },
      include: { items: true }
    });

    if (!challan) {
      res.status(404).json({ message: 'Challan not found' });
      return;
    }

    if (challan.status === 'CONFIRMED' || challan.status === 'CANCELLED') {
      res.status(400).json({ message: `Challan is already ${challan.status}` });
      return;
    }

    const productIds = challan.items.map(i => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productsMap = new Map(products.map(p => [p.id, p]));

    for (const item of challan.items) {
      const p = productsMap.get(item.productId);
      if (!p || p.currentStock < item.quantity) {
        res.status(400).json({ message: `Insufficient stock for product ${p?.name || item.productId}` });
        return;
      }
    }

    const updatedChallan = await prisma.$transaction(async (tx) => {
      const updated = await tx.salesChallan.update({
        where: { id: challan.id },
        data: { status: 'CONFIRMED' }
      });

      for (const item of challan.items) {
        const p = productsMap.get(item.productId)!;
        await tx.product.update({
          where: { id: p.id },
          data: { currentStock: p.currentStock - item.quantity }
        });
        
        await tx.stockMovement.create({
          data: {
            productId: p.id,
            quantity: item.quantity,
            type: 'OUT',
            reason: `Sales Challan ${challan.challanNumber}`,
            userId: req.user.id
          }
        });
      }

      return updated;
    });

    res.json(updatedChallan);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
