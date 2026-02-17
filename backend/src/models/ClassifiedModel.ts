import { query } from '../config/database';

export type ClassifiedCategory = 'm4w' | 'w4m' | 'm4m' | 'w4w' | 'm4mw' | 'w4mw' | 'mw4mw' | 'mw4w' | 'mw4m' | 't4m' | 't4w' | 'm4t' | 'w4t' | 'general';

export interface Classified {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: ClassifiedCategory;
  location: string | null;
  age: number | null;
  contact_method: string | null;
  is_active: boolean;
  expires_at: Date | null;
  view_count: number;
  created_at: Date;
  updated_at: Date;
}

export class ClassifiedModel {
  static async findAll(
    category?: ClassifiedCategory,
    location?: string,
    page = 1,
    limit = 20
  ) {
    const offset = (page - 1) * limit;
    const conditions: string[] = ['c.is_active = true', '(c.expires_at IS NULL OR c.expires_at > NOW())'];
    const values: unknown[] = [];
    let idx = 1;

    if (category) {
      conditions.push(`c.category = $${idx}`);
      values.push(category);
      idx++;
    }

    if (location) {
      conditions.push(`c.location ILIKE $${idx}`);
      values.push(`%${location}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM classifieds c ${where}`,
      values
    );
    const total = parseInt(countResult.rows[0].count, 10);

    values.push(limit, offset);
    const result = await query(
      `SELECT c.*, u.username as poster_name
       FROM classifieds c
       JOIN users u ON u.id = c.user_id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );

    const totalPages = Math.ceil(total / limit);
    return {
      data: result.rows,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  static async findById(id: string): Promise<Classified | null> {
    const result = await query(
      `SELECT c.*, u.username as poster_name
       FROM classifieds c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(data: {
    user_id: string;
    title: string;
    body: string;
    category: ClassifiedCategory;
    location?: string;
    age?: number;
    contact_method?: string;
    expires_at?: string;
  }): Promise<Classified> {
    const result = await query(
      `INSERT INTO classifieds (user_id, title, body, category, location, age, contact_method, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        data.user_id, data.title, data.body, data.category,
        data.location || null, data.age || null,
        data.contact_method || null, data.expires_at || null,
      ]
    );
    return result.rows[0];
  }

  static async update(id: string, userId: string, data: Partial<Classified>): Promise<Classified | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const key of ['title', 'body', 'category', 'location', 'age', 'contact_method', 'is_active'] as const) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(data[key]);
        idx++;
      }
    }
    if (fields.length === 0) return this.findById(id);

    values.push(id, userId);
    const result = await query(
      `UPDATE classifieds SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM classifieds WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async incrementViewCount(id: string): Promise<void> {
    await query('UPDATE classifieds SET view_count = view_count + 1 WHERE id = $1', [id]);
  }

  static async getByUser(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const countResult = await query(
      'SELECT COUNT(*) FROM classifieds WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].count, 10);
    const result = await query(
      `SELECT * FROM classifieds WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    const totalPages = Math.ceil(total / limit);
    return {
      data: result.rows,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  static getCategories() {
    return [
      { code: 'm4w', label: 'Men for Women' },
      { code: 'w4m', label: 'Women for Men' },
      { code: 'm4m', label: 'Men for Men' },
      { code: 'w4w', label: 'Women for Women' },
      { code: 'm4mw', label: 'Men for Couples' },
      { code: 'w4mw', label: 'Women for Couples' },
      { code: 'mw4mw', label: 'Couples for Couples' },
      { code: 'mw4w', label: 'Couples for Women' },
      { code: 'mw4m', label: 'Couples for Men' },
      { code: 't4m', label: 'Trans for Men' },
      { code: 't4w', label: 'Trans for Women' },
      { code: 'm4t', label: 'Men for Trans' },
      { code: 'w4t', label: 'Women for Trans' },
      { code: 'general', label: 'General' },
    ];
  }
}
