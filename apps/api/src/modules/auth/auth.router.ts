import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import * as authService from './auth.service';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import env from '../../config/env';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please wait.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const verifyEmailSchema = z.object({ token: z.string().min(1) });

const forgotPasswordSchema = z.object({ email: z.string().email() });

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
});

function setCookies(res: Response, accessToken: string, refreshToken: string) {
  const cookieOpts = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
  };
  res.cookie('access_token', accessToken, {
    ...cookieOpts,
    maxAge: 15 * 60 * 1000, // 15 min
  });
  res.cookie('refresh_token', refreshToken, {
    ...cookieOpts,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth/refresh',
  });
}

function clearCookies(res: Response) {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
router.post('/register', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const user = await authService.registerUser(data);
  res.status(201).json({
    success: true,
    message: 'Account created. Please check your email to verify your account.',
    data: { userId: user.id, email: user.email },
  });
}));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 */
router.post('/login', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const result = await authService.loginUser(
    email,
    password,
    req.headers['user-agent'],
    req.ip
  );

  setCookies(res, result.accessToken, result.refreshToken);

  res.json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
}));

const googleSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

router.post('/google', asyncHandler(async (req: Request, res: Response) => {
  const { email, name, avatar } = googleSchema.parse(req.body);

  const result = await authService.googleLoginUser(
    email,
    name,
    avatar,
    req.headers['user-agent'],
    req.ip
  );

  setCookies(res, result.accessToken, result.refreshToken);

  res.json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
}));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 */
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.access_token || req.headers.authorization?.slice(7);
  if (token) {
    await authService.logoutUser(token);
  }
  clearCookies(res);
  res.json({ success: true, message: 'Logged out successfully' });
}));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 */
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refresh_token || req.body.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Refresh token required' } });
    return;
  }
  const tokens = await authService.refreshTokens(refreshToken);
  setCookies(res, tokens.accessToken, tokens.refreshToken);
  res.json({ success: true, data: { accessToken: tokens.accessToken } });
}));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 */
router.get('/me', authenticate, asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: { user: req.user } });
}));

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email address
 *     tags: [Auth]
 */
router.post('/verify-email', asyncHandler(async (req: Request, res: Response) => {
  const { token } = verifyEmailSchema.parse(req.body);
  await authService.verifyEmail(token);
  res.json({ success: true, message: 'Email verified successfully' });
}));

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 */
router.post('/forgot-password', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  await authService.requestPasswordReset(email);
  // Always return success to prevent user enumeration
  res.json({ success: true, message: 'If an account exists with this email, you will receive a reset link.' });
}));

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 */
router.post('/reset-password', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = resetPasswordSchema.parse(req.body);
  await authService.resetPassword(token, password);
  res.json({ success: true, message: 'Password reset successfully. Please login.' });
}));

// Admin bootstrap endpoint
router.post('/bootstrap-admin', asyncHandler(async (req: Request, res: Response) => {
  const { secret, email, password, name } = req.body;
  const admin = await authService.bootstrapAdmin(secret, { email, password, name });
  res.status(201).json({ success: true, data: admin });
}));

export default router;
