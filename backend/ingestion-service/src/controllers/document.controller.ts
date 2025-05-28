import { Request, Response } from 'express';
import { DocumentService } from '../services/document.service';
import { DocumentStatus } from '../types/document';

export class DocumentController {
  private documentService: DocumentService;

  constructor() {
    this.documentService = DocumentService.getInstance();
  }

  public async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      // Get user ID from auth middleware
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Validate document
      const validationResult = await this.documentService.validateDocument(req.file);
      if (!validationResult.isValid) {
        res.status(400).json({ 
          error: 'Invalid document',
          details: validationResult.errors
        });
        return;
      }

      // Process document
      const document = await this.documentService.processDocument(req.file, userId);
      
      res.status(202).json({
        message: 'Document uploaded successfully',
        document
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ 
        error: 'Failed to upload document',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  public async getDocumentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get document status from service
      const document = await this.documentService.getDocumentStatus(documentId, userId);
      
      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      res.json({
        documentId: document.id,
        status: document.status,
        filename: document.originalName,
        type: document.type,
        size: document.size,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        error: document.processingError
      });
    } catch (error) {
      console.error('Error getting document status:', error);
      res.status(500).json({ 
        error: 'Failed to get document status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  public async listUserDocuments(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // TODO: Implement listUserDocuments in DocumentService
      // For now, return a mock response
      res.json({
        documents: [],
        total: 0,
        message: 'Document listing not yet implemented'
      });
    } catch (error) {
      console.error('Error listing documents:', error);
      res.status(500).json({ 
        error: 'Failed to list documents',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 