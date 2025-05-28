import * as amqp from 'amqplib';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Shared messaging utilities for StudyFlow
 */

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

// Export types that will be used across services
export interface MessageHandler {
  (message: any): void | Promise<void>;
}

export interface MessagingConfig {
  url: string;
  retries?: number;
  retryDelay?: number;
}

/**
 * Get messaging configuration from environment variables
 */
function getMessagingConfig(): MessagingConfig {
  return {
    url: process.env.MQ_URL || 'amqp://guest:guest@localhost:5672',
    retries: parseInt(process.env.MQ_RETRIES || '3'),
    retryDelay: parseInt(process.env.MQ_RETRY_DELAY || '1000'),
  };
}

/**
 * Connect to the message broker
 * @returns Promise<amqp.Channel>
 */
export async function connect(): Promise<amqp.Channel> {
  if (channel) {
    return channel;
  }

  const config = getMessagingConfig();
  
  try {
    connection = await amqp.connect(config.url);
    channel = await connection.createChannel();
    
    console.log('Connected to RabbitMQ');
    
    // Handle connection errors
    connection.on('error', (err: Error) => {
      console.error('RabbitMQ connection error:', err);
    });
    
    connection.on('close', () => {
      console.log('RabbitMQ connection closed');
      connection = null;
      channel = null;
    });
    
    return channel;
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
}

/**
 * Disconnect from the message broker
 * @returns Promise<void>
 */
export async function disconnect(): Promise<void> {
  if (channel) {
    await channel.close();
    channel = null;
  }
  
  if (connection) {
    await connection.close();
    connection = null;
  }
  
  console.log('Disconnected from RabbitMQ');
}

/**
 * Publish a message to a queue
 * @param queue - The queue name
 * @param message - The message to publish
 * @returns Promise<void>
 */
export async function publish(queue: string, message: any): Promise<void> {
  const ch = await connect();
  
  // Ensure queue exists
  await ch.assertQueue(queue, { durable: true });
  
  // Convert message to buffer
  const messageBuffer = Buffer.from(JSON.stringify(message));
  
  // Publish message
  const sent = ch.sendToQueue(queue, messageBuffer, { persistent: true });
  
  if (!sent) {
    throw new Error(`Failed to publish message to queue: ${queue}`);
  }
  
  console.log(`Published message to queue: ${queue}`, message);
}

/**
 * Consume messages from a queue
 * @param queue - The queue name
 * @param handler - The message handler function
 * @returns Promise<void>
 */
export async function consume(queue: string, handler: MessageHandler): Promise<void> {
  const ch = await connect();
  
  // Ensure queue exists
  await ch.assertQueue(queue, { durable: true });
  
  // Set prefetch to 1 to distribute messages evenly
  await ch.prefetch(1);
  
  console.log(`Started consuming messages from queue: ${queue}`);
  
  // Consume messages
  await ch.consume(queue, async (msg: amqp.ConsumeMessage | null) => {
    if (msg) {
      try {
        const content = JSON.parse(msg.content.toString());
        console.log(`Received message from queue: ${queue}`, content);
        
        // Process message
        await handler(content);
        
        // Acknowledge message
        ch.ack(msg);
      } catch (error) {
        console.error(`Error processing message from queue: ${queue}`, error);
        
        // Reject message and requeue
        ch.nack(msg, false, true);
      }
    }
  });
}

/**
 * Get the current channel
 * @returns amqp.Channel | null
 */
export function getChannel(): amqp.Channel | null {
  return channel;
} 