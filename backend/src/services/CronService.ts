import cron from 'node-cron';
import { env } from '../config/env';
import { AggregationService } from './AggregationService';
import { logger } from '../utils/logger';

export class CronService {
  private static task: cron.ScheduledTask | null = null;

  static start(): void {
    if (this.task) {
      logger.warn('Cron service already running');
      return;
    }

    this.task = cron.schedule(env.aggregation.cron, async () => {
      logger.info('Starting scheduled aggregation...');
      try {
        const results = await AggregationService.aggregateAll();
        const totalImported = results.reduce((sum, r) => sum + r.imported, 0);
        logger.info(`Scheduled aggregation complete: ${totalImported} total new videos`);
      } catch (error) {
        logger.error('Scheduled aggregation failed', error);
      }
    });

    logger.info(`Cron service started with schedule: ${env.aggregation.cron}`);
  }

  static stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      logger.info('Cron service stopped');
    }
  }
}
