import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../config/database';
import env from '../../config/env';
import { AppError, ConflictError, UnauthorizedError, NotFoundError } from '../../middleware/errorHandler';
import { Role } from '@prisma/client';
import logger from '../../utils/logger';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function generateTokens(userId: string, sessionId: string) {
  const accessToken = jwt.sign(
    { userId, sessionId },
    env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = crypto.randomBytes(64).toString('hex');
  return { accessToken, refreshToken };
}

function getSessionExpiry() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  return expiry;
}

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        phone: data.phone,
        passwordHash,
        role: Role.CUSTOMER,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    // Create reward account
    await tx.rewardAccount.create({
      data: { userId: newUser.id, balance: 0 },
    });

    // Create cart
    await tx.cart.create({ data: { userId: newUser.id } });

    // Create wishlist
    await tx.wishlist.create({ data: { userId: newUser.id } });

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await tx.verificationToken.create({
      data: {
        userId: newUser.id,
        token: verificationToken,
        type: 'email_verification',
        expiresAt: verifyExpiry,
      },
    });

    return { ...newUser, verificationToken };
  });

  logger.info('User registered', { userId: user.id, email: user.email });
  return user;
}

export async function loginUser(
  email: string,
  password: string,
  userAgent?: string,
  ipAddress?: string
) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Use timing-safe comparison to prevent user enumeration
  const dummyHash = '$2b$12$invalidhashinvalidhashinvalidhashinvalidhashinvalidhash0';
  const valid = user
    ? await bcrypt.compare(password, user.passwordHash)
    : await bcrypt.compare(password, dummyHash);

  if (!user || !valid || !user.isActive) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Create session
  const { accessToken, refreshToken } = generateTokens(user.id, ''); // placeholder
  const expiry = getSessionExpiry();

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: accessToken,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt: expiry,
    },
  });

  // Regenerate with sessionId
  const { accessToken: finalAccessToken } = generateTokens(user.id, session.id);
  await prisma.session.update({
    where: { id: session.id },
    data: { token: finalAccessToken },
  });

  logger.info('User logged in', { userId: user.id });

  return {
    accessToken: finalAccessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  };
}

export async function refreshTokens(refreshToken: string) {
  const session = await prisma.session.findUnique({
    where: { refreshToken, isRevoked: false },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || !session.user.isActive) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(session.userId, session.id);
  const expiry = getSessionExpiry();

  await prisma.session.update({
    where: { id: session.id },
    data: {
      token: accessToken,
      refreshToken: newRefreshToken,
      expiresAt: expiry,
    },
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logoutUser(sessionToken: string) {
  await prisma.session.updateMany({
    where: { token: sessionToken },
    data: { isRevoked: true },
  });
}

export async function verifyEmail(token: string) {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date() || record.usedAt) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    }),
    prisma.verificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
}

export async function requestPasswordReset(email: string) {
  // Always return success to prevent user enumeration
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return { token: null };

  // Invalidate old tokens
  await prisma.passwordReset.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await prisma.passwordReset.create({
    data: { userId: user.id, token, expiresAt: expiry },
  });

  return { token, email: user.email, name: user.name };
}

export async function resetPassword(token: string, newPassword: string) {
  const record = await prisma.passwordReset.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date() || record.usedAt) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordReset.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Revoke all sessions
    prisma.session.updateMany({
      where: { userId: record.userId },
      data: { isRevoked: true },
    }),
  ]);
}

export async function bootstrapAdmin(secret: string, data: {
  email: string;
  password: string;
  name: string;
}) {
  if (!env.ADMIN_BOOTSTRAP_SECRET || secret !== env.ADMIN_BOOTSTRAP_SECRET) {
    throw new UnauthorizedError('Invalid bootstrap secret');
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new ConflictError('User already exists');

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
  const admin = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      name: data.name,
      passwordHash,
      role: Role.ADMIN,
      emailVerified: true,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  logger.info('Admin user bootstrapped', { userId: admin.id });
  return admin;
}

export async function googleLoginUser(
  email: string,
  name?: string,
  avatar?: string,
  userAgent?: string,
  ipAddress?: string
) {
  let user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, BCRYPT_ROUNDS);

    user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          name: name || email.split('@')[0],
          passwordHash,
          role: Role.CUSTOMER,
          emailVerified: true,
          avatarUrl: avatar || null,
        },
      });

      await tx.rewardAccount.create({
        data: { userId: newUser.id, balance: 50 },
      });

      await tx.cart.create({
        data: { userId: newUser.id },
      });

      return newUser;
    });
  }

  const { accessToken: tempToken, refreshToken } = generateTokens(user.id, '');
  const expiry = getSessionExpiry();

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: tempToken,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt: expiry,
    },
  });

  const { accessToken: finalAccessToken } = generateTokens(user.id, session.id);
  await prisma.session.update({
    where: { id: session.id },
    data: { token: finalAccessToken },
  });

  const reward = await prisma.rewardAccount.findUnique({ where: { userId: user.id } });

  logger.info('User logged in via Google SSO', { userId: user.id, email: user.email });

  return {
    accessToken: finalAccessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      fullName: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      coinsBalance: reward?.balance || 50,
    },
  };
}
