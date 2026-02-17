import { Request, Response } from 'express';
import { ClassifiedModel, ClassifiedCategory } from '../models/ClassifiedModel';

export class ClassifiedController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const category = req.query.category as ClassifiedCategory | undefined;
      const location = req.query.location as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      const result = await ClassifiedModel.findAll(category, location, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch classifieds' });
    }
  }

  static async getCategories(_req: Request, res: Response): Promise<void> {
    res.json(ClassifiedModel.getCategories());
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const classified = await ClassifiedModel.findById(req.params.id);
      if (!classified) {
        res.status(404).json({ error: 'Classified not found' });
        return;
      }
      await ClassifiedModel.incrementViewCount(req.params.id);
      res.json(classified);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch classified' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const classified = await ClassifiedModel.create({
        user_id: req.user!.userId,
        title: req.body.title,
        body: req.body.body,
        category: req.body.category,
        location: req.body.location,
        age: req.body.age,
        contact_method: req.body.contact_method,
        expires_at: req.body.expires_at,
      });
      res.status(201).json(classified);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create classified' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const classified = await ClassifiedModel.update(
        req.params.id,
        req.user!.userId,
        req.body
      );
      if (!classified) {
        res.status(404).json({ error: 'Classified not found or not owned by you' });
        return;
      }
      res.json(classified);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update classified' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await ClassifiedModel.delete(req.params.id, req.user!.userId);
      if (!deleted) {
        res.status(404).json({ error: 'Classified not found or not owned by you' });
        return;
      }
      res.json({ message: 'Classified deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete classified' });
    }
  }

  static async getMyClassifieds(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const result = await ClassifiedModel.getByUser(req.user!.userId, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch your classifieds' });
    }
  }
}
