import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as cartService from './cart.service';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate);

const addItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().min(1).max(100),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(0).max(100),
});

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.getCart(req.user!.id);
  res.json({ success: true, data: cart });
}));

router.post('/items', asyncHandler(async (req: Request, res: Response) => {
  const { productId, variantId, quantity } = addItemSchema.parse(req.body);
  const cart = await cartService.addToCart(req.user!.id, productId, variantId ?? null, quantity);
  res.json({ success: true, data: cart });
}));

router.patch('/items/:itemId', asyncHandler(async (req: Request, res: Response) => {
  const { quantity } = updateItemSchema.parse(req.body);
  const cart = await cartService.updateCartItem(req.user!.id, req.params.itemId, quantity);
  res.json({ success: true, data: cart });
}));

router.delete('/items/:itemId', asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.removeFromCart(req.user!.id, req.params.itemId);
  res.json({ success: true, data: cart });
}));

export default router;
