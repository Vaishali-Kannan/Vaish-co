import { PrismaClient, DeliveryMode } from '@prisma/client';

const prisma = new PrismaClient();

async function addInternetProducts() {
  console.log('🌐 Adding trending internet products to Vaish&Co...');

  // Ensure categories exist
  const beautyCat = await prisma.category.findUnique({ where: { slug: 'beauty' } });
  const techCat = await prisma.category.findUnique({ where: { slug: 'technology' } });
  const homeCat = await prisma.category.findUnique({ where: { slug: 'home' } });
  const fashionCat = await prisma.category.findUnique({ where: { slug: 'fashion' } });
  const groceryCat = await prisma.category.findUnique({ where: { slug: 'grocery' } });
  const essentialsCat = await prisma.category.findUnique({ where: { slug: 'essentials' } });

  // Add Brands if they don't exist
  const brandsData = [
    { name: 'Apple', slug: 'apple' },
    { name: 'Dyson', slug: 'dyson' },
    { name: 'Rare Beauty', slug: 'rare-beauty' },
    { name: 'Laneige', slug: 'laneige' },
    { name: 'Stanley', slug: 'stanley' },
    { name: 'Nespresso', slug: 'nespresso' },
    { name: 'Marshall', slug: 'marshall' },
    { name: 'Sol de Janeiro', slug: 'sol-de-janeiro' },
    { name: 'Glossier', slug: 'glossier' },
    { name: 'Amazon', slug: 'amazon' },
    { name: 'Zara', slug: 'zara' },
  ];

  const brandMap: Record<string, string> = {};
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: { name: b.name, slug: b.slug },
    });
    brandMap[b.slug] = brand.id;
  }

  const productsToAdd = [
    {
      name: 'Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)',
      slug: 'apple-airpods-pro-2nd-gen-usb-c',
      shortDescription: 'Active Noise Cancellation, Adaptive Audio & Personalized Spatial Audio',
      description: 'The Apple AirPods Pro (2nd Gen) feature up to 2x more Active Noise Cancellation, Transparency mode, and Adaptive Audio. With USB-C charging, precision finding with MagSafe case, and up to 30 hours of total listening time, they are the gold standard for audio on the go.',
      basePrice: 24900,
      salePrice: 20990,
      discountPercent: 16,
      sku: 'TECH-AIRPODS-PRO2',
      categoryId: techCat?.id,
      brandId: brandMap['apple'],
      deliveryModes: [DeliveryMode.QUICK, DeliveryMode.FAST, DeliveryMode.STANDARD],
      tags: ['apple', 'airpods', 'audio', 'noise-cancelling', 'tech', 'wireless'],
      isFeatured: true,
      isBestseller: true,
      isNewArrival: true,
      avgRating: 4.9,
      reviewCount: 3820,
      imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
      stock: 75,
    },
    {
      name: 'Rare Beauty Soft Pinch Liquid Blush (Hope - Nude Mauve)',
      slug: 'rare-beauty-soft-pinch-liquid-blush-hope',
      shortDescription: 'Weightless, long-lasting liquid blush that blends seamlessly for a soft, healthy flush',
      description: 'Rare Beauty by Selena Gomez Soft Pinch Liquid Blush is an airy, lightweight liquid formula that infuses cheeks with soft color. Long-wearing formula stays in place all day and blends effortlessly over liquid or powder formulas.',
      basePrice: 2400,
      salePrice: 2150,
      discountPercent: 10,
      sku: 'BEAUTY-RARE-BLUSH-HOPE',
      categoryId: beautyCat?.id,
      brandId: brandMap['rare-beauty'],
      deliveryModes: [DeliveryMode.QUICK, DeliveryMode.FAST, DeliveryMode.STANDARD],
      tags: ['rare-beauty', 'blush', 'makeup', 'viral', 'beauty', 'trending'],
      isFeatured: true,
      isBestseller: true,
      isNewArrival: true,
      avgRating: 4.8,
      reviewCount: 2450,
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80',
      stock: 120,
    },
    {
      name: 'Dyson Airwrap Multi-Styler Complete Long (Nickel/Copper)',
      slug: 'dyson-airwrap-multi-styler-complete-long',
      shortDescription: 'Curl, wave, smooth and dry with no extreme heat. Re-engineered styling barrels',
      description: 'Harnessing the Coanda aerodynamic effect, the Dyson Airwrap Complete Long attracts and wraps hair to the barrel using air, never extreme heat. Includes 30mm & 40mm Airwrap barrels, smoothing brushes, and Coanda smoothing dryer.',
      basePrice: 49900,
      salePrice: 45900,
      discountPercent: 8,
      sku: 'BEAUTY-DYSON-AIRWRAP-LONG',
      categoryId: beautyCat?.id,
      brandId: brandMap['dyson'],
      deliveryModes: [DeliveryMode.FAST, DeliveryMode.STANDARD],
      tags: ['dyson', 'hair-styler', 'luxury', 'beauty', 'haircare'],
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      avgRating: 4.9,
      reviewCount: 1890,
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      stock: 30,
    },
    {
      name: 'Laneige Lip Sleeping Mask (Berry, 20g)',
      slug: 'laneige-lip-sleeping-mask-berry',
      shortDescription: 'Nourishing leave-on lip mask with Berry Fruit Complex, Vitamin C, & Coconut Oil',
      description: 'The cult-favorite Laneige Lip Sleeping Mask delivers intense moisture and antioxidants while you sleep with its Moisture Wrap technology and Berry Fruit Complex. Wake up to supple, smooth, baby-soft lips.',
      basePrice: 1420,
      salePrice: 1150,
      discountPercent: 19,
      sku: 'BEAUTY-LANEIGE-LIP-BERRY',
      categoryId: beautyCat?.id,
      brandId: brandMap['laneige'],
      deliveryModes: [DeliveryMode.QUICK, DeliveryMode.FAST, DeliveryMode.STANDARD],
      tags: ['laneige', 'lip-care', 'k-beauty', 'skincare', 'bestseller'],
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      avgRating: 4.8,
      reviewCount: 5410,
      imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80',
      stock: 200,
    },
    {
      name: 'Stanley Quencher H2.0 FlowState Tumbler (40 oz, Rose Quartz)',
      slug: 'stanley-quencher-flowstate-tumbler-40oz-rose',
      shortDescription: 'Double-wall vacuum insulation, recycled stainless steel with comfort-grip handle',
      description: 'The viral Stanley Quencher H2.0 FlowState 40oz Tumbler keeps drinks icy cold for up to 48 hours. Features the advanced 3-position lid, reusable straw, and slim base that fits into car cup holders effortlessly.',
      basePrice: 4299,
      salePrice: 3499,
      discountPercent: 18,
      sku: 'HOME-STANLEY-TUMBLER-40OZ',
      categoryId: homeCat?.id,
      brandId: brandMap['stanley'],
      deliveryModes: [DeliveryMode.FAST, DeliveryMode.STANDARD],
      tags: ['stanley', 'tumbler', 'lifestyle', 'hydration', 'aesthetic'],
      isFeatured: true,
      isBestseller: true,
      isNewArrival: true,
      avgRating: 4.7,
      reviewCount: 3120,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      stock: 85,
    },
    {
      name: 'Marshall Emberton II Portable Bluetooth Speaker (Black & Brass)',
      slug: 'marshall-emberton-ii-speaker-black-brass',
      shortDescription: 'Iconic Marshall design, 30+ hours of playtime, IP67 dust and water resistance',
      description: 'Emberton II delivers sound that is rich, clear, and loud, like Marshall intended. Experience absolute 360° sound with True Stereophonic, a unique multi-directional sound from Marshall.',
      basePrice: 17999,
      salePrice: 14999,
      discountPercent: 17,
      sku: 'TECH-MARSHALL-EMBERTON2',
      categoryId: techCat?.id,
      brandId: brandMap['marshall'],
      deliveryModes: [DeliveryMode.FAST, DeliveryMode.STANDARD],
      tags: ['marshall', 'speaker', 'bluetooth', 'audio', 'vintage-design'],
      isFeatured: true,
      isBestseller: false,
      isNewArrival: true,
      avgRating: 4.8,
      reviewCount: 940,
      imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
      stock: 40,
    },
    {
      name: 'Sol de Janeiro Brazilian Bum Bum Cream (240ml)',
      slug: 'sol-de-janeiro-brazilian-bum-bum-cream-240ml',
      shortDescription: 'Award-winning body cream infused with Guaraná and Cheirosa 62 pistachio & salted caramel scent',
      description: 'A fast-absorbing body cream that helps visibly tighten the look of skin. Infused with caffeine-rich Guaraná extract and Cupuaçu butter for ultra-moisturizing hydration and the iconic gourmand fragrance.',
      basePrice: 4200,
      salePrice: 3650,
      discountPercent: 13,
      sku: 'BEAUTY-SOL-BUMBUM-240',
      categoryId: beautyCat?.id,
      brandId: brandMap['sol-de-janeiro'],
      deliveryModes: [DeliveryMode.QUICK, DeliveryMode.FAST, DeliveryMode.STANDARD],
      tags: ['sol-de-janeiro', 'body-cream', 'bum-bum', 'beauty', 'fragrance'],
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      avgRating: 4.9,
      reviewCount: 4210,
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
      stock: 90,
    },
    {
      name: 'Kindle Paperwhite (16 GB) 6.8" Glare-Free Display with Adjustable Warm Light',
      slug: 'kindle-paperwhite-16gb-warm-light',
      shortDescription: 'Now with a 6.8" display, thinner borders, up to 10 weeks battery life, and 20% faster page turns',
      description: 'Purpose-built for reading with a flush-front design and 300 ppi glare-free display that reads like real paper, even in bright sunlight. Adjustable warm light to shift screen shade from white to amber.',
      basePrice: 14999,
      salePrice: 12999,
      discountPercent: 13,
      sku: 'TECH-KINDLE-PW-16GB',
      categoryId: techCat?.id,
      brandId: brandMap['amazon'],
      deliveryModes: [DeliveryMode.FAST, DeliveryMode.STANDARD],
      tags: ['kindle', 'ereader', 'books', 'amazon', 'tech'],
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      avgRating: 4.8,
      reviewCount: 3100,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      stock: 60,
    },
    {
      name: 'Zara Premium Silk Blend Cami Slip Dress (Blush Pink)',
      slug: 'zara-silk-blend-cami-slip-dress-blush',
      shortDescription: 'Flowy A-line midi dress with delicate spaghetti straps and cowl neckline in blush pink',
      description: 'A timeless silhouette tailored in a lustrous silk blend. Features a cowl neckline, adjustable crossover straps at the back, and a bias-cut skirt that moves effortlessly.',
      basePrice: 4590,
      salePrice: 3290,
      discountPercent: 28,
      sku: 'FASH-ZARA-SLIP-BLUSH',
      categoryId: fashionCat?.id,
      brandId: brandMap['zara'],
      deliveryModes: [DeliveryMode.FAST, DeliveryMode.STANDARD],
      tags: ['zara', 'dress', 'silk', 'blush-pink', 'fashion', 'evening'],
      isFeatured: true,
      isBestseller: true,
      isNewArrival: true,
      avgRating: 4.6,
      reviewCount: 420,
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80',
      stock: 45,
    },
    {
      name: 'Organic Ceremonial Grade Uji Matcha Green Tea (50g Tin)',
      slug: 'organic-ceremonial-uji-matcha-50g',
      shortDescription: 'First-harvest shade-grown green tea leaves stone-ground in Uji, Kyoto',
      description: 'Authentic first-harvest ceremonial Japanese matcha from Uji, Kyoto. Vibrant emerald green color, delicate umami richness, and velvety smooth finish. Perfect for traditional whisked tea or iced matcha lattes.',
      basePrice: 1899,
      salePrice: 1499,
      discountPercent: 21,
      sku: 'GROC-UJI-MATCHA-50G',
      categoryId: groceryCat?.id,
      brandId: null,
      deliveryModes: [DeliveryMode.QUICK, DeliveryMode.FAST, DeliveryMode.STANDARD],
      tags: ['matcha', 'tea', 'japanese', 'organic', 'grocery', 'wellness'],
      isFeatured: true,
      isBestseller: true,
      isNewArrival: true,
      avgRating: 4.9,
      reviewCount: 880,
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
      stock: 140,
    },
  ];

  for (const item of productsToAdd) {
    if (!item.categoryId) continue;

    const existing = await prisma.product.findUnique({ where: { slug: item.slug } });
    if (existing) {
      console.log(`Product ${item.name} already exists. Skipping.`);
      continue;
    }

    const prod = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        shortDescription: item.shortDescription,
        description: item.description,
        basePrice: item.basePrice,
        salePrice: item.salePrice,
        discountPercent: item.discountPercent,
        sku: item.sku,
        categoryId: item.categoryId,
        brandId: item.brandId || null,
        deliveryModes: item.deliveryModes,
        tags: item.tags,
        isFeatured: item.isFeatured,
        isBestseller: item.isBestseller,
        isNewArrival: item.isNewArrival,
        isPublished: true,
        avgRating: item.avgRating,
        reviewCount: item.reviewCount,
        images: {
          create: [
            {
              url: item.imageUrl,
              altText: item.name,
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
        inventory: {
          create: {
            quantity: item.stock,
            reservedQty: 0,
            lowStockThreshold: 10,
          },
        },
      },
    });

    console.log(`✅ Added product: ${prod.name}`);
  }

  console.log('🎉 Real internet products added successfully!');
  await prisma.$disconnect();
}

addInternetProducts().catch((e) => {
  console.error(e);
  process.exit(1);
});
