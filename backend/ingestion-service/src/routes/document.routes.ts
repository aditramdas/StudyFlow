import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { DocumentController } from '../controllers/document.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();
const documentController = new DocumentController();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Document routes
router.post(
  '/upload',
  authenticateUser,
  upload.single('document'),
  documentController.uploadDocument.bind(documentController)
);

router.get(
  '/status/:documentId',
  authenticateUser,
  documentController.getDocumentStatus.bind(documentController)
);

router.get(
  '/',
  authenticateUser,
  documentController.listUserDocuments.bind(documentController)
);

export default router; 