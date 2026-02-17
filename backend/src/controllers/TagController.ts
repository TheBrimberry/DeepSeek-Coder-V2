import { Request, Response } from 'express';
import { TagModel } from '../models/TagModel';

export class TagController {
  static async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const tags = await TagModel.findAll();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tags' });
    }
  }

  static async getPopular(_req: Request, res: Response): Promise<void> {
    try {
      const tags = await TagModel.getPopular();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch popular tags' });
    }
  }

  static async search(req: Request, res: Response): Promise<void> {
    try {
      const term = req.query.q as string;
      if (!term) {
        res.status(400).json({ error: 'Search term required' });
        return;
      }
      const tags = await TagModel.search(term);
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search tags' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const tag = await TagModel.create(req.body);
      res.status(201).json(tag);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create tag' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      await TagModel.delete(req.params.id);
      res.json({ message: 'Tag deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete tag' });
    }
  }
}
