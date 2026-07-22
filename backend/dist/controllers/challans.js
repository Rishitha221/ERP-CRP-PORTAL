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
exports.confirmChallan = exports.createChallan = exports.getChallanById = exports.getChallans = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getChallans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, page = '1', limit = '10' } = req.query;
        const pageStr = typeof page === 'string' ? page : '1';
        const limitStr = typeof limit === 'string' ? limit : '10';
        const pageNum = parseInt(pageStr);
        const limitNum = parseInt(limitStr);
        const skip = (pageNum - 1) * limitNum;
        const statusStr = typeof status === 'string' ? status : undefined;
        const where = statusStr ? { status: statusStr } : {};
        const [challans, total] = yield Promise.all([
            prisma_1.default.salesChallan.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: { select: { name: true, businessName: true } },
                    createdBy: { select: { name: true } }
                }
            }),
            prisma_1.default.salesChallan.count({ where })
        ]);
        res.json({ challans, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.getChallans = getChallans;
const getChallanById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const challan = yield prisma_1.default.salesChallan.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.getChallanById = getChallanById;
const createChallan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, items, status } = req.body;
        if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ message: 'customerId and items are required' });
            return;
        }
        const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
        const count = yield prisma_1.default.salesChallan.count();
        const challanNumber = `CH-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${(count + 1).toString().padStart(4, '0')}`;
        const productIds = items.map((i) => i.productId);
        const products = yield prisma_1.default.product.findMany({ where: { id: { in: productIds } } });
        const productsMap = new Map(products.map(p => [p.id, p]));
        if (status === 'CONFIRMED') {
            for (const item of items) {
                const p = productsMap.get(item.productId);
                if (!p || p.currentStock < item.quantity) {
                    res.status(400).json({ message: `Insufficient stock for product ${(p === null || p === void 0 ? void 0 : p.name) || item.productId}` });
                    return;
                }
            }
        }
        const challanItemsData = items.map((item) => {
            var _a;
            const p = productsMap.get(item.productId);
            return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice || ((_a = p === null || p === void 0 ? void 0 : p.unitPrice) !== null && _a !== void 0 ? _a : 0),
                snapshotData: p ? JSON.parse(JSON.stringify(p)) : {}
            };
        });
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const newChallan = yield tx.salesChallan.create({
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
                    const p = productsMap.get(item.productId);
                    yield tx.product.update({
                        where: { id: p.id },
                        data: { currentStock: p.currentStock - item.quantity }
                    });
                    yield tx.stockMovement.create({
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
        }));
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.createChallan = createChallan;
const confirmChallan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const challan = yield prisma_1.default.salesChallan.findUnique({
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
        const products = yield prisma_1.default.product.findMany({ where: { id: { in: productIds } } });
        const productsMap = new Map(products.map(p => [p.id, p]));
        for (const item of challan.items) {
            const p = productsMap.get(item.productId);
            if (!p || p.currentStock < item.quantity) {
                res.status(400).json({ message: `Insufficient stock for product ${(p === null || p === void 0 ? void 0 : p.name) || item.productId}` });
                return;
            }
        }
        const updatedChallan = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const updated = yield tx.salesChallan.update({
                where: { id: challan.id },
                data: { status: 'CONFIRMED' }
            });
            for (const item of challan.items) {
                const p = productsMap.get(item.productId);
                yield tx.product.update({
                    where: { id: p.id },
                    data: { currentStock: p.currentStock - item.quantity }
                });
                yield tx.stockMovement.create({
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
        }));
        res.json(updatedChallan);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.confirmChallan = confirmChallan;
