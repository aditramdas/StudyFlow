export enum DocumentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum DocumentType {
  PDF = 'PDF',
  DOCX = 'DOCX',
  TXT = 'TXT',
  IMAGE = 'IMAGE'
}

export interface DocumentMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: DocumentType;
  status: DocumentStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  processingError?: string;
}

export interface DocumentProcessingResult {
  documentId: string;
  status: DocumentStatus;
  extractedText?: string;
  metadata?: Record<string, any>;
  error?: string;
}

export interface DocumentUploadRequest {
  file: Express.Multer.File;
  userId: string;
  metadata?: Record<string, any>;
}

export interface DocumentValidationResult {
  isValid: boolean;
  errors: string[];
} 