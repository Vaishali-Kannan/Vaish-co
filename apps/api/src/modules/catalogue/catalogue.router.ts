import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as catalogueService from './catalogue.service';
import { asyncHandler } from '../../middleware/errorHandler';
import { DeliveryMode } from '@prisma/client';

const router = Router();

const productQuerySchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  delivery: z.string().optional(),
  deliveryMode: z.string().optional(),
  tags: z.string().optional(),
  newArrival: z.coerce.boolean().optional(),
  bestseller: z.coerce.boolean().optional(),
  isBestseller: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  onSale: z.coerce.boolean().optional(),
  sale: z.coerce.boolean().optional(),
  inStock: z.coerce.boolean().optional(),
  search: z.string().max(200).optional(),
  sortBy: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(24),
});

router.get('/categories', asyncHandler(async (_req: Request, res: Response) => {
  const categories = await catalogueService.getCategories(null);
  res.json({ success: true, data: categories });
}));

router.get('/categories/:slug', asyncHandler(async (req: Request, res: Response) => {
  const category = await catalogueService.getCategoryBySlug(req.params.slug);
  res.json({ success: true, data: category });
}));

router.get('/brands', asyncHandler(async (_req: Request, res: Response) => {
  const brands = await catalogueService.getBrands();
  res.json({ success: true, data: brands });
}));

router.get('/products', asyncHandler(async (req: Request, res: Response) => {
  const query = productQuerySchema.parse(req.query);

  // Normalize sortBy
  let sortBy = query.sortBy;
  if (sortBy === 'featured') sortBy = 'relevance';
  if (sortBy === 'price-asc') sortBy = 'price_asc';
  if (sortBy === 'price-desc') sortBy = 'price_desc';

  const deliveryModeRaw = query.delivery || query.deliveryMode;
  const deliveryMode = ['QUICK', 'FAST', 'STANDARD'].includes(deliveryModeRaw as any)
    ? (deliveryModeRaw as DeliveryMode)
    : undefined;

  const result = await catalogueService.getProducts({
    categorySlug: query.category,
    brandId: query.brand,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    minRating: query.minRating,
    deliveryMode,
    tags: query.tags ? query.tags.split(',') : undefined,
    isNewArrival: query.newArrival,
    isBestseller: query.bestseller || query.isBestseller,
    isFeatured: query.featured || query.isFeatured,
    onSale: query.onSale || query.sale,
    inStock: query.inStock,
    search: query.search,
    sortBy,
    page: query.page,
    limit: query.limit,
  });
  res.json({ success: true, ...result });
}));

router.get('/products/homepage', asyncHandler(async (_req: Request, res: Response) => {
  const data = await catalogueService.getHomepageData();
  res.json({ success: true, data });
}));

router.get('/products/:slug', asyncHandler(async (req: Request, res: Response) => {
  const product = await catalogueService.getProductBySlug(req.params.slug);
  res.json({ success: true, data: product });
}));

router.get('/products/:id/related', asyncHandler(async (req: Request, res: Response) => {
  const product = await catalogueService.getProductBySlug(req.params.id);
  const related = await catalogueService.getRelatedProducts(product.id, product.categoryId);
  res.json({ success: true, data: related });
}));

router.get('/search/suggestions', asyncHandler(async (req: Request, res: Response) => {
  const q = z.string().min(1).max(200).parse(req.query.q);
  const suggestions = await catalogueService.getSearchSuggestions(q);
  res.json({ success: true, data: suggestions });
}));

export default router;
