import { Router, Request, Response } from 'express';
import { z } from 'zod';
import express from 'express';
import * as paymentsService from './payments.service';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.post('/create', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = z.object({ orderId: z.string().min(1) }).parse(req.body);
  const paymentOrder = await paymentsService.createPaymentOrder(orderId, req.user!.id);
  res.json({ success: true, data: paymentOrder });
}));

router.post('/verify', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const data = z.object({
    orderId: z.string().min(1),
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
  }).parse(req.body);

  const result = await paymentsService.verifyPayment({ ...data, userId: req.user!.id });
  res.json({ success: true, data: result });
}));

// Raw body required for signature verification
router.post('/webhooks/:provider',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['x-razorpay-signature'] as string;
    await paymentsService.handleWebhook(req.params.provider, req.body, signature);
    res.json({ success: true });
  })
);

export default router;
