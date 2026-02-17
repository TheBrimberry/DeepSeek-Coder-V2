import { VideoModel } from '../models/VideoModel';
import { SourceModel } from '../models/SourceModel';
import { TagModel } from '../models/TagModel';
import { logger } from '../utils/logger';
import { cacheDeletePattern } from '../config/redis';

interface AggregatedVideo {
  title: string;
  description?: string;
  source_url: string;
  embed_url?: string;
  thumbnail_url?: string;
  duration?: number;
  tags?: string[];
  categories?: string[];
  published_at?: string;
}

export class AggregationService {
  /**
   * Aggregates videos from a configured source.
   * In production, each source would have a specific adapter/scraper.
   * This provides the framework for plugging in source-specific fetching logic.
   */
  static async aggregateFromSource(sourceId: string): Promise<number> {
    const source = await SourceModel.findById(sourceId);
    if (!source || !source.is_active) {
      logger.warn(`Source ${sourceId} not found or inactive`);
      return 0;
    }

    logger.info(`Starting aggregation from source: ${source.name}`);

    try {
      // Fetch videos using source-specific adapter
      const videos = await this.fetchFromSource(source);

      let imported = 0;
      for (const video of videos) {
        try {
          const slug = this.generateSlug(video.title);

          // Check for duplicates by source URL
          const existing = await VideoModel.findBySlug(slug);
          if (existing) continue;

          const created = await VideoModel.create({
            title: video.title,
            description: video.description || null,
            slug,
            source_url: video.source_url,
            embed_url: video.embed_url || null,
            thumbnail_url: video.thumbnail_url || null,
            duration: video.duration || null,
            source_id: source.id,
            published_at: video.published_at ? new Date(video.published_at) : null,
          });

          // Process tags
          if (video.tags && video.tags.length > 0) {
            const tagIds: string[] = [];
            for (const tagName of video.tags) {
              const tag = await TagModel.findOrCreate(tagName);
              tagIds.push(tag.id);
            }
            await VideoModel.addTags(created.id, tagIds);
          }

          // Process categories
          if (video.categories && video.categories.length > 0) {
            await VideoModel.addCategories(created.id, video.categories);
          }

          imported++;
        } catch (err) {
          logger.error(`Failed to import video: ${video.title}`, err);
        }
      }

      await SourceModel.updateLastScraped(source.id);

      // Invalidate caches
      await cacheDeletePattern('videos:*');
      await cacheDeletePattern('trending:*');

      logger.info(`Aggregation complete for ${source.name}: ${imported} new videos`);
      return imported;
    } catch (error) {
      logger.error(`Aggregation failed for source ${source.name}`, error);
      throw error;
    }
  }

  static async aggregateAll(): Promise<{ source: string; imported: number }[]> {
    const sources = await SourceModel.findAll(true);
    const results: { source: string; imported: number }[] = [];

    for (const source of sources) {
      try {
        const imported = await this.aggregateFromSource(source.id);
        results.push({ source: source.name, imported });
      } catch (err) {
        logger.error(`Failed to aggregate from ${source.name}`, err);
        results.push({ source: source.name, imported: 0 });
      }
    }

    return results;
  }

  /**
   * Source-specific fetch adapter. In production, this would be replaced
   * with actual API calls or scraping logic per source.
   * Each source's scrape_config can define the adapter type and parameters.
   */
  private static async fetchFromSource(_source: { scrape_config: Record<string, unknown> | null; base_url: string; name: string }): Promise<AggregatedVideo[]> {
    // Placeholder: implement per-source fetching logic
    // Example adapters: RSS feed parser, REST API client, web scraper
    //
    // const config = source.scrape_config || {};
    // switch (config.adapter) {
    //   case 'rss': return this.fetchFromRSS(source.base_url, config);
    //   case 'api': return this.fetchFromAPI(source.base_url, config);
    //   default: return [];
    // }

    logger.info(`Fetch adapter not yet configured for source. Add scrape_config to configure.`);
    return [];
  }

  private static generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 200);
    const suffix = Date.now().toString(36);
    return `${base}-${suffix}`;
  }
}
