import psycopg2
import psycopg2.extras
import os
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.connection = None
        self.db_config = {
            'host': os.getenv('PG_HOST', 'localhost'),
            'port': os.getenv('PG_PORT', '5432'),
            'database': os.getenv('PG_DATABASE', 'studyflow'),
            'user': os.getenv('PG_USER', 'postgres'),
            'password': os.getenv('PG_PASSWORD', 'password')
        }
    
    def connect(self):
        """Establish connection to PostgreSQL"""
        try:
            self.connection = psycopg2.connect(**self.db_config)
            self.connection.autocommit = True
            logger.info("Connected to PostgreSQL database")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            return False
    
    def get_document_path(self, document_id: int) -> Optional[str]:
        """Fetch document file path from database"""
        if not self.connection:
            if not self.connect():
                return None
        
        try:
            with self.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute(
                    "SELECT file_path FROM documents WHERE id = %s",
                    (document_id,)
                )
                result = cursor.fetchone()
                if result:
                    return result['file_path']
                else:
                    logger.warning(f"Document {document_id} not found in database")
                    return None
        except Exception as e:
            logger.error(f"Error fetching document path for {document_id}: {e}")
            return None
    
    def save_summary(self, document_id: int, summary_text: str) -> bool:
        """Save summary to database"""
        if not self.connection:
            if not self.connect():
                return False
        
        try:
            with self.connection.cursor() as cursor:
                # Create summaries table if it doesn't exist
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS summaries (
                        id SERIAL PRIMARY KEY,
                        document_id INTEGER NOT NULL,
                        text TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (document_id) REFERENCES documents(id)
                    )
                """)
                
                # Insert the summary
                cursor.execute(
                    "INSERT INTO summaries (document_id, text) VALUES (%s, %s)",
                    (document_id, summary_text)
                )
                
                logger.info(f"Summary saved for document {document_id}")
                return True
                
        except Exception as e:
            logger.error(f"Error saving summary for document {document_id}: {e}")
            return False
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")

# Global database manager instance
db_manager = DatabaseManager() 