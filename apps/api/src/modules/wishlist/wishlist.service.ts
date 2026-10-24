import prisma from '../../config/database';
import { NotFoundError, AppError } from '../../middleware/errorHandler';

export async function getWishlist(userId: string) {
  const wishlist = await prisma.wishlist.findUnique({
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
              avgRating: true,
              reviewCount: true,
              deliveryModes: true,
              images: { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
              inventory: { select: { quantity: true, reservedQty: true } },
              brand: { select: { name: true } },
            },
          },
        },
        orderBy: { addedAt: 'desc' },
      },
    },
  });

  if (!wishlist) throw new NotFoundError('Wishlist');
  return wishlist;
}

export async function addToWishlist(userId: string, productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId, isPublished: true },
  });
  if (!product) throw new NotFoundError('Product');

  const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
  if (!wishlist) throw new NotFoundError('Wishlist');

  try {
    await prisma.wishlistItem.create({
      data: { wishlistId: wishlist.id, productId },
    });
  } catch (err: any) {
    if (err.code === 'P2002') {
      // Already in wishlist, that's fine
    } else {
      throw err;
    }
  }

  return getWishlist(userId);
}

export async function removeFromWishlist(userId: string, productId: string) {
  const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
  if (!wishlist) throw new NotFoundError('Wishlist');

  await prisma.wishlistItem.deleteMany({
    where: { wishlistId: wishlist.id, productId },
  });

  return getWishlist(userId);
}
