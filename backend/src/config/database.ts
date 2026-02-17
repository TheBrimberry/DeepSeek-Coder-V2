import { Pool, PoolConfig } from 'pg';
import { env } from './env';
import { logger } from '../utils/logger';

const poolConfig: PoolConfig = {
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  logger.error('Unexpected database pool error', err);
});

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.debug(`Query executed in ${duration}ms: ${text.substring(0, 80)}...`);
  return result;
}

export async function getClient() {
  const client = await pool.connect();
  return client;
}

export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT NOW()');
    logger.info('Database connection established');
    return true;
  } catch (error) {
    logger.error('Database connection failed', error);
    return false;
  }
}
