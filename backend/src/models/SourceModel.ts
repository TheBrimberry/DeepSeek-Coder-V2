import { query } from '../config/database';
import { Source } from '../types';

export class SourceModel {
  static async findAll(activeOnly = true): Promise<Source[]> {
    const condition = activeOnly ? 'WHERE is_active = true' : '';
    const result = await query(`SELECT * FROM sources ${condition} ORDER BY name ASC`);
    return result.rows;
  }

  static async findById(id: string): Promise<Source | null> {
    const result = await query('SELECT * FROM sources WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findBySlug(slug: string): Promise<Source | null> {
    const result = await query('SELECT * FROM sources WHERE slug = $1', [slug]);
    return result.rows[0] || null;
  }

  static async create(data: {
    name: string;
    slug: string;
    base_url: string;
    logo_url?: string;
    scrape_config?: Record<string, unknown>;
  }): Promise<Source> {
    const result = await query(
      `INSERT INTO sources (name, slug, base_url, logo_url, scrape_config)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.name, data.slug, data.base_url, data.logo_url || null, JSON.stringify(data.scrape_config || {})]
    );
    return result.rows[0];
  }

  static async update(id: string, data: Partial<Source>): Promise<Source | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (['name', 'slug', 'base_url', 'logo_url', 'is_active', 'scrape_config'].includes(key)) {
        fields.push(`${key} = $${idx}`);
        values.push(key === 'scrape_config' ? JSON.stringify(value) : value);
        idx++;
      }
    }
    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await query(
      `UPDATE sources SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async updateLastScraped(id: string): Promise<void> {
    await query('UPDATE sources SET last_scraped_at = NOW() WHERE id = $1', [id]);
  }

  static async delete(id: string): Promise<void> {
    await query('DELETE FROM sources WHERE id = $1', [id]);
  }
}
