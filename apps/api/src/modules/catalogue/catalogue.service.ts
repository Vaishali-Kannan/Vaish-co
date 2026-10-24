import prisma from '../../config/database';
import { NotFoundError } from '../../middleware/errorHandler';
import { Prisma, DeliveryMode } from '@prisma/client';

export interface ProductFilters {
  categoryId?: string;
  categorySlug?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  deliveryMode?: DeliveryMode;
  tags?: string[];
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  onSale?: boolean;
  inStock?: boolean;
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export async function getCategories(parentId?: string | null) {
  return prisma.category.findMany({
    where: {
      isActive: true,
      parentId: parentId === undefined ? undefined : parentId,
    },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
      _count: { select: { products: { where: { isPublished: true } } } },
    },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug, isActive: true },
    include: {
      children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      parent: true,
    },
  });
  if (!category) throw new NotFoundError('Category');
  return category;
}

export async function getBrands() {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

function buildProductWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isPublished: true };

  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  } else if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.brandId) {
    where.brandId = filters.brandId;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.OR = [
      {
        salePrice: {
          gte: filters.minPrice ? new Prisma.Decimal(filters.minPrice) : undefined,
          lte: filters.maxPrice ? new Prisma.Decimal(filters.maxPrice) : undefined,
        },
      },
      {
        AND: [
          { salePrice: null },
          {
            basePrice: {
              gte: filters.minPrice ? new Prisma.Decimal(filters.minPrice) : undefined,
              lte: filters.maxPrice ? new Prisma.Decimal(filters.maxPrice) : undefined,
            },
          },
        ],
      },
    ];
  }

  if (filters.minRating !== undefined) {
    where.avgRating = { gte: new Prisma.Decimal(filters.minRating) };
  }

  if (filters.deliveryMode) {
    where.deliveryModes = { has: filters.deliveryMode };
  }

  if (filters.tags?.length) {
    where.tags = { hasSome: filters.tags };
  }

  if (filters.isNewArrival) where.isNewArrival = true;
  if (filters.isBestseller) where.isBestseller = true;
  if (filters.isFeatured) where.isFeatured = true;
  if (filters.onSale) where.salePrice = { not: null };

  if (filters.inStock) {
    where.inventory = { quantity: { gt: 0 } };
  }

  if (filters.search) {
    const searchTerm = filters.search.trim();
    where.OR = [
      ...(where.OR as Prisma.ProductWhereInput[] || []),
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { tags: { hasSome: [searchTerm.toLowerCase()] } },
      { brand: { name: { contains: searchTerm, mode: 'insensitive' } } },
      { sku: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  return where;
}

function buildProductOrderBy(sortBy?: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sortBy) {
    case 'price_asc':
      return [{ basePrice: 'asc' }];
    case 'price_desc':
      return [{ basePrice: 'desc' }];
    case 'rating':
      return [{ avgRating: 'desc' }];
    case 'reviews':
      return [{ reviewCount: 'desc' }];
    case 'newest':
      return [{ createdAt: 'desc' }];
    case 'bestselling':
      return [{ isBestseller: 'desc' }, { reviewCount: 'desc' }];
    case 'discount':
      return [{ discountPercent: { sort: 'desc', nulls: 'last' } }];
    default:
      return [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
  }
}

const productSelect = {
  id: true,
  slug: true,
  name: true,
  shortDescription: true,
  basePrice: true,
  salePrice: true,
  discountPercent: true,
  avgRating: true,
  reviewCount: true,
  deliveryModes: true,
  tags: true,
  isNewArrival: true,
  isBestseller: true,
  isFeatured: true,
  returnEligible: true,
  returnPeriodDays: true,
  category: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true } },
  images: {
    where: { isPrimary: true },
    select: { url: true, altText: true },
    take: 1,
  },
  inventory: { select: { quantity: true, reservedQty: true } },
};

export async function getProducts(filters: ProductFilters) {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 24));
  const skip = (page - 1) * limit;
  const where = buildProductWhere(filters);
  const orderBy = buildProductOrderBy(filters.sortBy);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productSelect,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isPublished: true },
    include: {
      category: { include: { parent: true } },
      brand: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { where: { isActive: true }, orderBy: [{ name: 'asc' }, { value: 'asc' }] },
      attributes: { orderBy: { sortOrder: 'asc' } },
      inventory: true,
      reviews: {
        where: { status: 'APPROVED' },
        include: { user: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
  if (!product) throw new NotFoundError('Product');
  return product;
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 8) {
  return prisma.product.findMany({
    where: {
      isPublished: true,
      categoryId,
      id: { not: productId },
    },
    select: productSelect,
    take: limit,
    orderBy: { avgRating: 'desc' },
  });
}

export async function getSearchSuggestions(query: string, limit = 8) {
  if (!query || query.length < 2) return [];

  const products = await prisma.product.findMany({
    where: {
      isPublished: true,
      name: { contains: query, mode: 'insensitive' },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      basePrice: true,
      salePrice: true,
    },
    take: limit,
  });

  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      name: { contains: query, mode: 'insensitive' },
    },
    select: { id: true, name: true, slug: true },
    take: 3,
  });

  const brands = await prisma.brand.findMany({
    where: {
      isActive: true,
      name: { contains: query, mode: 'insensitive' },
    },
    select: { id: true, name: true, slug: true },
    take: 3,
  });

  return { products, categories, brands };
}

export async function getFeaturedProducts(limit = 12) {
  return prisma.product.findMany({
    where: { isPublished: true, isFeatured: true },
    select: productSelect,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getBestsellerProducts(limit = 12) {
  return prisma.product.findMany({
    where: { isPublished: true, isBestseller: true },
    select: productSelect,
    take: limit,
    orderBy: { reviewCount: 'desc' },
  });
}

export async function getNewArrivals(limit = 12) {
  return prisma.product.findMany({
    where: { isPublished: true, isNewArrival: true },
    select: productSelect,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getHomepageData() {
  const [
    categories,
    featured,
    bestsellers,
    newArrivals,
    deals,
  ] = await Promise.all([
    getCategories(null),
    getFeaturedProducts(8),
    getBestsellerProducts(8),
    getNewArrivals(8),
    prisma.product.findMany({
      where: { isPublished: true, salePrice: { not: null } },
      select: productSelect,
      take: 8,
      orderBy: { discountPercent: { sort: 'desc', nulls: 'last' } },
    }),
  ]);

  return { categories, featured, bestsellers, newArrivals, deals };
}
