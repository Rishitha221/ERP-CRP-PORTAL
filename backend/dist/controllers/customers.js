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
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomerById = exports.getCustomers = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const [customers, total] = yield Promise.all([
            prisma_1.default.customer.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.default.customer.count({ where })
        ]);
        res.json({ customers, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.getCustomers = getCustomers;
const getCustomerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const customer = yield prisma_1.default.customer.findUnique({ where: { id: parseInt(id) } });
        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        res.json(customer);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.getCustomerById = getCustomerById;
const createCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        if (!data.name || !data.mobile || !data.customerType) {
            res.status(400).json({ message: 'Name, mobile, and customerType are required' });
            return;
        }
        const customer = yield prisma_1.default.customer.create({ data });
        res.status(201).json(customer);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.createCustomer = createCustomer;
const updateCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = req.body;
        const customer = yield prisma_1.default.customer.update({
            where: { id: parseInt(id) },
            data
        });
        res.json(customer);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.updateCustomer = updateCustomer;
const deleteCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.default.customer.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Customer deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.deleteCustomer = deleteCustomer;
