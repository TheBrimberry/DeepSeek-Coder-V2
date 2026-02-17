import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// Authenticated user's own profile
router.get('/me', authenticate, ProfileController.getMyProfile);
router.put('/me', authenticate, ProfileController.updateMyProfile);

// Search
router.get('/search', ProfileController.searchProfiles);

// User video management
router.post('/me/videos', authenticate, ProfileController.uploadVideo);
router.delete('/me/videos/:videoId', authenticate, ProfileController.deleteVideo);

// Public profile viewing
router.get('/:userId', optionalAuth, ProfileController.getProfile);
router.get('/:userId/videos', optionalAuth, ProfileController.getUserVideos);
router.get('/:userId/followers', ProfileController.getFollowers);
router.get('/:userId/following', ProfileController.getFollowing);

// Follow/unfollow
router.post('/:userId/follow', authenticate, ProfileController.follow);
router.delete('/:userId/follow', authenticate, ProfileController.unfollow);

export default router;
