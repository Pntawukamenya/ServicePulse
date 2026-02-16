import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  userAgencyId?: string;
  userAgencyCode?: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set in .env (min 32 characters)');
  }
  return secret;
}
const JWT_SECRET = getJwtSecret();

/**
 * Verify JWT token and attach user info to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization ?? req.headers.Authorization;
    const token = (typeof authHeader === 'string' ? authHeader : authHeader?.[0])?.replace(/^Bearer\s+/i, '');

    if (!token) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[auth] 401: No token provided for', req.method, req.path);
      }
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string; agencyId?: string; agencyCode?: string };
    
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userAgencyId = decoded.agencyId;
    req.userAgencyCode = decoded.agencyCode;

    next();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[auth] 401: Invalid/expired token for', req.method, req.path, (error as Error).message);
    }
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Check if user has required role
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.userRole)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
