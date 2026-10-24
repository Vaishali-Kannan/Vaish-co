import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as rewardsService from './rewards.service';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate);

router.get('/balance', asyncHandler(async (req: Request, res: Response) => {
  const balance = await rewardsService.getRewardBalance(req.user!.id);
  res.json({ success: true, data: balance });
}));

router.get('/transactions', asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
  }).parse(req.query);
  const result = await rewardsService.getRewardTransactions(req.user!.id, page, limit);
  res.json({ success: true, ...result });
}));

router.post('/quote-redemption', asyncHandler(async (req: Request, res: Response) => {
  const { orderTotal, coins } = z.object({
    orderTotal: z.number().min(0),
    coins: z.number().int().min(1),
  }).parse(req.body);
  const quote = await rewardsService.quoteRedemption(req.user!.id, orderTotal, coins);
  res.json({ success: true, data: quote });
}));

export default router;
