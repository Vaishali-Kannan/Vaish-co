import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import prisma from '../config/database';
import { UnauthorizedError, ForbiddenError } from './errorHandler';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try cookie first, then Authorization header
    const token =
      req.cookies?.access_token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; sessionId: string };

    // Verify session is still active
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId, isRevoked: false },
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true, isActive: true },
        },
      },
    });

    if (!session || session.expiresAt < new Date() || !session.user.isActive) {
      throw new UnauthorizedError('Session expired or invalid');
    }

    req.user = session.user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Invalid or expired token'));
    } else {
      next(err);
    }
  }
};

export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await authenticate(req, res, () => {});
  } catch {
    // Ignore auth errors for optional auth
  }
  next();
};

export const requireRole = (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };

export const requireAdmin = requireRole(Role.ADMIN);
export const requireSupport = requireRole(Role.ADMIN, Role.SUPPORT);
