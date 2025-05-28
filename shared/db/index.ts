import { Client, Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Shared database utilities for StudyFlow
 */

let pool: Pool | null = null;

/**
 * Database configuration from environment variables
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

/**
 * Get database configuration from environment variables
 */
function getDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE || 'studyflow',
    username: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
  };
}

/**
 * Connect to the database
 * @returns Promise<Pool>
 */
export async function connect(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  const config = getDatabaseConfig();
  
  pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test the connection
  try {
    await pool.query('SELECT NOW()');
    console.log(`Connected to PostgreSQL database: ${config.database}`);
    return pool;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

/**
 * Disconnect from the database
 * @returns Promise<void>
 */
export async function disconnect(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Disconnected from PostgreSQL database');
  }
}

/**
 * Get the current database pool
 * @returns Pool | null
 */
export function getPool(): Pool | null {
  return pool;
} 