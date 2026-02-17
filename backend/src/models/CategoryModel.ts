import { query } from '../config/database';
import { Category } from '../types';

export class CategoryModel {
  static async findAll(activeOnly = true): Promise<Category[]> {
    const condition = activeOnly ? 'WHERE is_active = true' : '';
    const result = await query(
      `SELECT * FROM categories ${condition} ORDER BY name ASC`
    );
    return result.rows;
  }

  static async findById(id: string): Promise<Category | null> {
    const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findBySlug(slug: string): Promise<Category | null> {
    const result = await query('SELECT * FROM categories WHERE slug = $1', [slug]);
    return result.rows[0] || null;
  }

  static async create(data: { name: string; slug: string; description?: string; parent_id?: string; thumbnail_url?: string }): Promise<Category> {
    const result = await query(
      `INSERT INTO categories (name, slug, description, parent_id, thumbnail_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.name, data.slug, data.description || null, data.parent_id || null, data.thumbnail_url || null]
    );
    return result.rows[0];
  }

  static async update(id: string, data: Partial<Category>): Promise<Category | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (['name', 'slug', 'description', 'thumbnail_url', 'is_active'].includes(key)) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }
    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<void> {
    await query('DELETE FROM categories WHERE id = $1', [id]);
  }

  static async getChildren(parentId: string): Promise<Category[]> {
    const result = await query(
      'SELECT * FROM categories WHERE parent_id = $1 AND is_active = true ORDER BY name',
      [parentId]
    );
    return result.rows;
  }

  static async updateVideoCount(categoryId: string): Promise<void> {
    await query(
      `UPDATE categories SET video_count = (
        SELECT COUNT(*) FROM video_categories WHERE category_id = $1
      ) WHERE id = $1`,
      [categoryId]
    );
  }
}
