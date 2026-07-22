import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/products';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.get('/', authorize(['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS']), getProducts);
router.get('/:id', authorize(['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS']), getProductById);
router.post('/', authorize(['ADMIN', 'WAREHOUSE']), createProduct);
router.put('/:id', authorize(['ADMIN', 'WAREHOUSE']), updateProduct);
router.delete('/:id', authorize(['ADMIN', 'WAREHOUSE']), deleteProduct);

export default router;
