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
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                { sku: { contains: searchStr } }
            ]
        } : {};
        const [products, total] = yield Promise.all([
            prisma_1.default.product.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.default.product.count({ where })
        ]);
        res.json({ products, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.getProducts = getProducts;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield prisma_1.default.product.findUnique({ where: { id: parseInt(id) } });
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.getProductById = getProductById;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        if (!data.name || !data.sku || data.unitPrice === undefined) {
            res.status(400).json({ message: 'Name, sku, and unitPrice are required' });
            return;
        }
        const product = yield prisma_1.default.product.create({ data });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = req.body;
        const product = yield prisma_1.default.product.update({
            where: { id: parseInt(id) },
            data
        });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.default.product.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.deleteProduct = deleteProduct;
