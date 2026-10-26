import { Router, Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import * as chatService from './chat.service';
import { optionalAuthenticate } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();
router.use(optionalAuthenticate);

const chatLimiter: any = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 20,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many messages. Please wait.' } },
});

const messageSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).max(20).default([]),
});

router.post('/messages', chatLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { message, conversationHistory } = messageSchema.parse(req.body);
  const response = await chatService.chat(message, req.user?.id, conversationHistory);
  res.json({ success: true, data: response });
}));

router.post('/product-recommendations', chatLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { query } = z.object({ query: z.string().min(1).max(500) }).parse(req.body);
  const products = await chatService.getProductRecommendations(query);
  res.json({ success: true, data: products });
}));

export default router;
