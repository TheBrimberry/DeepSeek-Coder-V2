import { query } from '../config/database';
import { Video, SearchParams, PaginatedResponse } from '../types';

export class VideoModel {
  static async findById(id: string): Promise<Video | null> {
    const result = await query(
      `SELECT v.*, s.name as source_name, s.slug as source_slug
       FROM videos v
       LEFT JOIN sources s ON s.id = v.source_id
       WHERE v.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findBySlug(slug: string): Promise<Video | null> {
    const result = await query(
      `SELECT v.*, s.name as source_name, s.slug as source_slug
       FROM videos v
       LEFT JOIN sources s ON s.id = v.source_id
       WHERE v.slug = $1`,
      [slug]
    );
    return result.rows[0] || null;
  }

  static async search(params: SearchParams): Promise<PaginatedResponse<Video>> {
    const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = params;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['v.is_active = true'];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (params.query) {
      conditions.push(`(v.title ILIKE $${paramIndex} OR v.description ILIKE $${paramIndex})`);
      values.push(`%${params.query}%`);
      paramIndex++;
    }

    if (params.categoryId) {
      conditions.push(`EXISTS (SELECT 1 FROM video_categories vc WHERE vc.video_id = v.id AND vc.category_id = $${paramIndex})`);
      values.push(params.categoryId);
      paramIndex++;
    }

    if (params.tagId) {
      conditions.push(`EXISTS (SELECT 1 FROM video_tags vt WHERE vt.video_id = v.id AND vt.tag_id = $${paramIndex})`);
      values.push(params.tagId);
      paramIndex++;
    }

    if (params.sourceId) {
      conditions.push(`v.source_id = $${paramIndex}`);
      values.push(params.sourceId);
      paramIndex++;
    }

    if (params.minDuration) {
      conditions.push(`v.duration >= $${paramIndex}`);
      values.push(params.minDuration);
      paramIndex++;
    }

    if (params.maxDuration) {
      conditions.push(`v.duration <= $${paramIndex}`);
      values.push(params.maxDuration);
      paramIndex++;
    }

    if (params.dateFrom) {
      conditions.push(`v.published_at >= $${paramIndex}`);
      values.push(params.dateFrom);
      paramIndex++;
    }

    if (params.dateTo) {
      conditions.push(`v.published_at <= $${paramIndex}`);
      values.push(params.dateTo);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSortColumns = ['created_at', 'view_count', 'like_count', 'duration', 'published_at', 'title'];
    const safeSort = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countQuery = `SELECT COUNT(*) FROM videos v ${whereClause}`;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataQuery = `
      SELECT v.*, s.name as source_name, s.slug as source_slug
      FROM videos v
      LEFT JOIN sources s ON s.id = v.source_id
      ${whereClause}
      ORDER BY v.${safeSort} ${safeOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    values.push(limit, offset);

    const dataResult = await query(dataQuery, values);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  static async getFeatured(limit = 10): Promise<Video[]> {
    const result = await query(
      `SELECT v.*, s.name as source_name
       FROM videos v
       LEFT JOIN sources s ON s.id = v.source_id
       WHERE v.is_active = true AND v.is_featured = true
       ORDER BY v.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  static async getTrending(limit = 20): Promise<Video[]> {
    const result = await query(
      `SELECT v.*, s.name as source_name
       FROM videos v
       LEFT JOIN sources s ON s.id = v.source_id
       WHERE v.is_active = true AND v.published_at > NOW() - INTERVAL '7 days'
       ORDER BY v.view_count DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  static async getRelated(videoId: string, limit = 10): Promise<Video[]> {
    const result = await query(
      `SELECT DISTINCT v2.*, s.name as source_name
       FROM videos v1
       JOIN video_tags vt1 ON vt1.video_id = v1.id
       JOIN video_tags vt2 ON vt2.tag_id = vt1.tag_id AND vt2.video_id != v1.id
       JOIN videos v2 ON v2.id = vt2.video_id AND v2.is_active = true
       LEFT JOIN sources s ON s.id = v2.source_id
       WHERE v1.id = $1
       ORDER BY v2.view_count DESC
       LIMIT $2`,
      [videoId, limit]
    );
    return result.rows;
  }

  static async incrementViewCount(id: string): Promise<void> {
    await query('UPDATE videos SET view_count = view_count + 1 WHERE id = $1', [id]);
  }

  static async toggleLike(id: string, increment: boolean): Promise<void> {
    const op = increment ? '+' : '-';
    await query(`UPDATE videos SET like_count = GREATEST(0, like_count ${op} 1) WHERE id = $1`, [id]);
  }

  static async create(data: Partial<Video>): Promise<Video> {
    const result = await query(
      `INSERT INTO videos (title, description, slug, source_url, embed_url, thumbnail_url, duration, source_id, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        data.title, data.description, data.slug, data.source_url,
        data.embed_url, data.thumbnail_url, data.duration,
        data.source_id, data.published_at,
      ]
    );
    return result.rows[0];
  }

  static async update(id: string, data: Partial<Video>): Promise<Video | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const allowedFields = ['title', 'description', 'thumbnail_url', 'embed_url', 'is_active', 'is_featured'];
    for (const field of allowedFields) {
      if (data[field as keyof Video] !== undefined) {
        fields.push(`${field} = $${idx}`);
        values.push(data[field as keyof Video]);
        idx++;
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await query(
      `UPDATE videos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<void> {
    await query('DELETE FROM videos WHERE id = $1', [id]);
  }

  static async addCategories(videoId: string, categoryIds: string[]): Promise<void> {
    for (const categoryId of categoryIds) {
      await query(
        'INSERT INTO video_categories (video_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [videoId, categoryId]
      );
    }
  }

  static async addTags(videoId: string, tagIds: string[]): Promise<void> {
    for (const tagId of tagIds) {
      await query(
        'INSERT INTO video_tags (video_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [videoId, tagId]
      );
    }
  }

  static async getVideoCategories(videoId: string) {
    const result = await query(
      `SELECT c.* FROM categories c
       JOIN video_categories vc ON vc.category_id = c.id
       WHERE vc.video_id = $1`,
      [videoId]
    );
    return result.rows;
  }

  static async getVideoTags(videoId: string) {
    const result = await query(
      `SELECT t.* FROM tags t
       JOIN video_tags vt ON vt.tag_id = t.id
       WHERE vt.video_id = $1`,
      [videoId]
    );
    return result.rows;
  }
}
