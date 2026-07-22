import { Router } from 'express';
import { getChallans, getChallanById, createChallan, confirmChallan } from '../controllers/challans';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.get('/', authorize(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), getChallans);
router.get('/:id', authorize(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), getChallanById);
router.post('/', authorize(['ADMIN', 'SALES']), createChallan);
router.put('/:id/confirm', authorize(['ADMIN', 'SALES', 'WAREHOUSE']), confirmChallan);

export default router;
