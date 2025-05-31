from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv
import logging
from datetime import datetime
import threading
from pydantic import BaseModel
from messaging import consumer, handle_document_uploaded
from database import db_manager
from publisher import publish_nlp_completed

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="StudyFlow NLP Service",
    description="Natural Language Processing service for document summarization and analysis",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class SummarizeRequest(BaseModel):
    documentId: int

class SummarizeResponse(BaseModel):
    documentId: int
    summary: str
    status: str

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

# Summarization endpoint
@app.post("/nlp/summarize", response_model=SummarizeResponse)
async def summarize_document(request: SummarizeRequest):
    """Simple summarization endpoint - returns first 100 chars as summary"""
    try:
        document_id = request.documentId
        logger.info(f"Summarization requested for document {document_id}")
        
        # Try to fetch file path from database
        file_path = db_manager.get_document_path(document_id)
        if file_path:
            logger.info(f"Found file path for document {document_id}: {file_path}")
            # TODO: Read and analyze actual document content
            summary = f"Summary of document {document_id} from {file_path}. " + \
                     "This would contain actual content analysis in a real implementation."
        else:
            logger.warning(f"No file path found for document {document_id}, using fallback")
            summary = f"This is a simple summary for document {document_id}. " + \
                     "In a real implementation, this would analyze the document content and provide meaningful insights."
        
        # Truncate to first 100 characters as per task requirement
        summary = summary[:100]
        
        logger.info(f"Generated summary for document {document_id}: {summary}")
        
        # Save summary to database (Task 27)
        if db_manager.save_summary(document_id, summary):
            logger.info(f"Summary saved to database for document {document_id}")
        else:
            logger.error(f"Failed to save summary to database for document {document_id}")
        
        # Publish nlp.completed event (Task 28)
        if publish_nlp_completed(document_id):
            logger.info(f"Published nlp.completed event for document {document_id}")
        else:
            logger.error(f"Failed to publish nlp.completed event for document {document_id}")
        
        return SummarizeResponse(
            documentId=document_id,
            summary=summary,
            status="completed"
        )
        
    except Exception as e:
        logger.error(f"Error summarizing document {request.documentId}: {e}")
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "message": "StudyFlow NLP Service",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "health": "/health",
            "summarize": "/nlp/summarize"
        }
    }

def start_message_consumer():
    """Start the RabbitMQ message consumer in a separate thread"""
    try:
        logger.info("Starting RabbitMQ consumer for document.uploaded events")
        consumer.consume('document.uploaded', handle_document_uploaded)
    except Exception as e:
        logger.error(f"Error starting message consumer: {e}")

@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info("NLP Service starting up...")
    
    # Initialize database connection
    if db_manager.connect():
        logger.info("Database connection established")
    else:
        logger.warning("Failed to establish database connection")
    
    # Start message consumer in background thread
    consumer_thread = threading.Thread(target=start_message_consumer, daemon=True)
    consumer_thread.start()
    logger.info("Message consumer thread started")

@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info("NLP Service shutting down...")
    consumer.close()
    db_manager.close()

if __name__ == "__main__":
    port = int(os.getenv("NLP_PORT", 3003))
    logger.info(f"Starting NLP service on port {port}")
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=port,
        reload=True
    ) 