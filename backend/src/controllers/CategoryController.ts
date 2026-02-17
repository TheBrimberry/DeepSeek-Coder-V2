import { Request, Response } from 'express';
import { CategoryModel } from '../models/CategoryModel';

export class CategoryController {
  static async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const categories = await CategoryModel.findAll();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  static async getBySlug(req: Request, res: Response): Promise<void> {
    try {
      const category = await CategoryModel.findBySlug(req.params.slug);
      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      const children = await CategoryModel.getChildren(category.id);
      res.json({ ...category, children });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const category = await CategoryModel.create(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const category = await CategoryModel.update(req.params.id, req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update category' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      await CategoryModel.delete(req.params.id);
      res.json({ message: 'Category deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
}
