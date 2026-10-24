import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import prisma from '../../config/database';
import env from '../../config/env';
import logger from '../../utils/logger';

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

if (env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
}

const SYSTEM_PROMPT = `You are Vee, the friendly and knowledgeable shopping assistant for Vaish&Co. — "Little things, lovely finds."

You help customers discover, compare, and choose products from Vaish&Co.'s catalogue. 

## Your Capabilities:
- Help discover products by category, budget, occasion, or preference
- Recommend gifts and lifestyle products
- Compare products from the catalogue
- Explain delivery modes: Quick (within 2 hours), Fast (1-2 days), Standard (3-7 days)
- Explain Vaish Coins rewards: Earn 1 coin per ₹100 spent, redeem at ₹0.50 per coin
- Answer questions about return policy (7 days for most products)
- Help navigate categories: Beauty, Fashion, Technology, Grocery, Home & Living, Essentials

## Rules:
- Only recommend products that actually exist in Vaish&Co.'s catalogue
- Never invent product names, prices, or stock information
- Do not collect passwords, card numbers, or personal financial information
- Always be warm, helpful, and aligned with the Vaish&Co. brand
- If you can't help with something, guide users to customer support
- Keep responses concise and actionable
- Format currency in Indian Rupees (₹)

## Brand Voice:
- Friendly and enthusiastic but not over-the-top
- Knowledgeable and trustworthy
- A bit playful, like a stylish friend who knows great products`;

// Fallback responses for when AI is not configured
const FALLBACK_RESPONSES = [
  {
    keywords: ['earbuds', 'headphones', 'audio'],
    response: "For audio products, check out our Technology category! We have wireless earbuds starting from ₹999. Head to **Technology → Audio** to explore options.",
  },
  {
    keywords: ['moisturizer', 'skincare', 'face wash', 'serum'],
    response: "Our Beauty collection has some lovely skincare picks! 🌸 Check out our **Beauty → Skincare** section for moisturizers, serums, and more. Use the filters to find products for your skin type.",
  },
  {
    keywords: ['gift', 'birthday', 'present'],
    response: "Looking for a gift? I'd suggest exploring our **Lifestyle & Beauty** categories! Skincare sets, home decor, and accessories make wonderful gifts. What's your budget?",
  },
  {
    keywords: ['delivery', 'shipping', 'when'],
    response: "We offer three delivery speeds:\n\n🚀 **Quick** – Within 2 hours (select areas)\n⚡ **Fast** – 1-2 business days\n📦 **Standard** – 3-7 business days\n\nFree delivery on orders above ₹499!",
  },
  {
    keywords: ['coin', 'reward', 'vaish coin'],
    response: "Vaish Coins are our loyalty rewards! 💛\n\n- Earn **1 coin per ₹100** spent\n- Each coin is worth **₹0.50** when redeemed\n- Use up to **20% of any order value** in coins\n\nCheck your wallet in your account dashboard!",
  },
  {
    keywords: ['return', 'refund', 'exchange'],
    response: "Our return policy is customer-friendly! 📦\n\n- **7-day returns** for most products\n- Easy return request from your Orders page\n- Refund processed within 5-7 business days\n\nSome items like groceries and personalised products may have different policies.",
  },
  {
    keywords: ['budget', 'cheap', 'affordable', 'under', '500', '1000'],
    response: "Great value finds await! 🛍️ Use the **Price** filter on any category page to set your budget. Our **Deals** section also has discounts up to 50% off!",
  },
];

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  for (const { keywords, response } of FALLBACK_RESPONSES) {
    if (keywords.some((k) => lower.includes(k))) {
      return response;
    }
  }
  return "Hi! I'm Vee, your Vaish&Co. shopping assistant 👋\n\nI can help you discover products, find gifts, compare items, or answer questions about delivery and rewards. What are you looking for today?";
}

async function searchProducts(query: string, limit = 5) {
  return prisma.product.findMany({
    where: {
      isPublished: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query.toLowerCase()] } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      salePrice: true,
      avgRating: true,
      category: { select: { name: true } },
      brand: { select: { name: true } },
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
    },
    take: limit,
    orderBy: { avgRating: 'desc' },
  });
}

function formatProductList(products: any[]): string {
  if (products.length === 0) return '';
  return products.map((p) => {
    const price = p.salePrice
      ? `~~₹${p.basePrice}~~ ₹${p.salePrice}`
      : `₹${p.basePrice}`;
    const rating = p.avgRating > 0 ? ` ⭐ ${p.avgRating}` : '';
    return `- **${p.name}**${p.brand ? ` by ${p.brand.name}` : ''} — ${price}${rating}\n  [View Product](/products/${p.slug})`;
  }).join('\n');
}

export async function chat(message: string, userId?: string, conversationHistory: Array<{ role: string; content: string }> = []) {
  // Extract product search intent
  let contextProducts = '';
  const productSearchTerms = extractProductSearchTerms(message);
  if (productSearchTerms) {
    const products = await searchProducts(productSearchTerms);
    if (products.length > 0) {
      contextProducts = `\n\nRelevant products from our catalogue:\n${formatProductList(products)}`;
    }
  }

  // Get reward balance if user is authenticated and asking about coins
  let rewardContext = '';
  if (userId && /coin|reward|balance/i.test(message)) {
    const account = await prisma.rewardAccount.findUnique({
      where: { userId },
      select: { balance: true },
    });
    if (account) {
      rewardContext = `\n\nThe customer's current Vaish Coins balance: ${account.balance} coins (worth ₹${(account.balance * 0.5).toFixed(2)})`;
    }
  }

  if (!model) {
    logger.info('Gemini not configured - using fallback response');
    return {
      message: getFallbackResponse(message) + (contextProducts ? `\n\n**Matching products:**\n${contextProducts}` : ''),
      isDemoMode: true,
    };
  }

  try {
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: "I'm Vee, ready to help with Vaish&Co. shopping! How can I assist you today?" }] },
        ...conversationHistory.map((m) => ({
          role: m.role as 'user' | 'model',
          parts: [{ text: m.content }],
        })),
      ],
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.7,
      },
    });

    const userMessage = message + contextProducts + rewardContext;
    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();

    return { message: response, isDemoMode: false };
  } catch (err: any) {
    logger.error('Gemini API error', { error: err.message });
    return {
      message: getFallbackResponse(message),
      isDemoMode: true,
      error: 'AI service temporarily unavailable',
    };
  }
}

function extractProductSearchTerms(message: string): string | null {
  const patterns = [
    /(?:find|show|suggest|recommend|looking for|need|want|buy)\s+(.+?)(?:\?|$|under|below|for)/i,
    /(?:earbuds?|headphones?|moisturizer|serum|shoes?|dress|shirt|laptop|phone|watch)/i,
    /(?:skincare|beauty|fashion|technology|grocery|home|essentials)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[1] || match[0];
  }

  // Return the full message as search term if it's short enough
  if (message.length < 50) return message;
  return null;
}

export async function getProductRecommendations(query: string) {
  const products = await searchProducts(query, 8);
  return products;
}
