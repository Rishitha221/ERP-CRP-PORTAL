import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page = '1', limit = '10' } = req.query;
    const pageStr = typeof page === 'string' ? page : '1';
    const limitStr = typeof limit === 'string' ? limit : '10';
    const pageNum = parseInt(pageStr);
    const limitNum = parseInt(limitStr);
    const skip = (pageNum - 1) * limitNum;
    const searchStr = typeof search === 'string' ? search : undefined;

    const where = searchStr ? {
      OR: [
        { name: { contains: searchStr } },
        { mobile: { contains: searchStr } },
        { email: { contains: searchStr } }
      ]
    } : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    res.json({ customers, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({ where: { id: parseInt(id) } });
    
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    
    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    if (!data.name || !data.mobile || !data.customerType) {
      res.status(400).json({ message: 'Name, mobile, and customerType are required' });
      return;
    }

    const customer = await prisma.customer.create({ data });
    res.status(201).json(customer);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data
    });
    
    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.customer.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
