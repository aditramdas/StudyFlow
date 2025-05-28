import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Invalid token format' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
        id: string;
        email: string;
      };

      req.user = {
        id: decoded.id,
        email: decoded.email
      };

      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}; 