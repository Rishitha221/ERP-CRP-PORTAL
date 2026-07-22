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
exports.setupAdmin = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        const user = yield prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'supersecretjwtkeyforerp2026', { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.login = login;
const setupAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const count = yield prisma_1.default.user.count();
        if (count > 0) {
            res.status(400).json({ message: 'Admin already setup' });
            return;
        }
        const { name, email, password } = req.body;
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield prisma_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'ADMIN'
            }
        });
        res.status(201).json({ message: 'Admin created successfully', userId: user.id });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.setupAdmin = setupAdmin;
