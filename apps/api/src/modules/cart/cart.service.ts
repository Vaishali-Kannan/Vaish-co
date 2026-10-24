import prisma from '../../config/database';
import { AppError, NotFoundError } from '../../middleware/errorHandler';
import { Prisma, DeliveryMode } from '@prisma/client';

export async function getCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              basePrice: true,
              salePrice: true,
              discountPercent: true,
              deliveryModes: true,
              returnEligible: true,
              images: { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
              inventory: { select: { quantity: true, reservedQty: true } },
            },
          },
          variant: true,
        },
      },
    },
  });

  if (!cart) throw new NotFoundError('Cart');
  return enrichCart(cart);
}

function enrichCart(cart: any) {
  const items = cart.items.map((item: any) => {
    const effectivePrice = item.product.salePrice ?? item.product.basePrice;
    const variantOffset = item.variant?.priceOffset ?? new Prisma.Decimal(0);
    const unitPrice = new Prisma.Decimal(effectivePrice).add(variantOffset);
    const totalPrice = unitPrice.mul(item.quantity);
    const originalPrice = new Prisma.Decimal(item.product.basePrice).add(variantOffset);
    const savings = originalPrice.sub(unitPrice).mul(item.quantity);

    return {
      ...item,
      unitPrice: unitPrice.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      originalUnitPrice: originalPrice.toFixed(2),
      savings: savings.isPositive() ? savings.toFixed(2) : '0.00',
      isInStock: (item.product.inventory?.quantity ?? 0) - (item.product.inventory?.reservedQty ?? 0) >= item.quantity,
    };
  });

  const subtotal = items.reduce((sum: Prisma.Decimal, item: any) => sum.add(item.totalPrice), new Prisma.Decimal(0));
  const totalSavings = items.reduce((sum: Prisma.Decimal, item: any) => sum.add(item.savings), new Prisma.Decimal(0));

  return {
    ...cart,
    items,
    summary: {
      itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      subtotal: subtotal.toFixed(2),
      totalSavings: totalSavings.toFixed(2),
    },
  };
}

export async function addToCart(userId: string, productId: string, variantId: string | null, quantity: number) {
  // Validate product exists and is available
  const product = await prisma.product.findUnique({
    where: { id: productId, isPublished: true },
    include: {
      inventory: true,
      variants: variantId ? { where: { id: variantId, isActive: true } } : false,
    },
  });

  if (!product) throw new NotFoundError('Product');
  if (variantId && (!product.variants || product.variants.length === 0)) {
    throw new AppError('Invalid product variant', 400);
  }

  const availableQty = (product.inventory?.quantity ?? 0) - (product.inventory?.reservedQty ?? 0);
  if (availableQty < quantity) {
    throw new AppError(`Only ${availableQty} items available in stock`, 400);
  }

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new NotFoundError('Cart');

  // Upsert cart item
  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_productId_variantId: {
        cartId: cart.id,
        productId,
        variantId: variantId ?? '',
      },
    },
  });

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > availableQty) throw new AppError(`Only ${availableQty} items available`, 400);
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, variantId, quantity },
    });
  }

  return getCart(userId);
}

export async function updateCartItem(userId: string, itemId: string, quantity: number) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new NotFoundError('Cart');

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { product: { include: { inventory: true } } },
  });

  if (!item) throw new NotFoundError('Cart item');

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    const availableQty = (item.product.inventory?.quantity ?? 0) - (item.product.inventory?.reservedQty ?? 0);
    if (quantity > availableQty) throw new AppError(`Only ${availableQty} items available`, 400);
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }

  return getCart(userId);
}

export async function removeFromCart(userId: string, itemId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new NotFoundError('Cart');

  await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
  return getCart(userId);
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}
