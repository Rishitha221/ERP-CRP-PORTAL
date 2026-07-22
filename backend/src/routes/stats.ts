import { Router } from 'express';
import { getDashboardStats } from '../controllers/stats';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, getDashboardStats);

export default router;
