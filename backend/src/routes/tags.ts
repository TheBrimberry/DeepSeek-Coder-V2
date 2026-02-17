import { Router } from 'express';
import { TagController } from '../controllers/TagController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', TagController.getAll);
router.get('/popular', TagController.getPopular);
router.get('/search', TagController.search);

// Admin routes
router.post('/', authenticate, requireRole('admin'), TagController.create);
router.delete('/:id', authenticate, requireRole('admin'), TagController.delete);

export default router;
