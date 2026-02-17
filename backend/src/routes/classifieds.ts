import { Router } from 'express';
import { ClassifiedController } from '../controllers/ClassifiedController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', ClassifiedController.getAll);
router.get('/categories', ClassifiedController.getCategories);
router.get('/:id', ClassifiedController.getById);

// Authenticated routes
router.get('/user/mine', authenticate, ClassifiedController.getMyClassifieds);
router.post('/', authenticate, ClassifiedController.create);
router.put('/:id', authenticate, ClassifiedController.update);
router.delete('/:id', authenticate, ClassifiedController.delete);

export default router;
