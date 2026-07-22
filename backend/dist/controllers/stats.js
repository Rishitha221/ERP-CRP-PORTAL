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
exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalCustomers = yield prisma_1.default.customer.count();
        const totalProducts = yield prisma_1.default.product.count();
        const pendingChallans = yield prisma_1.default.salesChallan.count({
            where: { status: 'DRAFT' }
        });
        // Check low stock items (currentStock <= minStock)
        const products = yield prisma_1.default.product.findMany({
            select: { currentStock: true, minStock: true }
        });
        const lowStockItems = products.filter(p => p.currentStock <= (p.minStock || 5)).length;
        res.json({
            totalCustomers,
            totalProducts,
            pendingChallans,
            lowStockItems
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error });
    }
});
exports.getDashboardStats = getDashboardStats;
