"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = __importDefault(require("./routes/auth"));
const customers_1 = __importDefault(require("./routes/customers"));
const products_1 = __importDefault(require("./routes/products"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const challans_1 = __importDefault(require("./routes/challans"));
const stats_1 = __importDefault(require("./routes/stats"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);
app.use('/api/auth', auth_1.default);
app.use('/api/customers', customers_1.default);
app.use('/api/products', products_1.default);
app.use('/api/inventory', inventory_1.default);
app.use('/api/challans', challans_1.default);
app.use('/api/stats', stats_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
