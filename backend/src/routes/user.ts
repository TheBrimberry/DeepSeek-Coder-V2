import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { UserModel } from '../models/UserModel';

const router = Router();

// All user routes require auth
router.use(authenticate);

// Favorites
router.get('/favorites', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    const result = await UserModel.getFavorites(req.user!.userId, limit, offset);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Watch history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    const result = await UserModel.getHistory(req.user!.userId, limit, offset);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.delete('/history', async (req: Request, res: Response) => {
  try {
    await UserModel.clearHistory(req.user!.userId);
    res.json({ message: 'History cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

export default router;
