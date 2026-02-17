import { Router } from 'express';
import { VideoController } from '../controllers/VideoController';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', optionalAuth, VideoController.search);
router.get('/featured', VideoController.getFeatured);
router.get('/trending', VideoController.getTrending);
router.get('/slug/:slug', optionalAuth, VideoController.getBySlug);
router.get('/:id', optionalAuth, VideoController.getById);
router.get('/:id/related', VideoController.getRelated);

// Authenticated routes
router.post('/:id/like', authenticate, VideoController.like);
router.post('/:id/favorite', authenticate, VideoController.favorite);
router.delete('/:id/favorite', authenticate, VideoController.unfavorite);

// Admin routes
router.post('/', authenticate, requireRole('admin', 'moderator'), VideoController.create);
router.put('/:id', authenticate, requireRole('admin', 'moderator'), VideoController.update);
router.delete('/:id', authenticate, requireRole('admin'), VideoController.delete);

export default router;
