import { query } from '../config/database';
import { Tag } from '../types';

export class TagModel {
  static async findAll(limit = 100): Promise<Tag[]> {
    const result = await query(
      'SELECT * FROM tags ORDER BY video_count DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  static async findById(id: string): Promise<Tag | null> {
    const result = await query('SELECT * FROM tags WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findBySlug(slug: string): Promise<Tag | null> {
    const result = await query('SELECT * FROM tags WHERE slug = $1', [slug]);
    return result.rows[0] || null;
  }

  static async search(term: string, limit = 20): Promise<Tag[]> {
    const result = await query(
      `SELECT * FROM tags WHERE name ILIKE $1 ORDER BY video_count DESC LIMIT $2`,
      [`%${term}%`, limit]
    );
    return result.rows;
  }

  static async findOrCreate(name: string): Promise<Tag> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existing = await this.findBySlug(slug);
    if (existing) return existing;

    const result = await query(
      'INSERT INTO tags (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name = $1 RETURNING *',
      [name, slug]
    );
    return result.rows[0];
  }

  static async create(data: { name: string; slug: string }): Promise<Tag> {
    const result = await query(
      'INSERT INTO tags (name, slug) VALUES ($1, $2) RETURNING *',
      [data.name, data.slug]
    );
    return result.rows[0];
  }

  static async delete(id: string): Promise<void> {
    await query('DELETE FROM tags WHERE id = $1', [id]);
  }

  static async updateVideoCount(tagId: string): Promise<void> {
    await query(
      `UPDATE tags SET video_count = (
        SELECT COUNT(*) FROM video_tags WHERE tag_id = $1
      ) WHERE id = $1`,
      [tagId]
    );
  }

  static async getPopular(limit = 50): Promise<Tag[]> {
    const result = await query(
      'SELECT * FROM tags WHERE video_count > 0 ORDER BY video_count DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }
}
