import pika
import json
import logging
import os
from typing import Callable, Any

logger = logging.getLogger(__name__)

class MessageConsumer:
    def __init__(self):
        self.connection = None
        self.channel = None
        self.rabbitmq_url = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672/')
    
    def connect(self):
        """Establish connection to RabbitMQ"""
        try:
            self.connection = pika.BlockingConnection(
                pika.URLParameters(self.rabbitmq_url)
            )
            self.channel = self.connection.channel()
            logger.info("Connected to RabbitMQ")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            return False
    
    def consume(self, queue_name: str, handler: Callable[[Any], None]):
        """Consume messages from a queue"""
        if not self.channel:
            if not self.connect():
                return
        
        try:
            # Declare the queue (create if it doesn't exist)
            self.channel.queue_declare(queue=queue_name, durable=True)
            
            def callback(ch, method, properties, body):
                try:
                    message = json.loads(body.decode('utf-8'))
                    logger.info(f"Received message from {queue_name}: {message}")
                    handler(message)
                    ch.basic_ack(delivery_tag=method.delivery_tag)
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
                    ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            
            self.channel.basic_consume(
                queue=queue_name,
                on_message_callback=callback
            )
            
            logger.info(f"Started consuming from queue: {queue_name}")
            self.channel.start_consuming()
            
        except Exception as e:
            logger.error(f"Error consuming from queue {queue_name}: {e}")
    
    def close(self):
        """Close the connection"""
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            logger.info("RabbitMQ connection closed")

# Global consumer instance
consumer = MessageConsumer()

def handle_document_uploaded(message: dict):
    """Handler for document.uploaded events"""
    logger.info(f"Processing document uploaded event: {message}")
    document_id = message.get('documentId')
    if document_id:
        logger.info(f"Document {document_id} is ready for NLP processing")
        # TODO: Trigger summarization process
    else:
        logger.warning("Received document.uploaded event without documentId") 