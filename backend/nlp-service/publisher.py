import pika
import json
import logging
import os
from datetime import datetime

logger = logging.getLogger(__name__)

class MessagePublisher:
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
            logger.info("Connected to RabbitMQ for publishing")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ for publishing: {e}")
            return False
    
    def publish(self, queue_name: str, message: dict):
        """Publish a message to a queue"""
        if not self.channel:
            if not self.connect():
                return False
        
        try:
            # Declare the queue (create if it doesn't exist)
            self.channel.queue_declare(queue=queue_name, durable=True)
            
            # Publish the message
            self.channel.basic_publish(
                exchange='',
                routing_key=queue_name,
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Make message persistent
                )
            )
            
            logger.info(f"Published message to {queue_name}: {message}")
            return True
            
        except Exception as e:
            logger.error(f"Error publishing message to {queue_name}: {e}")
            return False
    
    def close(self):
        """Close the connection"""
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            logger.info("RabbitMQ publisher connection closed")

# Global publisher instance
publisher = MessagePublisher()

def publish_nlp_completed(document_id: int):
    """Publish nlp.completed event"""
    message = {
        'documentId': document_id,
        'timestamp': datetime.now().isoformat(),
        'status': 'completed'
    }
    return publisher.publish('nlp.completed', message) 