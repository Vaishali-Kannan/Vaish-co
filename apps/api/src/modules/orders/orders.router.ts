import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { DeliveryMode, PaymentMethod } from '@prisma/client';
import * as ordersService from './orders.service';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate);

const checkoutQuoteSchema = z.object({
  addressId: z.string().min(1),
  deliveryMode: z.nativeEnum(DeliveryMode),
  couponCode: z.string().optional(),
  coinsToRedeem: z.number().int().min(0).optional(),
});

const createOrderSchema = z.object({
  addressId: z.string().min(1),
  deliveryMode: z.nativeEnum(DeliveryMode),
  paymentMethod: z.nativeEnum(PaymentMethod),
  couponCode: z.string().optional(),
  coinsToRedeem: z.number().int().min(0).optional(),
  notes: z.string().max(500).optional(),
});

router.post('/checkout/quote', asyncHandler(async (req: Request, res: Response) => {
  const data = checkoutQuoteSchema.parse(req.body);
  const quote = await ordersService.quoteCheckout(req.user!.id, data);
  res.json({ success: true, data: quote });
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const data = createOrderSchema.parse(req.body);
  const order = await ordersService.createOrder(req.user!.id, data);
  res.status(201).json({ success: true, data: order });
}));

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(20).default(10),
  }).parse(req.query);
  const result = await ordersService.getUserOrders(req.user!.id, page, limit);
  res.json({ success: true, ...result });
}));

router.get('/:orderId', asyncHandler(async (req: Request, res: Response) => {
  const order = await ordersService.getOrderById(req.params.orderId, req.user!.id);
  res.json({ success: true, data: order });
}));

router.post('/:orderId/cancel', asyncHandler(async (req: Request, res: Response) => {
  await ordersService.cancelOrder(req.params.orderId, req.user!.id);
  res.json({ success: true, message: 'Order cancelled successfully' });
}));

router.post('/:orderId/return-request', asyncHandler(async (req: Request, res: Response) => {
  await ordersService.requestReturn(req.params.orderId, req.user!.id);
  res.json({ success: true, message: 'Return request submitted' });
}));

export default router;
