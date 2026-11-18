import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tiffinbox-stories-dev-secret-change-in-production';

export interface AdminTokenPayload {
  sub: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  admin?: AdminTokenPayload;
}

/**
 * Signs a short-lived JWT for an authenticated kitchen administrator.
 */
export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

/**
 * Express middleware enforcing Bearer JWT authorization for admin endpoints.
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in as kitchen admin.' });
    return;
  }

  const token = authHeader.slice(7).trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired admin session. Please sign in again.' });
  }
}
