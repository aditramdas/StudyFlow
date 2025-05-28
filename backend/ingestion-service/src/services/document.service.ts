import { v4 as uuidv4 } from 'uuid';
import { DocumentMetadata, DocumentStatus, DocumentType, DocumentValidationResult } from '../types/document';

// Temporary mock implementations until shared library is integrated
const publishMessage = async (queue: string, message: any): Promise<void> => {
  console.log(`Publishing message to ${queue}:`, message);
  // TODO: Replace with actual RabbitMQ implementation
};

const saveDocument = async (document: DocumentMetadata): Promise<void> => {
  console.log('Saving document:', document);
  // TODO: Replace with actual database implementation
};

const updateDocumentStatus = async (documentId: string, status: DocumentStatus, error?: string): Promise<void> => {
  console.log(`Updating document ${documentId} status to ${status}`, error ? `with error: ${error}` : '');
  // TODO: Replace with actual database implementation
};

export class DocumentService {
  private static instance: DocumentService;
  private readonly ALLOWED_MIME_TYPES: Record<string, DocumentType> = {
    'application/pdf': DocumentType.PDF,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': DocumentType.DOCX,
    'text/plain': DocumentType.TXT,
    'image/jpeg': DocumentType.IMAGE,
    'image/png': DocumentType.IMAGE
  };

  private constructor() {}

  public static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  public async validateDocument(file: Express.Multer.File): Promise<DocumentValidationResult> {
    const errors: string[] = [];

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      errors.push('File size exceeds 50MB limit');
    }

    // Check file type
    if (!this.ALLOWED_MIME_TYPES[file.mimetype]) {
      errors.push(`Unsupported file type: ${file.mimetype}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public async processDocument(file: Express.Multer.File, userId: string): Promise<DocumentMetadata> {
    // Create document metadata
    const document: DocumentMetadata = {
      id: uuidv4(),
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      type: this.ALLOWED_MIME_TYPES[file.mimetype],
      status: DocumentStatus.PENDING,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save document metadata to database
    await saveDocument(document);

    // Publish message to processing queue
    await publishMessage('document.processing', {
      documentId: document.id,
      userId,
      filePath: file.path,
      documentType: document.type
    });

    return document;
  }

  public async getDocumentStatus(documentId: string, userId: string): Promise<DocumentMetadata | null> {
    // TODO: Implement actual database query
    // For now, return a mock response
    return {
      id: documentId,
      filename: 'example.pdf',
      originalName: 'example.pdf',
      mimeType: 'application/pdf',
      size: 1024,
      type: DocumentType.PDF,
      status: DocumentStatus.PROCESSING,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  public async updateDocumentStatus(
    documentId: string,
    status: DocumentStatus,
    error?: string
  ): Promise<void> {
    await updateDocumentStatus(documentId, status, error);
  }
}