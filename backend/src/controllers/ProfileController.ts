import { Request, Response } from 'express';
import { ProfileModel } from '../models/ProfileModel';

export class ProfileController {
  static async getMyProfile(req: Request, res: Response): Promise<void> {
    try {
      let profile = await ProfileModel.findByUserId(req.user!.userId);
      if (!profile) {
        profile = await ProfileModel.create(req.user!.userId, { display_name: '' });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  static async updateMyProfile(req: Request, res: Response): Promise<void> {
    try {
      // Ensure profile exists
      const existing = await ProfileModel.findByUserId(req.user!.userId);
      if (!existing) {
        await ProfileModel.create(req.user!.userId, req.body);
      }
      const profile = await ProfileModel.update(req.user!.userId, req.body);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const profile = await ProfileModel.findByUserId(req.params.userId);
      if (!profile || (!profile.is_public && req.user?.userId !== req.params.userId)) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      const response: Record<string, unknown> = { ...profile };

      // Check if requester follows this user
      if (req.user) {
        response.isFollowing = await ProfileModel.isFollowing(req.user.userId, req.params.userId);
      }

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  static async searchProfiles(req: Request, res: Response): Promise<void> {
    try {
      const term = req.query.q as string;
      if (!term) {
        res.status(400).json({ error: 'Search term required' });
        return;
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const result = await ProfileModel.search(term, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search profiles' });
    }
  }

  static async follow(req: Request, res: Response): Promise<void> {
    try {
      if (req.user!.userId === req.params.userId) {
        res.status(400).json({ error: 'Cannot follow yourself' });
        return;
      }
      await ProfileModel.follow(req.user!.userId, req.params.userId);
      res.json({ message: 'Followed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to follow user' });
    }
  }

  static async unfollow(req: Request, res: Response): Promise<void> {
    try {
      await ProfileModel.unfollow(req.user!.userId, req.params.userId);
      res.json({ message: 'Unfollowed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to unfollow user' });
    }
  }

  static async getFollowers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const followers = await ProfileModel.getFollowers(req.params.userId, page, limit);
      res.json(followers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch followers' });
    }
  }

  static async getFollowing(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const following = await ProfileModel.getFollowing(req.params.userId, page, limit);
      res.json(following);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch following' });
    }
  }

  // User video uploads
  static async uploadVideo(req: Request, res: Response): Promise<void> {
    try {
      const video = await ProfileModel.addVideo(req.user!.userId, {
        title: req.body.title,
        description: req.body.description,
        video_url: req.body.video_url,
        thumbnail_url: req.body.thumbnail_url,
        duration: req.body.duration,
        is_public: req.body.is_public,
      });
      res.status(201).json(video);
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload video' });
    }
  }

  static async getUserVideos(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const videos = await ProfileModel.getUserVideos(
        req.params.userId,
        req.user?.userId,
        page,
        limit
      );
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user videos' });
    }
  }

  static async deleteVideo(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await ProfileModel.deleteVideo(req.params.videoId, req.user!.userId);
      if (!deleted) {
        res.status(404).json({ error: 'Video not found or not owned by you' });
        return;
      }
      res.json({ message: 'Video deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete video' });
    }
  }
}
