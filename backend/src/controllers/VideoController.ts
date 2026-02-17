import { Request, Response } from 'express';
import { VideoModel } from '../models/VideoModel';
import { UserModel } from '../models/UserModel';
import { cacheGet, cacheSet } from '../config/redis';
import { SearchParams } from '../types';

export class VideoController {
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const params: SearchParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: Math.min(parseInt(req.query.limit as string) || 20, 100),
        sortBy: (req.query.sortBy as string) || 'created_at',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        query: req.query.q as string,
        categoryId: req.query.categoryId as string,
        tagId: req.query.tagId as string,
        sourceId: req.query.sourceId as string,
        minDuration: req.query.minDuration ? parseInt(req.query.minDuration as string) : undefined,
        maxDuration: req.query.maxDuration ? parseInt(req.query.maxDuration as string) : undefined,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
      };

      const cacheKey = `videos:search:${JSON.stringify(params)}`;
      const cached = await cacheGet(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const result = await VideoModel.search(params);
      await cacheSet(cacheKey, result, 120);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Search failed' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const video = await VideoModel.findById(req.params.id);
      if (!video) {
        res.status(404).json({ error: 'Video not found' });
        return;
      }

      const [categories, tags] = await Promise.all([
        VideoModel.getVideoCategories(video.id),
        VideoModel.getVideoTags(video.id),
      ]);

      await VideoModel.incrementViewCount(video.id);

      // Track history if user is authenticated
      if (req.user) {
        await UserModel.addHistory(req.user.userId, video.id);
      }

      res.json({ ...video, categories, tags });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch video' });
    }
  }

  static async getBySlug(req: Request, res: Response): Promise<void> {
    try {
      const video = await VideoModel.findBySlug(req.params.slug);
      if (!video) {
        res.status(404).json({ error: 'Video not found' });
        return;
      }

      const [categories, tags] = await Promise.all([
        VideoModel.getVideoCategories(video.id),
        VideoModel.getVideoTags(video.id),
      ]);

      await VideoModel.incrementViewCount(video.id);

      res.json({ ...video, categories, tags });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch video' });
    }
  }

  static async getFeatured(_req: Request, res: Response): Promise<void> {
    try {
      const cacheKey = 'videos:featured';
      const cached = await cacheGet(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const videos = await VideoModel.getFeatured();
      await cacheSet(cacheKey, videos, 300);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch featured videos' });
    }
  }

  static async getTrending(_req: Request, res: Response): Promise<void> {
    try {
      const cacheKey = 'videos:trending';
      const cached = await cacheGet(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const videos = await VideoModel.getTrending();
      await cacheSet(cacheKey, videos, 180);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch trending videos' });
    }
  }

  static async getRelated(req: Request, res: Response): Promise<void> {
    try {
      const videos = await VideoModel.getRelated(req.params.id);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch related videos' });
    }
  }

  static async like(req: Request, res: Response): Promise<void> {
    try {
      await VideoModel.toggleLike(req.params.id, true);
      res.json({ message: 'Video liked' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to like video' });
    }
  }

  static async favorite(req: Request, res: Response): Promise<void> {
    try {
      await UserModel.addFavorite(req.user!.userId, req.params.id);
      res.json({ message: 'Video added to favorites' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add to favorites' });
    }
  }

  static async unfavorite(req: Request, res: Response): Promise<void> {
    try {
      await UserModel.removeFavorite(req.user!.userId, req.params.id);
      res.json({ message: 'Video removed from favorites' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove from favorites' });
    }
  }

  // Admin endpoints
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const video = await VideoModel.create(req.body);
      res.status(201).json(video);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create video' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const video = await VideoModel.update(req.params.id, req.body);
      if (!video) {
        res.status(404).json({ error: 'Video not found' });
        return;
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update video' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      await VideoModel.delete(req.params.id);
      res.json({ message: 'Video deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete video' });
    }
  }
}
