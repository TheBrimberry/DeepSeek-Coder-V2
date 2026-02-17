import { query } from '../config/database';
import { User } from '../types';

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  }

  static async create(data: {
    username: string;
    email: string;
    password_hash: string;
  }): Promise<User> {
    const result = await query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3) RETURNING *`,
      [data.username, data.email, data.password_hash]
    );
    return result.rows[0];
  }

  static async updateAgeVerification(id: string, verified: boolean): Promise<void> {
    await query('UPDATE users SET is_age_verified = $1 WHERE id = $2', [verified, id]);
  }

  static async updateRole(id: string, role: string): Promise<void> {
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
  }

  static async deactivate(id: string): Promise<void> {
    await query('UPDATE users SET is_active = false WHERE id = $1', [id]);
  }

  static async getFavorites(userId: string, limit: number, offset: number) {
    const result = await query(
      `SELECT v.*, uf.created_at as favorited_at
       FROM user_favorites uf
       JOIN videos v ON v.id = uf.video_id
       WHERE uf.user_id = $1 AND v.is_active = true
       ORDER BY uf.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    const countResult = await query(
      'SELECT COUNT(*) FROM user_favorites WHERE user_id = $1',
      [userId]
    );
    return { videos: result.rows, total: parseInt(countResult.rows[0].count, 10) };
  }

  static async addFavorite(userId: string, videoId: string): Promise<void> {
    await query(
      `INSERT INTO user_favorites (user_id, video_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, videoId]
    );
  }

  static async removeFavorite(userId: string, videoId: string): Promise<void> {
    await query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND video_id = $2',
      [userId, videoId]
    );
  }

  static async getHistory(userId: string, limit: number, offset: number) {
    const result = await query(
      `SELECT v.*, uh.watched_at, uh.watch_duration
       FROM user_history uh
       JOIN videos v ON v.id = uh.video_id
       WHERE uh.user_id = $1 AND v.is_active = true
       ORDER BY uh.watched_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    const countResult = await query(
      'SELECT COUNT(*) FROM user_history WHERE user_id = $1',
      [userId]
    );
    return { videos: result.rows, total: parseInt(countResult.rows[0].count, 10) };
  }

  static async addHistory(userId: string, videoId: string, watchDuration?: number): Promise<void> {
    await query(
      `INSERT INTO user_history (user_id, video_id, watch_duration)
       VALUES ($1, $2, $3)`,
      [userId, videoId, watchDuration || null]
    );
  }

  static async clearHistory(userId: string): Promise<void> {
    await query('DELETE FROM user_history WHERE user_id = $1', [userId]);
  }
}
