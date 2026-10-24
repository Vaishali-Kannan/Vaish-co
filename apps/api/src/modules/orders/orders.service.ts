import prisma from '../../config/database';
import { AppError, NotFoundError, ForbiddenError } from '../../middleware/errorHandler';
import { DeliveryMode, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import * as deliveryService from '../delivery/delivery.service';
import * as rewardsService from '../rewards/rewards.service';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `VC-${timestamp}-${random}`;
}

export async function quoteCheckout(userId: string, data: {
  addressId: string;
  deliveryMode: DeliveryMode;
  couponCode?: string;
  coinsToRedeem?: number;
}) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: { include: { inventory: true } },
          variant: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  const address = await prisma.address.findFirst({
    where: { id: data.addressId, userId },
  });
  if (!address) throw new NotFoundError('Address');

  // Validate stock
  for (const item of cart.items) {
    const available = (item.product.inventory?.quantity ?? 0) - (item.product.inventory?.reservedQty ?? 0);
    if (available < item.quantity) {
      throw new AppError(`"${item.product.name}" has insufficient stock (${available} available)`, 400);
    }
  }

  // Calculate subtotal (server-side, never trust client)
  let subtotal = new Prisma.Decimal(0);
  const lineItems = cart.items.map((item) => {
    const effectivePrice = item.product.salePrice ?? item.product.basePrice;
    const variantOffset = item.variant?.priceOffset ?? new Prisma.Decimal(0);
    const unitPrice = new Prisma.Decimal(effectivePrice).add(variantOffset);
    const lineTotal = unitPrice.mul(item.quantity);
    subtotal = subtotal.add(lineTotal);
    return {
      productId: item.productId,
      variantId: item.variantId,
      productName: item.product.name,
      variantLabel: item.variant ? `${item.variant.name}: ${item.variant.value}` : null,
      imageUrl: null as string | null, // filled below
      sku: item.product.sku || '',
      unitPrice: unitPrice.toFixed(2),
      quantity: item.quantity,
      totalPrice: lineTotal.toFixed(2),
    };
  });

  // Delivery fee
  const deliveryFee = deliveryService.getDeliveryFee(data.deliveryMode, parseFloat(subtotal.toFixed(2)));

  // Coupon discount
  let couponDiscount = new Prisma.Decimal(0);
  let couponId: string | null = null;
  if (data.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: data.couponCode.toUpperCase(), isActive: true },
    });
    if (coupon && (!coupon.validUntil || coupon.validUntil > new Date()) && coupon.validFrom <= new Date()) {
      if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
        if (coupon.discountType === 'PERCENTAGE') {
          couponDiscount = subtotal.mul(coupon.discountValue).div(100);
          if (coupon.maxDiscountAmount) {
            couponDiscount = Prisma.Decimal.min(couponDiscount, coupon.maxDiscountAmount);
          }
        } else {
          couponDiscount = coupon.discountValue;
        }
        couponId = coupon.id;
      }
    }
  }

  // Coin redemption
  let coinsRedeemed = 0;
  let coinRedemptionValue = new Prisma.Decimal(0);
  if (data.coinsToRedeem && data.coinsToRedeem > 0) {
    const quote = await rewardsService.quoteRedemption(
      userId,
      parseFloat(subtotal.toFixed(2)),
      data.coinsToRedeem
    );
    coinsRedeemed = quote.effectiveCoins;
    coinRedemptionValue = new Prisma.Decimal(quote.redemptionValue);
  }

  const total = subtotal
    .add(deliveryFee)
    .sub(couponDiscount)
    .sub(coinRedemptionValue);

  const finalTotal = Prisma.Decimal.max(total, new Prisma.Decimal(0));

  return {
    lineItems,
    subtotal: subtotal.toFixed(2),
    deliveryFee: deliveryFee.toFixed(2),
    couponDiscount: couponDiscount.toFixed(2),
    couponId,
    coinsRedeemed,
    coinRedemptionValue: coinRedemptionValue.toFixed(2),
    taxAmount: '0.00',
    total: finalTotal.toFixed(2),
    address,
    deliveryMode: data.deliveryMode,
  };
}

export async function createOrder(userId: string, data: {
  addressId: string;
  deliveryMode: DeliveryMode;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  coinsToRedeem?: number;
  notes?: string;
}) {
  const quote = await quoteCheckout(userId, {
    addressId: data.addressId,
    deliveryMode: data.deliveryMode,
    couponCode: data.couponCode,
    coinsToRedeem: data.coinsToRedeem,
  });

  return await prisma.$transaction(async (tx) => {
    // Re-check stock under transaction
    for (const item of quote.lineItems) {
      const inventory = await tx.inventory.findUnique({
        where: { productId: item.productId },
      });
      const available = (inventory?.quantity ?? 0) - (inventory?.reservedQty ?? 0);
      if (available < item.quantity) {
        throw new AppError(`"${item.productName}" stock changed. Please refresh your cart.`, 409);
      }
    }

    const address = await tx.address.findFirst({ where: { id: data.addressId, userId } });

    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        addressId: data.addressId,
        deliveryMode: data.deliveryMode,
        subtotal: quote.subtotal,
        deliveryFee: parseFloat(quote.deliveryFee),
        couponDiscount: parseFloat(quote.couponDiscount),
        coinRedemptionValue: parseFloat(quote.coinRedemptionValue),
        coinsRedeemed: quote.coinsRedeemed,
        taxAmount: 0,
        totalAmount: parseFloat(quote.total),
        paymentMethod: data.paymentMethod,
        couponCode: data.couponCode,
        notes: data.notes,
        addressSnapshot: address ? { ...address } : null,
        items: {
          create: quote.lineItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantLabel: item.variantLabel,
            sku: item.sku,
            unitPrice: parseFloat(item.unitPrice),
            quantity: item.quantity,
            totalPrice: parseFloat(item.totalPrice),
          })),
        },
      },
    });

    // Reserve inventory
    for (const item of quote.lineItems) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: { reservedQty: { increment: item.quantity } },
      });
    }

    // Deduct coins
    if (quote.coinsRedeemed > 0) {
      await rewardsService.redeemCoins(userId, order.id, quote.coinsRedeemed, tx);
    }

    // Record coupon usage
    if (quote.couponId) {
      await tx.coupon.update({
        where: { id: quote.couponId },
        data: { usageCount: { increment: 1 } },
      });
      await tx.couponRedemption.create({
        data: {
          couponId: quote.couponId,
          orderId: order.id,
          userId,
          discount: parseFloat(quote.couponDiscount),
        },
      });
    }

    // For COD, auto-confirm
    if (data.paymentMethod === 'COD') {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PENDING, // COD payment pending on delivery
          confirmedAt: new Date(),
        },
      });

      // Create payment record for COD
      await tx.payment.create({
        data: {
          orderId: order.id,
          provider: 'COD',
          status: PaymentStatus.PENDING,
          amount: parseFloat(quote.total),
          idempotencyKey: `cod-${order.id}`,
        },
      });

      // Clear cart
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return order;
  });
}

export async function getUserOrders(userId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                images: { where: { isPrimary: true }, take: 1, select: { url: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getOrderById(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payments: true,
      shipments: true,
      address: true,
    },
  });

  if (!order) throw new NotFoundError('Order');
  if (order.userId !== userId) throw new ForbiddenError();

  return order;
}

const CANCELLABLE_STATUSES = [OrderStatus.PENDING_PAYMENT, OrderStatus.CONFIRMED, OrderStatus.PROCESSING];

export async function cancelOrder(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) throw new NotFoundError('Order');
  if (order.userId !== userId) throw new ForbiddenError();
  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    throw new AppError(`Order cannot be cancelled in status: ${order.status}`, 400);
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED, cancelledAt: new Date() },
    });

    // Release reserved inventory
    for (const item of order.items) {
      await tx.inventory.updateMany({
        where: { productId: item.productId },
        data: { reservedQty: { decrement: item.quantity } },
      });
    }

    // Reverse coin redemption
    if (order.coinsRedeemed > 0) {
      await rewardsService.reverseRedemption(userId, orderId, order.coinsRedeemed, tx);
    }
  });
}

export async function requestReturn(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError('Order');
  if (order.userId !== userId) throw new ForbiddenError();
  if (order.status !== OrderStatus.DELIVERED) {
    throw new AppError('Return can only be requested for delivered orders', 400);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.RETURN_REQUESTED },
  });
}
