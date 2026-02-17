import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { AggregationService } from '../services/AggregationService';
import { SourceModel } from '../models/SourceModel';
import { UserModel } from '../models/UserModel';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireRole('admin'));

// Source management
router.get('/sources', async (_req: Request, res: Response) => {
  try {
    const sources = await SourceModel.findAll(false);
    res.json(sources);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

router.post('/sources', async (req: Request, res: Response) => {
  try {
    const source = await SourceModel.create(req.body);
    res.status(201).json(source);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create source' });
  }
});

router.put('/sources/:id', async (req: Request, res: Response) => {
  try {
    const source = await SourceModel.update(req.params.id, req.body);
    res.json(source);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update source' });
  }
});

router.delete('/sources/:id', async (req: Request, res: Response) => {
  try {
    await SourceModel.delete(req.params.id);
    res.json({ message: 'Source deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete source' });
  }
});

// Manual aggregation trigger
router.post('/aggregate', async (_req: Request, res: Response) => {
  try {
    const results = await AggregationService.aggregateAll();
    res.json({ message: 'Aggregation complete', results });
  } catch (error) {
    res.status(500).json({ error: 'Aggregation failed' });
  }
});

router.post('/aggregate/:sourceId', async (req: Request, res: Response) => {
  try {
    const imported = await AggregationService.aggregateFromSource(req.params.sourceId);
    res.json({ message: 'Aggregation complete', imported });
  } catch (error) {
    res.status(500).json({ error: 'Aggregation failed' });
  }
});

// User management
router.put('/users/:id/role', async (req: Request, res: Response) => {
  try {
    await UserModel.updateRole(req.params.id, req.body.role);
    res.json({ message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

router.put('/users/:id/deactivate', async (req: Request, res: Response) => {
  try {
    await UserModel.deactivate(req.params.id);
    res.json({ message: 'User deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

export default router;
