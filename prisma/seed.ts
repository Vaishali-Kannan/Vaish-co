import { PrismaClient, DeliveryMode, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Vaish&Co. database...');

  // ─── Clean up ─────────────────────────────────────────────────────────────
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.rewardTransaction.deleteMany();
  await prisma.rewardAccount.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.storeSettings.deleteMany();

  console.log('🗑️  Database cleaned');

  // ─── Categories ───────────────────────────────────────────────────────────
  const beautyCategory = await prisma.category.create({
    data: {
      name: 'Beauty & Skincare',
      slug: 'beauty',
      description: 'Premium skincare, makeup, haircare, and personal care products',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      sortOrder: 1,
    },
  });

  const fashionCategory = await prisma.category.create({
    data: {
      name: 'Fashion & Lifestyle',
      slug: 'fashion',
      description: 'Clothing, accessories, and lifestyle products for every occasion',
      imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
      sortOrder: 2,
    },
  });

  const techCategory = await prisma.category.create({
    data: {
      name: 'Electronics & Tech',
      slug: 'technology',
      description: 'Gadgets, electronics, and tech accessories',
      imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
      sortOrder: 3,
    },
  });

  const groceryCategory = await prisma.category.create({
    data: {
      name: 'Grocery & Fresh',
      slug: 'grocery',
      description: 'Fresh produce, pantry essentials, and daily grocery needs',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      sortOrder: 4,
    },
  });

  const homeCategory = await prisma.category.create({
    data: {
      name: 'Home & Living',
      slug: 'home',
      description: 'Home decor, furniture, and everyday living essentials',
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      sortOrder: 5,
    },
  });

  const essentialsCategory = await prisma.category.create({
    data: {
      name: 'Everyday Essentials',
      slug: 'essentials',
      description: 'Daily necessities and personal care must-haves',
      imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400',
      sortOrder: 6,
    },
  });

  // Subcategories
  await prisma.category.createMany({
    data: [
      { name: 'Skincare', slug: 'skincare', parentId: beautyCategory.id, sortOrder: 1 },
      { name: 'Haircare', slug: 'haircare', parentId: beautyCategory.id, sortOrder: 2 },
      { name: 'Makeup', slug: 'makeup', parentId: beautyCategory.id, sortOrder: 3 },
      { name: 'Wireless Audio', slug: 'audio', parentId: techCategory.id, sortOrder: 1 },
      { name: 'Smart Gadgets', slug: 'gadgets', parentId: techCategory.id, sortOrder: 2 },
      { name: 'Accessories', slug: 'accessories', parentId: fashionCategory.id, sortOrder: 1 },
    ],
  });

  console.log('✅ Categories created');

  // ─── Brands ───────────────────────────────────────────────────────────────
  const brands = await Promise.all([
    prisma.brand.create({ data: { name: 'Minimalist', slug: 'minimalist', description: 'Evidence-based skincare' } }),
    prisma.brand.create({ data: { name: 'Plum', slug: 'plum', description: 'Goodness of nature' } }),
    prisma.brand.create({ data: { name: 'Dot & Key', slug: 'dot-and-key', description: 'Modern skincare solutions' } }),
    prisma.brand.create({ data: { name: 'Sony', slug: 'sony', description: 'Premium audio & electronics' } }),
    prisma.brand.create({ data: { name: 'boAt', slug: 'boat', description: 'Affordable audio for Indians' } }),
    prisma.brand.create({ data: { name: 'Noise', slug: 'noise', description: 'Smart wearables' } }),
    prisma.brand.create({ data: { name: 'Mamaearth', slug: 'mamaearth', description: 'Natural & toxin-free' } }),
    prisma.brand.create({ data: { name: 'WOW Skin Science', slug: 'wow-skin-science', description: 'Nature-powered formulas' } }),
    prisma.brand.create({ data: { name: 'H&M', slug: 'h-and-m', description: 'Affordable fashion' } }),
    prisma.brand.create({ data: { name: 'Puma', slug: 'puma', description: 'Sport-inspired lifestyle brand' } }),
  ]);

  const [minimalist, plum, dotAndKey, sony, boat, noise, mamaearth, wow, hm, puma] = brands;
  console.log('✅ Brands created');

  // ─── Products ─────────────────────────────────────────────────────────────

  async function createProduct(data: {
    name: string;
    slug: string;
    description: string;
    shortDescription?: string;
    sku: string;
    categoryId: string;
    brandId?: string;
    basePrice: number;
    salePrice?: number;
    discountPercent?: number;
    deliveryModes: DeliveryMode[];
    tags: string[];
    isPublished?: boolean;
    isFeatured?: boolean;
    isBestseller?: boolean;
    isNewArrival?: boolean;
    returnEligible?: boolean;
    stockQuantity: number;
    avgRating?: number;
    reviewCount?: number;
    images: { url: string; altText?: string; isPrimary: boolean; sortOrder: number }[];
    attributes?: { key: string; value: string; sortOrder: number }[];
  }) {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription,
        sku: data.sku,
        categoryId: data.categoryId,
        brandId: data.brandId,
        basePrice: data.basePrice,
        salePrice: data.salePrice,
        discountPercent: data.discountPercent,
        deliveryModes: data.deliveryModes,
        tags: data.tags,
        isPublished: data.isPublished ?? true,
        isFeatured: data.isFeatured ?? false,
        isBestseller: data.isBestseller ?? false,
        isNewArrival: data.isNewArrival ?? false,
        returnEligible: data.returnEligible ?? true,
        avgRating: data.avgRating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        images: { create: data.images },
        attributes: data.attributes ? { create: data.attributes } : undefined,
      },
    });

    await prisma.inventory.create({
      data: { productId: product.id, quantity: data.stockQuantity },
    });

    return product;
  }

  // Beauty products
  const niacinamide = await createProduct({
    name: 'Minimalist 10% Niacinamide Serum',
    slug: 'minimalist-10-niacinamide-serum',
    description: 'Highly effective niacinamide serum that targets multiple skin concerns — pores, uneven skin tone, fine lines, and dullness. Formulated with 10% Niacinamide and 1% Zinc PCA for balanced, clearer skin.',
    shortDescription: 'Reduces pores & balances skin tone',
    sku: 'MIN-NIA-001',
    categoryId: beautyCategory.id,
    brandId: minimalist.id,
    basePrice: 599,
    salePrice: 399,
    discountPercent: 33,
    deliveryModes: [DeliveryMode.QUICK, DeliveryMode.FAST, DeliveryMode.STANDARD],
    tags: ['skincare', 'serum', 'niacinamide', 'pore-minimizing', 'anti-aging'],
    isFeatured: true,
    isBestseller: true,
    stockQuantity: 150,
    avgRating: 4.6,
    reviewCount: 1284,
    images: [
      { url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600', altText: 'Minimalist Niacinamide Serum', isPrimary: true, sortOrder: 0 },
    ],
    attributes: [
      { key: 'Volume', value: '30ml', sortOrder: 0 },
      { key: 'Skin Type', value: 'All skin types', sortOrder: 1 },
      { key: 'Key Ingredient', value: '10% Niacinamide + 1% Zinc PCA', sortOrder: 2 },
    ],
  });

  const vitaminC = await createProduct({
    name: 'Plum 15% Vitamin C Face Serum',
    slug: 'plum-vitamin-c-face-serum',
    description: 'Brightening vitamin C serum with 15% ethyl ascorbic acid that fades dark spots, boosts radiance, and protects skin from environmental damage. Fragrance-free and suitable for sensitive skin.',
    shortDescription: 'Brightens & fades dark spots',
    sku: 'PLM-VTC-001',
    categoryId: beautyCategory.id,
    brandId: plum.id,
    basePrice: 799,
    salePrice: 549,
    discountPercent: 31,
    deliveryModes: [DeliveryMode.FAST, DeliveryMode.STANDARD],
    tags: ['skincare', 'serum', 'vitamin-c', 'brightening', 'anti-oxidant'],
    isFeatured: true,
    isBestseller: true,
    stockQuantity: 89,
    avgRating: 4.4,
    reviewCount: 763,
    images: [
      { url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600', altText: 'Plum Vitamin C Serum', isPrimary: true, sortOrder: 0 },
    ],
    attributes: [
      { key: 'Volume', value: '30ml', sortOrder: 0 },
      { key: 'Skin Type', value: 'All skin types, especially sensitive', sortOrder: 1 },
    ],
  });

  const spf = await createProduct({
    name: 'Dot & Key Waterlight Sunscreen SPF 50',
    slug: 'dot-key-waterlight-sunscreen-spf50',
    description: 'Ultra-lightweight, non-greasy sunscreen with SPF 50 PA+++ protection. Absorbs instantly, leaves no white cast, and provides long-lasting UVA/UVB protection with a subtle hydrating finish.',
    shortDescription: 'SPF 50 PA+++ lightweight protection',
    sku: 'DNK-SPF-001',
    categoryId: beautyCategory.id,
    brandId: dotAndKey.id,
    basePrice: 649,
    deliveryModes: [DeliveryMode.QUICK, DeliveryMode.FAST, DeliveryMode.STANDARD],
    tags: ['skincare', 'sunscreen', 'spf', 'daily-care'],
    isNewArrival: true,
    stockQuantity: 200,
    avgRating: 4.7,
    reviewCount: 521,
    images: [
      { url: 'https://images.unsplash.com/photo-1629198735660-e39ea93f5c18?w=600', altText: 'Dot & Key Sunscreen', isPrimary: true, sortOrder: 0 },
    ],
    attributes: [
      { key: 'SPF', value: '50 PA+++', sortOrder: 0 },
      { key: 'Volume', value: '50ml', sortOrder: 1 },
      { key: 'Finish', value: 'Matte', sortOrder: 2 },
    ],
  });

  // Electronics products
  const sonyWH1000 = await createProduct({
    name: 'Sony WH-1000XM5 Wireless Headphones',
    slug: 'sony-wh-1000xm5-headphones',
    description: 'Industry-leading noise cancellation headphones with 30-hour battery life, multipoint connection for two devices, and crystal-clear hands-free calling. The WH-1000XM5 redefines the listening experience.',
    shortDescription: 'Industry-leading noise cancellation',
    sku: 'SNY-WH5-001',
    categoryId: techCategory.id,
    brandId: sony.id,
    basePrice: 29990,
    salePrice: 22990,
    discountPercent: 23,
    deliveryModes: [DeliveryMode.FAST, DeliveryMode.STANDARD],
    tags: ['headphones', 'wireless', 'noise-cancellation', 'audio', 'premium'],
    isFeatured: true,
    isBestseller: true,
    stockQuantity: 45,
    avgRating: 4.8,
    reviewCount: 2341,
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', altText: 'Sony WH-1000XM5 Headphones', isPrimary: true, sortOrder: 0 },
    ],
    attributes: [
      { key: 'Battery Life', value: '30 hours', sortOrder: 0 },
      { key: 'Connectivity', value: 'Bluetooth 5.2', sortOrder: 1 },
      { key: 'Noise Cancellation', value: 'Industry-leading ANC', sortOrder: 2 },
      { key: 'Weight', value: '250g', sortOrder: 3 },
    ],
  });

  const boatAirdopes = await createProduct({
    name: 'boAt Airdopes 141 True Wireless Earbuds',
    slug: 'boat-airdopes-141-earbuds',
    description: 'True wireless earbuds with 42 hours of total playback, 10mm drivers for powerful bass, and IPX4 water resistance. ASAP Charge technology gives 75 minutes playback in just 5 minutes of charging.',
    shortDescription: '42H total playback, ASAP Charge',
    sku: 'BOT-AD141-001',
    categoryId: techCategory.id,
    brandId: boat.id,
    basePrice: 2499,
    salePrice: 999,
    discountPercent: 60,
    deliveryModes: [DeliveryMode.QUICK, DeliveryMode.FAST, DeliveryMode.STANDARD],
    tags: ['earbuds', 'wireless', 'tws', 'budget', 'bass'],
    isFeatured: true,
    isBestseller: true,
    stockQuantity: 350,
    avgRating: 4.2,
    reviewCount: 8921,
    images: [
      { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600', altText: 'boAt Airdopes 141', isPrimary: true, sortOrder: 0 },
    ],
    attributes: [
      { key: 'Total Battery', value: '42 hours', sortOrder: 0 },
      { key: 'Driver Size', value: '10mm', sortOrder: 1 },
      { key: 'Water Resistance', value: 'IPX4', sortOrder: 2 },
    ],
  });

  const noiseWatch = await createProduct({
    name: 'Noise ColorFit Pro 5 Smart Watch',
    slug: 'noise-colorfit-pro-5-smartwatch',
    description: 'Advanced smartwatch with 1.96" AMOLED Always-On Display, 7-day battery life, 100+ sports modes, SpO2 monitoring, and Bluetooth calling. Bharat\'s #1 Smart Watch brand.',
    shortDescription: 'AMOLED display, 7-day battery, BT calling',
    sku: 'NSE-CFP5-001',
    categoryId: techCategory.id,
    brandId: noise.id,
    basePrice: 4999,
    salePrice: 2499,
    discountPercent: 50,
    deliveryModes: [DeliveryMode.FAST, DeliveryMode.STANDARD],
    tags: ['smartwatch', 'wearable', 'fitness', 'amoled', 'bluetooth-calling'],
    isNewArrival: true,
    isFeatured: true,
    stockQuantity: 120,
    avgRating: 4.3,
    reviewCount: 3421,
    images: [
      { url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600', altText: 'Noise ColorFit Pro 5', isPrimary: true, sortOrder: 0 },
    ],
    attributes: [
      { key: 'Display', value: '1.96" AMOLED AOD', sortOrder: 0 },
      { key: 'Battery Life', value: '7 days', sortOrder: 1 },
      { key: 'Sports Modes', value: '100+', sortOrder: 2 },
    ],
  });

  // Fashion products
  const pumaHoodie = await createProduct({
    name: 'Puma Essential Logo Hoodie',
    slug: 'puma-essential-logo-hoodie',
    description: 'Classic Puma hoodie crafted from premium cotton blend for all-day comfort. Features the iconic Puma Cat logo, kangaroo pocket, and drawstring hood. Perfect for casual days and light workouts.',
    shortDescription: 'Premium cotton, classic Puma style',
    sku: 'PMA-HDD-001',
    categoryId: fashionCategory.id,
    brandId: puma.id,
    basePrice: 3499,
    salePrice: 2099,
    discountPercent: 40,
    deliveryModes: [DeliveryMode.FAST, DeliveryMode.STANDARD],
    tags: ['fashion', 'hoodie', 'puma', 'casual', 'cotton'],
    isBestseller: true,
    stockQuantity: 75,
    avgRating: 4.5,
    reviewCount: 432,
    images: [
      { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', altText: 'Puma Essential Hoodie', isPrimary: true, sortOrder: 0 },
    ],
    attributes: [
      { key: 'Material', value: '80% Cotton, 20% Polyester', sortOrder: 0 },
      { key: 'Fit', value: 'Regular', sortOrder: 1 },
    ],
  });

  const hmDress = await createProduct({
    name: 'H&M Floral Wrap Midi Dress',
    slug: 'hm-floral-wrap-midi-dress',
    description: 'Elegant floral wrap dress in viscose blend fabric that drapes beautifully. Features a V-neckline, tie waist, and midi length. Perfect for both casual outings and semi-formal occasions.',
    shortDescription: 'Elegant floral wrap dress, midi length',
    sku: 'HM-FWD-001',
    categoryId: fashionCategory.id,
    brandId: hm.id,
    basePrice: 2499,
    salePrice: 1699,
    discountPercent: 32,
    deliveryModes: [DeliveryMode.STANDARD],
    tags: ['fashion', 'dress', 'floral', 'midi', 'women'],
    isNewArrival: true,
    stockQuantity: 60,
    avgRating: 4.1,
    reviewCount: 187,
    images: [
      { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600', altText: 'H&M Floral Wrap Dress', isPrimary: true, sortOrder: 0 },
    ],
    attributes: [
      { key: 'Material', value: 'Viscose Blend', sortOrder: 0 },
      { key: 'Neckline', value: 'V-neck', sortOrder: 1 },
      { key: 'Length', value: 'Midi', sortOrder: 2 },
    ],
  });

  // Home products
  const aromaDiffuser = await createProduct({
    name: 'Aromatherapy Essential Oil Diffuser',
    slug: 'aromatherapy-essential-oil-diffuser',
    description: 'Ultrasonic aromatherapy diffuser with 300ml capacity, 7 color LED mood lights, and whisper-quiet operation. Creates a spa-like atmosphere with your favorite essential oils. Auto shut-off for safety.',
    shortDescription: '300ml, 7 LED colors, ultra-quiet',
    sku: 'HOME-AOD-001',
    categoryId: homeCategory.id,
    basePrice: 1299,
    salePrice: 799,
    discountPercent: 38,
    deliveryModes: [DeliveryMode.FAST, DeliveryMode.STANDARD],
    tags: ['home', 'diffuser', 'aromatherapy', 'wellness', 'decor'],
    isFeatured: true,
    stockQuantity: 100,
    avgRating: 4.4,
    reviewCount: 678,
    images: [
      { url: 'https://images.unsplash.com/photo-1611072965735-79a4f5f35c53?w=600', altText: 'Aromatherapy Diffuser', isPrimary: true, sortOrder: 0 },
    ],
    attributes: [
      { key: 'Capacity', value: '300ml', sortOrder: 0 },
      { key: 'LED Colors', value: '7', sortOrder: 1 },
      { key: 'Timer', value: '1/3/6 hour settings', sortOrder: 2 },
    ],
  });

  const ceramicMug = await createProduct({
    name: 'Nordic Minimalist Ceramic Mug Set',
    slug: 'nordic-minimalist-ceramic-mug-set',
    description: 'Set of 2 handcrafted ceramic mugs with a Nordic-inspired minimalist design. Microwave and dishwasher safe, with a generous 350ml capacity. Perfect for morning coffee or evening tea rituals.',
    shortDescription: 'Set of 2, 350ml, microwave safe',
    sku: 'HOME-CMG-001',
    categoryId: homeCategory.id,
    basePrice: 799,
    salePrice: 499,
    discountPercent: 38,
    deliveryModes: [DeliveryMode.FAST, DeliveryMode.STANDARD],
    tags: ['home', 'mug', 'ceramic', 'kitchen', 'gift'],
    isNewArrival: true,
    stockQuantity: 200,
    avgRating: 4.6,
    reviewCount: 234,
    images: [
      { url: 'https://images.unsplash.com/photo-1564126872576-c5e7e4a17e3e?w=600', altText: 'Nordic Ceramic Mug Set', isPrimary: true, sortOrder: 0 },
    ],
    attributes: [
      { key: 'Capacity', value: '350ml', sortOrder: 0 },
      { key: 'Set Contents', value: '2 mugs', sortOrder: 1 },
      { key: 'Care', value: 'Microwave & Dishwasher Safe', sortOrder: 2 },
    ],
  });

  // Grocery products
  const organicOats = await createProduct({
    name: "True Elements Rolled Oats",
    slug: 'true-elements-rolled-oats',
    description: 'Premium whole grain rolled oats made from 100% natural oats. High in fiber, protein, and beta-glucan. No added preservatives, colors, or flavors. Perfect for a nutritious breakfast.',
    shortDescription: '100% natural, high-fiber breakfast oats',
    sku: 'GRO-OAT-001',
    categoryId: groceryCategory.id,
    basePrice: 399,
    salePrice: 299,
    discountPercent: 25,
    deliveryModes: [DeliveryMode.QUICK, DeliveryMode.FAST, DeliveryMode.STANDARD],
    tags: ['grocery', 'oats', 'breakfast', 'healthy', 'organic'],
    isNewArrival: true,
    stockQuantity: 500,
    avgRating: 4.5,
    reviewCount: 1120,
    images: [
      { url: 'https://images.unsplash.com/photo-1614961909320-4b87aae91bb3?w=600', altText: 'Rolled Oats', isPrimary: true, sortOrder: 0 },
    ],
    attributes: [
      { key: 'Weight', value: '500g', sortOrder: 0 },
      { key: 'Type', value: 'Rolled Oats', sortOrder: 1 },
      { key: 'Dietary', value: 'Gluten-Free Facility', sortOrder: 2 },
    ],
  });

  // Essentials
  const mamaearthShampoo = await createProduct({
    name: 'Mamaearth Onion Hair Fall Control Shampoo',
    slug: 'mamaearth-onion-hair-fall-shampoo',
    description: 'Powered by the goodness of onion oil and plant keratin, this shampoo controls hair fall and promotes hair growth. Toxin-free formula with no sulfates, parabens, or mineral oil.',
    shortDescription: 'Controls hair fall with onion oil',
    sku: 'MMA-SHP-001',
    categoryId: essentialsCategory.id,
    brandId: mamaearth.id,
    basePrice: 399,
    salePrice: 299,
    discountPercent: 25,
    deliveryModes: [DeliveryMode.QUICK, DeliveryMode.FAST, DeliveryMode.STANDARD],
    tags: ['haircare', 'shampoo', 'hair-fall', 'onion', 'natural'],
    isBestseller: true,
    stockQuantity: 300,
    avgRating: 4.3,
    reviewCount: 4521,
    images: [
      { url: 'https://images.unsplash.com/photo-1527799820374-87776da05fb8?w=600', altText: 'Mamaearth Onion Shampoo', isPrimary: true, sortOrder: 0 },
    ],
    attributes: [
      { key: 'Volume', value: '250ml', sortOrder: 0 },
      { key: 'Hair Type', value: 'All hair types', sortOrder: 1 },
      { key: 'Key Ingredient', value: 'Onion Oil + Plant Keratin', sortOrder: 2 },
    ],
  });

  const aloeVera = await createProduct({
    name: 'WOW Aloe Vera Multi-Use Gel',
    slug: 'wow-aloe-vera-multi-use-gel',
    description: 'Pure aloe vera gel with no parabens, mineral oil, or artificial fragrances. Use it as a soothing face gel, hair gel, after-shave balm, or moisturizer. Suitable for all skin and hair types.',
    shortDescription: 'Pure aloe vera, multi-use formula',
    sku: 'WOW-AVG-001',
    categoryId: essentialsCategory.id,
    brandId: wow.id,
    basePrice: 349,
    salePrice: 249,
    discountPercent: 29,
    deliveryModes: [DeliveryMode.QUICK, DeliveryMode.FAST, DeliveryMode.STANDARD],
    tags: ['skincare', 'aloe-vera', 'soothing', 'multi-use', 'natural'],
    isBestseller: true,
    isNewArrival: true,
    stockQuantity: 250,
    avgRating: 4.4,
    reviewCount: 2198,
    images: [
      { url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600', altText: 'WOW Aloe Vera Gel', isPrimary: true, sortOrder: 0 },
    ],
    attributes: [
      { key: 'Volume', value: '150ml', sortOrder: 0 },
      { key: 'Skin Type', value: 'All types', sortOrder: 1 },
      { key: 'Uses', value: 'Face, Hair, Body', sortOrder: 2 },
    ],
  });

  console.log('✅ Products created');

  // ─── Variants for key products ─────────────────────────────────────────────
  await prisma.productVariant.createMany({
    data: [
      { productId: pumaHoodie.id, name: 'Size', value: 'S', sku: 'PMA-HDD-001-S', stockQty: 15, priceOffset: 0 },
      { productId: pumaHoodie.id, name: 'Size', value: 'M', sku: 'PMA-HDD-001-M', stockQty: 20, priceOffset: 0 },
      { productId: pumaHoodie.id, name: 'Size', value: 'L', sku: 'PMA-HDD-001-L', stockQty: 25, priceOffset: 0 },
      { productId: pumaHoodie.id, name: 'Size', value: 'XL', sku: 'PMA-HDD-001-XL', stockQty: 15, priceOffset: 100 },
      { productId: hmDress.id, name: 'Size', value: 'XS', sku: 'HM-FWD-001-XS', stockQty: 10, priceOffset: 0 },
      { productId: hmDress.id, name: 'Size', value: 'S', sku: 'HM-FWD-001-S', stockQty: 15, priceOffset: 0 },
      { productId: hmDress.id, name: 'Size', value: 'M', sku: 'HM-FWD-001-M', stockQty: 20, priceOffset: 0 },
      { productId: hmDress.id, name: 'Size', value: 'L', sku: 'HM-FWD-001-L', stockQty: 15, priceOffset: 0 },
      { productId: sonyWH1000.id, name: 'Color', value: 'Black', sku: 'SNY-WH5-001-BLK', stockQty: 25, priceOffset: 0 },
      { productId: sonyWH1000.id, name: 'Color', value: 'Silver', sku: 'SNY-WH5-001-SLV', stockQty: 20, priceOffset: 0 },
    ],
  });

  console.log('✅ Product variants created');

  // ─── Users ────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const customerUser = await prisma.user.create({
    data: {
      email: 'demo@vaishandco.com',
      name: 'Demo Customer',
      phone: '+91 98765 43210',
      passwordHash,
      role: Role.CUSTOMER,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      cart: { create: {} },
      wishlist: { create: {} },
      rewardAccount: { create: { balance: 250, lifetimeEarned: 250 } },
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@vaishandco.com',
      name: 'Vaish Admin',
      passwordHash,
      role: Role.ADMIN,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      cart: { create: {} },
      wishlist: { create: {} },
      rewardAccount: { create: { balance: 0 } },
    },
  });

  console.log('✅ Users created');
  console.log('   📧 demo@vaishandco.com / Password123!');
  console.log('   🔐 admin@vaishandco.com / Password123!');

  // ─── Sample Reviews ────────────────────────────────────────────────────────
  await prisma.review.createMany({
    data: [
      {
        productId: niacinamide.id,
        userId: customerUser.id,
        rating: 5,
        title: 'Game changer for my skin!',
        body: 'Been using this for 3 months and my pores look visibly smaller. The texture of my skin has improved dramatically. Highly recommend!',
        status: 'APPROVED',
        isVerified: false,
      },
    ],
  });

  // ─── Store Settings ────────────────────────────────────────────────────────
  await prisma.storeSettings.createMany({
    data: [
      {
        key: 'announcement_bar',
        value: {
          messages: [
            '🎉 Free delivery on orders above ₹499!',
            '✨ Earn Vaish Coins on every purchase',
            '🚀 Quick delivery available in select areas',
            '💫 New arrivals every week!',
          ],
          isActive: true,
        },
      },
      {
        key: 'hero_banner',
        value: {
          headline: 'Good finds. Great feelings.',
          subheadline: 'From everyday essentials to little luxuries, discover products that make every day feel a little more you.',
          ctaText: 'Shop Now',
          ctaLink: '/products',
        },
      },
    ],
  });

  // ─── Coupons ──────────────────────────────────────────────────────────────
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        description: '10% off on your first order',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 299,
        maxDiscountAmount: 200,
        usageLimit: 1000,
        isActive: true,
        validFrom: new Date(),
      },
      {
        code: 'FLAT100',
        description: '₹100 off on orders above ₹999',
        discountType: 'FIXED',
        discountValue: 100,
        minOrderAmount: 999,
        isActive: true,
        validFrom: new Date(),
      },
    ],
  });

  console.log('✅ Store settings and coupons created');
  console.log('');
  console.log('🎉 Seeding complete! Vaish&Co. is ready.');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
