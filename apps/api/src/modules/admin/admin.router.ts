import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../config/database';
import { authenticate, requireAdmin, requireSupport } from '../../middleware/auth';
import { asyncHandler, NotFoundError, AppError } from '../../middleware/errorHandler';
import { Prisma, OrderStatus, DeliveryMode } from '@prisma/client';

const router = Router();
router.use(authenticate, requireAdmin);

// Dashboard overview
router.get('/dashboard', asyncHandler(async (_req: Request, res: Response) => {
  const [
    totalOrders,
    pendingOrders,
    totalCustomers,
    lowStockProducts,
    recentOrders,
    topProducts,
    revenueData,
  ] = await Promise.all([
    prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
    prisma.order.count({ where: { status: { in: ['CONFIRMED', 'PROCESSING', 'PACKED'] } } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.inventory.findMany({
      where: { quantity: { lte: prisma.inventory.fields.lowStockThreshold } },
      include: { product: { select: { name: true, slug: true } } },
      take: 10,
    }),
    prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { items: true },
    }),
    prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    prisma.order.aggregate({
      where: {
        status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY'] },
        paymentStatus: 'CAPTURED',
      },
      _sum: { totalAmount: true },
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      pendingOrders,
      totalCustomers,
      revenue: revenueData._sum.totalAmount?.toFixed(2) ?? '0.00',
      lowStockProducts,
      recentOrders,
      topProducts,
    },
  });
}));

// Product management
router.get('/products', asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where: Prisma.ProductWhereInput = search
    ? { name: { contains: String(search), mode: 'insensitive' } }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        inventory: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ success: true, data: products, pagination: { page, limit, total } });
}));

const productSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  sku: z.string().min(1),
  categoryId: z.string().min(1),
  brandId: z.string().optional(),
  basePrice: z.number().positive(),
  salePrice: z.number().positive().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  deliveryModes: z.array(z.nativeEnum(DeliveryMode)).default(['STANDARD']),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  returnEligible: z.boolean().default(true),
  returnPeriodDays: z.number().int().min(0).default(7),
  stockQuantity: z.number().int().min(0).default(0),
  images: z.array(z.object({
    url: z.string().url(),
    altText: z.string().optional(),
    isPrimary: z.boolean().default(false),
    sortOrder: z.number().default(0),
  })).default([]),
  attributes: z.array(z.object({
    key: z.string(),
    value: z.string(),
    sortOrder: z.number().default(0),
  })).default([]),
});

router.post('/products', asyncHandler(async (req: Request, res: Response) => {
  const data = productSchema.parse(req.body);
  const { stockQuantity, images, attributes, ...productData } = data;

  const product = await prisma.$transaction(async (tx) => {
    const p = await tx.product.create({
      data: {
        ...productData,
        basePrice: productData.basePrice,
        salePrice: productData.salePrice,
        images: { create: images },
        attributes: { create: attributes },
      },
    });
    await tx.inventory.create({
      data: { productId: p.id, quantity: stockQuantity },
    });
    return p;
  });

  res.status(201).json({ success: true, data: product });
}));

router.patch('/products/:id', asyncHandler(async (req: Request, res: Response) => {
  const data = productSchema.partial().parse(req.body);
  const { stockQuantity, images, attributes, ...productData } = data as any;

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: productData,
  });

  if (stockQuantity !== undefined) {
    await prisma.inventory.upsert({
      where: { productId: req.params.id },
      create: { productId: req.params.id, quantity: stockQuantity },
      update: { quantity: stockQuantity },
    });
  }

  res.json({ success: true, data: product });
}));

router.delete('/products/:id', asyncHandler(async (req: Request, res: Response) => {
  await prisma.product.update({
    where: { id: req.params.id },
    data: { isPublished: false },
  });
  res.json({ success: true, message: 'Product archived' });
}));

// Order management
router.get('/orders', asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status: status as OrderStatus } : {}),
    ...(search ? { orderNumber: { contains: String(search) } } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ success: true, data: orders, pagination: { page, limit, total } });
}));

const VALID_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED'],
  SHIPPED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  RETURN_REQUESTED: ['RETURNED'],
  RETURNED: ['REFUNDED'],
};

router.patch('/orders/:id/status', asyncHandler(async (req: Request, res: Response) => {
  const { status } = z.object({ status: z.nativeEnum(OrderStatus) }).parse(req.body);
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) throw new NotFoundError('Order');

  const allowed = VALID_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(status)) {
    throw new AppError(`Invalid transition from ${order.status} to ${status}`, 400);
  }

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      status,
      ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
      ...(status === 'SHIPPED' ? { shippedAt: new Date() } : {}),
    },
  });

  // Award coins on delivery for COD orders
  if (status === 'DELIVERED' && order.paymentMethod === 'COD') {
    await prisma.rewardAccount.upsert({
      where: { userId: order.userId },
      create: { userId: order.userId, balance: 0 },
      update: {},
    });
    const coins = Math.floor(parseFloat(order.totalAmount.toString()) / 100);
    if (coins > 0) {
      await prisma.rewardAccount.update({
        where: { userId: order.userId },
        data: {
          balance: { increment: coins },
          lifetimeEarned: { increment: coins },
        },
      });
    }
  }

  res.json({ success: true, data: updated });
}));

// Customer management
router.get('/customers', asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true, email: true, name: true, phone: true, emailVerified: true,
        isActive: true, createdAt: true,
        _count: { select: { orders: true } },
        rewardAccount: { select: { balance: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
  ]);

  res.json({ success: true, data: customers, pagination: { page, limit, total } });
}));

// Inventory
router.get('/inventory', asyncHandler(async (_req: Request, res: Response) => {
  const inventory = await prisma.inventory.findMany({
    include: {
      product: {
        select: { name: true, sku: true, isPublished: true },
      },
    },
    orderBy: { quantity: 'asc' },
  });
  res.json({ success: true, data: inventory });
}));

router.patch('/inventory/:productId', asyncHandler(async (req: Request, res: Response) => {
  const { quantity } = z.object({ quantity: z.number().int().min(0) }).parse(req.body);
  const inventory = await prisma.inventory.upsert({
    where: { productId: req.params.productId },
    create: { productId: req.params.productId, quantity },
    update: { quantity },
  });
  res.json({ success: true, data: inventory });
}));

// Coupon management
router.get('/coupons', asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: coupons });
}));

const couponSchema = z.object({
  code: z.string().min(1).max(20).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().positive().optional(),
  maxDiscountAmount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  userUsageLimit: z.number().int().positive().default(1),
  isActive: z.boolean().default(true),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime().optional(),
});

router.post('/coupons', asyncHandler(async (req: Request, res: Response) => {
  const data = couponSchema.parse(req.body);
  const coupon = await prisma.coupon.create({ data: { ...data, validFrom: new Date(data.validFrom), validUntil: data.validUntil ? new Date(data.validUntil) : undefined } });
  res.status(201).json({ success: true, data: coupon });
}));

export default router;
