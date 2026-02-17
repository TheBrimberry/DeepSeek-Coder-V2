import { query } from '../config/database';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  location: string | null;
  website: string | null;
  gender: string | null;
  orientation: string | null;
  age: number | null;
  is_public: boolean;
  follower_count: number;
  following_count: number;
  video_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserVideo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration: number | null;
  is_public: boolean;
  view_count: number;
  like_count: number;
  created_at: Date;
}

export class ProfileModel {
  static async findByUserId(userId: string): Promise<Profile | null> {
    const result = await query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<Profile | null> {
    const result = await query('SELECT * FROM profiles WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async search(term: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const countResult = await query(
      `SELECT COUNT(*) FROM profiles WHERE is_public = true AND (display_name ILIKE $1 OR bio ILIKE $1)`,
      [`%${term}%`]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await query(
      `SELECT p.*, u.username FROM profiles p
       JOIN users u ON u.id = p.user_id
       WHERE p.is_public = true AND (p.display_name ILIKE $1 OR p.bio ILIKE $1)
       ORDER BY p.follower_count DESC
       LIMIT $2 OFFSET $3`,
      [`%${term}%`, limit, offset]
    );
    const totalPages = Math.ceil(total / limit);
    return {
      data: result.rows,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  static async create(userId: string, data: Partial<Profile>): Promise<Profile> {
    const result = await query(
      `INSERT INTO profiles (user_id, display_name, bio, avatar_url, cover_url, location, website, gender, orientation, age, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        userId, data.display_name || '', data.bio || null, data.avatar_url || null,
        data.cover_url || null, data.location || null, data.website || null,
        data.gender || null, data.orientation || null, data.age || null,
        data.is_public !== false,
      ]
    );
    return result.rows[0];
  }

  static async update(userId: string, data: Partial<Profile>): Promise<Profile | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const allowed = ['display_name', 'bio', 'avatar_url', 'cover_url', 'location', 'website', 'gender', 'orientation', 'age', 'is_public'];
    for (const key of allowed) {
      if (data[key as keyof Profile] !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(data[key as keyof Profile]);
        idx++;
      }
    }
    if (fields.length === 0) return this.findByUserId(userId);

    values.push(userId);
    const result = await query(
      `UPDATE profiles SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  // Following system
  static async follow(followerId: string, followingId: string): Promise<void> {
    await query(
      `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [followerId, followingId]
    );
    await query('UPDATE profiles SET follower_count = follower_count + 1 WHERE user_id = $1', [followingId]);
    await query('UPDATE profiles SET following_count = following_count + 1 WHERE user_id = $1', [followerId]);
  }

  static async unfollow(followerId: string, followingId: string): Promise<void> {
    const result = await query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );
    if ((result.rowCount ?? 0) > 0) {
      await query('UPDATE profiles SET follower_count = GREATEST(0, follower_count - 1) WHERE user_id = $1', [followingId]);
      await query('UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE user_id = $1', [followerId]);
    }
  }

  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const result = await query(
      'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );
    return result.rows.length > 0;
  }

  static async getFollowers(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT p.*, u.username FROM follows f
       JOIN profiles p ON p.user_id = f.follower_id
       JOIN users u ON u.id = f.follower_id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async getFollowing(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT p.*, u.username FROM follows f
       JOIN profiles p ON p.user_id = f.following_id
       JOIN users u ON u.id = f.following_id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  // User-uploaded videos
  static async addVideo(userId: string, data: Partial<UserVideo>): Promise<UserVideo> {
    const result = await query(
      `INSERT INTO user_videos (user_id, title, description, video_url, thumbnail_url, duration, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, data.title, data.description || null, data.video_url, data.thumbnail_url || null, data.duration || null, data.is_public !== false]
    );
    await query('UPDATE profiles SET video_count = video_count + 1 WHERE user_id = $1', [userId]);
    return result.rows[0];
  }

  static async getUserVideos(userId: string, viewerId?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const isOwner = userId === viewerId;
    const publicFilter = isOwner ? '' : 'AND uv.is_public = true';

    const result = await query(
      `SELECT uv.* FROM user_videos uv
       WHERE uv.user_id = $1 ${publicFilter}
       ORDER BY uv.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async deleteVideo(videoId: string, userId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM user_videos WHERE id = $1 AND user_id = $2',
      [videoId, userId]
    );
    if ((result.rowCount ?? 0) > 0) {
      await query('UPDATE profiles SET video_count = GREATEST(0, video_count - 1) WHERE user_id = $1', [userId]);
      return true;
    }
    return false;
  }
}
