import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as wishlistService from './wishlist.service';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await wishlistService.getWishlist(req.user!.id);
  res.json({ success: true, data: wishlist });
}));

router.post('/items', asyncHandler(async (req: Request, res: Response) => {
  const { productId } = z.object({ productId: z.string().min(1) }).parse(req.body);
  const wishlist = await wishlistService.addToWishlist(req.user!.id, productId);
  res.json({ success: true, data: wishlist });
}));

router.delete('/items/:productId', asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await wishlistService.removeFromWishlist(req.user!.id, req.params.productId);
  res.json({ success: true, data: wishlist });
}));

export default router;
