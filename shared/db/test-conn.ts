#!/usr/bin/env ts-node

/**
 * Test script for database connection
 */

import { connect, disconnect } from './index';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    const pool = await connect();
    console.log('DB connected');
    
    // Test a simple query
    const result = await pool.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);
    
    await disconnect();
    console.log('Test completed successfully');
    
  } catch (error) {
    console.error('Connection test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testConnection();
} 