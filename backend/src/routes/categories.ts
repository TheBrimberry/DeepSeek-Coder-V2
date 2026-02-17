import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', CategoryController.getAll);
router.get('/:slug', CategoryController.getBySlug);

// Admin routes
router.post('/', authenticate, requireRole('admin'), CategoryController.create);
router.put('/:id', authenticate, requireRole('admin'), CategoryController.update);
router.delete('/:id', authenticate, requireRole('admin'), CategoryController.delete);

export default router;
