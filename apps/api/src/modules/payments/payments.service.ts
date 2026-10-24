import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../../config/database';
import env from '../../config/env';
import { AppError, NotFoundError } from '../../middleware/errorHandler';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import * as rewardsService from '../rewards/rewards.service';
import logger from '../../utils/logger';

let razorpay: Razorpay | null = null;

if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

export async function createPaymentOrder(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError('Order');
  if (order.userId !== userId) throw new AppError('Forbidden', 403);
  if (order.paymentStatus !== PaymentStatus.PENDING) {
    throw new AppError('Payment already processed for this order', 400);
  }

  const idempotencyKey = `rzp-${orderId}`;

  if (!razorpay) {
    // Development mode - return a mock payment order
    logger.warn('Razorpay not configured - returning demo payment order');
    const mockOrder = {
      id: `order_demo_${Date.now()}`,
      amount: Math.round(parseFloat(order.totalAmount.toString()) * 100),
      currency: 'INR',
      receipt: order.orderNumber,
      isDemoMode: true,
    };

    await prisma.payment.upsert({
      where: { idempotencyKey },
      create: {
        orderId,
        provider: 'RAZORPAY',
        providerOrderId: mockOrder.id,
        status: PaymentStatus.PENDING,
        amount: order.totalAmount,
        idempotencyKey,
        metadata: { isDemoMode: true },
      },
      update: { providerOrderId: mockOrder.id },
    });

    return { ...mockOrder, keyId: 'rzp_test_demo', isDemoMode: true };
  }

  // Real Razorpay integration
  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(parseFloat(order.totalAmount.toString()) * 100),
    currency: 'INR',
    receipt: order.orderNumber,
  });

  await prisma.payment.upsert({
    where: { idempotencyKey },
    create: {
      orderId,
      provider: 'RAZORPAY',
      providerOrderId: rzpOrder.id,
      status: PaymentStatus.PENDING,
      amount: order.totalAmount,
      idempotencyKey,
    },
    update: { providerOrderId: rzpOrder.id },
  });

  return { ...rzpOrder, keyId: env.RAZORPAY_KEY_ID };
}

export async function verifyPayment(data: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId: string;
}) {
  const order = await prisma.order.findUnique({ where: { id: data.orderId } });
  if (!order) throw new NotFoundError('Order');
  if (order.userId !== data.userId) throw new AppError('Forbidden', 403);

  const payment = await prisma.payment.findFirst({
    where: { orderId: data.orderId, providerOrderId: data.razorpayOrderId },
  });
  if (!payment) throw new NotFoundError('Payment record');

  // Check for demo mode
  const isDemoMode = (payment.metadata as any)?.isDemoMode;

  if (!isDemoMode) {
    // Verify signature
    if (!env.RAZORPAY_KEY_SECRET) throw new AppError('Payment verification not configured', 500);

    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== data.razorpaySignature) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED, failureReason: 'Signature verification failed' },
      });
      throw new AppError('Payment verification failed', 400);
    }
  }

  // Process successful payment
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.CAPTURED,
        providerPaymentId: data.razorpayPaymentId,
        capturedAt: new Date(),
      },
    });

    await tx.order.update({
      where: { id: data.orderId },
      data: {
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.CAPTURED,
        confirmedAt: new Date(),
      },
    });

    // Award coins
    const coinsEarned = await rewardsService.earnCoins(
      data.userId,
      data.orderId,
      parseFloat(order.totalAmount.toString()),
      tx
    );

    await tx.order.update({
      where: { id: data.orderId },
      data: { coinsEarned },
    });

    // Clear cart
    const cart = await tx.cart.findUnique({ where: { userId: data.userId } });
    if (cart) await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
  });

  return { success: true, orderId: data.orderId };
}

export async function handleWebhook(provider: string, payload: Buffer, signature: string) {
  if (provider !== 'razorpay') throw new AppError('Unknown provider', 400);

  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    logger.warn('Razorpay webhook secret not configured');
    return;
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new AppError('Invalid webhook signature', 400);
  }

  const event = JSON.parse(payload.toString());
  logger.info('Razorpay webhook received', { event: event.event });

  const payment = await prisma.payment.findFirst({
    where: { providerOrderId: event.payload?.payment?.entity?.order_id },
  });

  if (!payment) return;

  await prisma.paymentEvent.create({
    data: {
      paymentId: payment.id,
      eventType: event.event,
      payload: event,
    },
  });
}
