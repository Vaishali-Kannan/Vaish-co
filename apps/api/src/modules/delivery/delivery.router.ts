import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { DeliveryMode } from '@prisma/client';
import * as deliveryService from './delivery.service';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

const eligibilitySchema = z.object({
  pincode: z.string().min(6).max(6),
  productIds: z.array(z.string()).min(1),
  mode: z.nativeEnum(DeliveryMode),
});

router.post('/eligibility', asyncHandler(async (req: Request, res: Response) => {
  const { pincode, productIds, mode } = eligibilitySchema.parse(req.body);
  const result = await deliveryService.checkDeliveryEligibility(pincode, productIds, mode);
  res.json({ success: true, data: result });
}));

router.get('/options', asyncHandler(async (req: Request, res: Response) => {
  const { pincode, products } = z.object({
    pincode: z.string().min(6).max(6),
    products: z.string(),
  }).parse(req.query);
  
  const productIds = products.split(',');
  const result = await deliveryService.getDeliveryOptions(pincode, productIds);
  res.json({ success: true, data: result });
}));

export default router;
