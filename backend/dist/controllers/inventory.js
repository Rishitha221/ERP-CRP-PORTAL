"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustStock = exports.getInventoryLogs = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getInventoryLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = productId ? { productId: parseInt(productId) } : {};
        const [logs, total] = yield Promise.all([
            prisma_1.default.stockMovement.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { timestamp: 'desc' },
                include: {
                    product: { select: { name: true, sku: true } },
                    user: { select: { name: true } }
                }
            }),
            prisma_1.default.stockMovement.count({ where })
        ]);
        res.json({ logs, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.getInventoryLogs = getInventoryLogs;
const adjustStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const product = yield prisma_1.default.product.findUnique({ where: { id: parseInt(productId) } });
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        const newStock = type === 'IN' ? product.currentStock + quantity : product.currentStock - quantity;
        if (newStock < 0) {
            res.status(400).json({ message: 'Insufficient stock. Stock cannot be negative.' });
            return;
        }
        const result = yield prisma_1.default.$transaction([
            prisma_1.default.product.update({
                where: { id: product.id },
                data: { currentStock: newStock }
            }),
            prisma_1.default.stockMovement.create({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.adjustStock = adjustStock;
