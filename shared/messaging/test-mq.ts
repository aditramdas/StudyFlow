#!/usr/bin/env ts-node

/**
 * Test script for RabbitMQ messaging
 */

import { connect, publish, consume, disconnect } from './index';

async function testMessaging() {
  try {
    console.log('Testing RabbitMQ messaging...');
    
    const testQueue = 'test-queue';
    const testMessage = { id: 1, text: 'Hello RabbitMQ!', timestamp: new Date().toISOString() };
    
    // Set up consumer first
    console.log('Setting up consumer...');
    await consume(testQueue, (message) => {
      console.log('Received message:', message);
      console.log('Message test completed successfully!');
    });
    
    // Give consumer time to set up
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Publish a test message
    console.log('Publishing test message...');
    await publish(testQueue, testMessage);
    
    // Wait for message processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Disconnecting...');
    await disconnect();
    
    console.log('Test completed successfully');
    
  } catch (error) {
    console.error('Messaging test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testMessaging();
} 