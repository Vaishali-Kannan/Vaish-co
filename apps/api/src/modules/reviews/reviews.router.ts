import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { asyncHandler, NotFoundError, AppError } from '../../middleware/errorHandler';

const router = Router();

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().max(2000).optional(),
});

router.get('/:productId/reviews', asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId: req.params.productId, status: 'APPROVED' },
      include: { user: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.review.count({ where: { productId: req.params.productId, status: 'APPROVED' } }),
  ]);

  res.json({ success: true, data: reviews, pagination: { page, limit, total } });
}));

router.post('/:productId/reviews', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { rating, title, body } = reviewSchema.parse(req.body);

  // Check if user already reviewed this product
  const existing = await prisma.review.findFirst({
    where: { productId: req.params.productId, userId: req.user!.id },
  });
  if (existing) throw new AppError('You have already reviewed this product', 409);

  // Check if user purchased this product
  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId: req.params.productId,
      order: { userId: req.user!.id, status: 'DELIVERED' },
    },
  });

  const review = await prisma.review.create({
    data: {
      productId: req.params.productId,
      userId: req.user!.id,
      rating,
      title,
      body,
      isVerified: !!purchased,
      status: 'PENDING', // Requires moderation
    },
  });

  res.status(201).json({ success: true, data: review, message: 'Review submitted and awaiting moderation' });
}));

export default router;
