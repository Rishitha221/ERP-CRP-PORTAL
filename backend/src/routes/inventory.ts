import { Router } from 'express';
import { getInventoryLogs, adjustStock } from '../controllers/inventory';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.get('/logs', authorize(['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS']), getInventoryLogs);
router.post('/adjust', authorize(['ADMIN', 'WAREHOUSE']), adjustStock);

export default router;
