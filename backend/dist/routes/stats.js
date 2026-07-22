"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stats_1 = require("../controllers/stats");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, stats_1.getDashboardStats);
exports.default = router;
