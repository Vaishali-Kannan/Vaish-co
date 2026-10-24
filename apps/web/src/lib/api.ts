const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  const token = localStorage.getItem('vaish_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      data.error?.message ||
      data.message ||
      (typeof data.error === 'string' ? data.error : 'Request failed');
    throw new ApiError(errorMsg, response.status, data);
  }

  return data;
}

export const api = {
  // Products & Catalogue
  getProducts: async (params?: Record<string, string | number | boolean | undefined>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    const query = searchParams.toString();
    const res = await request<any>(`/products${query ? `?${query}` : ''}`);
    return {
      success: true,
      products: res.products || res.data || [],
      pagination: res.pagination || { total: res.products?.length || 0 },
    };
  },

  getProductBySlug: async (slug: string) => {
    const res = await request<any>(`/products/${slug}`);
    return {
      success: true,
      product: res.data || res.product,
    };
  },

  getRelatedProducts: async (id: string) => {
    const res = await request<any>(`/products/${id}/related`);
    return {
      success: true,
      relatedProducts: res.data || res.relatedProducts || [],
    };
  },

  getCategories: async () => {
    const res = await request<any>('/categories');
    return {
      success: true,
      categories: res.data || res.categories || [],
    };
  },

  getSearchSuggestions: async (q: string) => {
    const res = await request<any>(`/search/suggestions?q=${encodeURIComponent(q)}`);
    return {
      success: true,
      suggestions: res.data || res.suggestions || [],
    };
  },

  // Auth
  register: async (formData: { email: string; password: string; fullName: string; phone?: string }) => {
    const res = await request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    const user = res.data?.user || res.user;
    const token = res.data?.tokens?.accessToken || res.token || res.accessToken;
    return { success: true, user, token };
  },

  login: async (credentials: { email: string; password: string }) => {
    const res = await request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    const user = res.data?.user || res.user;
    const token = res.data?.tokens?.accessToken || res.token || res.accessToken;
    return { success: true, user, token };
  },

  getCurrentUser: async () => {
    const res = await request<any>('/auth/me');
    return {
      success: true,
      user: res.data?.user || res.user,
    };
  },

  getAddresses: async () => {
    try {
      const res = await request<any>('/auth/addresses');
      return {
        success: true,
        addresses: res.data || res.addresses || [],
      };
    } catch {
      return { success: true, addresses: [] };
    }
  },

  createAddress: async (data: any) => {
    const res = await request<any>('/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return {
      success: true,
      address: res.data || res.address,
    };
  },

  // Cart
  getCart: async () => {
    const res = await request<any>('/cart');
    const cart = res.data || res.cart || { items: [] };
    return { success: true, cart };
  },

  addToCart: async (productId: string, quantity = 1, variantId?: string) => {
    const res = await request<any>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, variantId }),
    });
    return { success: true, item: res.data || res.item };
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    const res = await request<any>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
    return { success: true, item: res.data || res.item };
  },

  removeCartItem: async (itemId: string) => {
    const res = await request<any>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
    return { success: true };
  },

  // Wishlist
  getWishlist: async () => {
    const res = await request<any>('/wishlist');
    const items = res.data?.items || res.data || res.items || [];
    return { success: true, items };
  },

  addToWishlist: async (productId: string) => {
    const res = await request<any>('/wishlist/items', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
    return { success: true, item: res.data || res.item };
  },

  removeFromWishlist: async (productId: string) => {
    const res = await request<any>(`/wishlist/items/${productId}`, {
      method: 'DELETE',
    });
    return { success: true };
  },

  // Delivery
  checkDeliveryEligibility: async (data: { postalCode: string; mode?: string; productIds?: string[] }) => {
    const res = await request<any>('/delivery/eligibility', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return {
      success: true,
      eligible: res.data?.isEligible ?? res.eligible ?? true,
      estimates: res.data || res.estimates,
    };
  },

  // Checkout & Orders
  getCheckoutQuote: async (data: { deliveryMode: string; postalCode?: string; rewardCoinsUsed?: number; couponCode?: string }) => {
    const res = await request<any>('/orders/quote', {
      method: 'POST',
      body: JSON.stringify(data),
    }).catch(() => request<any>('/checkout/quote', {
      method: 'POST',
      body: JSON.stringify(data),
    }));
    return { success: true, quote: res.data || res.quote };
  },

  createOrder: async (data: {
    addressId?: string;
    shippingAddress?: any;
    deliveryMode: string;
    paymentMethod: string;
    rewardCoinsUsed?: number;
    couponCode?: string;
    notes?: string;
  }) => {
    const res = await request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return {
      success: true,
      order: res.data || res.order,
      razorpayOrder: res.razorpayOrder,
    };
  },

  getOrders: async () => {
    const res = await request<any>('/orders');
    return {
      success: true,
      orders: res.data || res.orders || [],
    };
  },

  getOrderById: async (id: string) => {
    const res = await request<any>(`/orders/${id}`);
    return {
      success: true,
      order: res.data || res.order,
    };
  },

  cancelOrder: async (id: string, reason?: string) => {
    const res = await request<any>(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return {
      success: true,
      order: res.data || res.order,
    };
  },

  // Payments
  verifyPayment: async (data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    const res = await request<any>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, payment: res.data || res.payment };
  },

  // Rewards
  getRewardsBalance: async () => {
    const res = await request<any>('/rewards/balance');
    const balance = res.data?.balance ?? res.balance ?? 0;
    return {
      success: true,
      balance,
      rules: res.data?.rules || res.rules,
    };
  },

  getRewardsTransactions: async () => {
    const res = await request<any>('/rewards/transactions');
    return {
      success: true,
      transactions: res.transactions || res.data || [],
    };
  },

  // AI Chat
  sendChatMessage: async (message: string, context?: any) => {
    const res = await request<any>('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
    const reply = res.data?.reply || res.reply || res.data?.message || 'Hello from Vee!';
    const suggestedProducts = res.data?.suggestedProducts || res.suggestedProducts || [];
    return {
      success: true,
      reply,
      suggestedProducts,
    };
  },

  // Reviews
  getProductReviews: async (productId: string) => {
    const res = await request<any>(`/reviews/products/${productId}`);
    return {
      success: true,
      reviews: res.data || res.reviews || [],
    };
  },

  createReview: async (productId: string, data: { rating: number; title?: string; content: string }) => {
    const res = await request<any>(`/reviews/products/${productId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return {
      success: true,
      review: res.data || res.review,
    };
  },

  // Admin
  getAdminDashboard: async () => {
    const res = await request<any>('/admin/dashboard');
    return {
      success: true,
      stats: res.data?.metrics || res.metrics || res.stats || {},
      recentOrders: res.data?.recentOrders || res.recentOrders || [],
    };
  },

  getAdminOrders: async (params?: any) => {
    const searchParams = new URLSearchParams(params || {});
    const res = await request<any>(`/admin/orders?${searchParams.toString()}`);
    return {
      success: true,
      orders: res.data || res.orders || [],
      pagination: res.pagination,
    };
  },

  updateAdminOrderStatus: async (orderId: string, status: string, notes?: string) => {
    const res = await request<any>(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
    return {
      success: true,
      order: res.data || res.order,
    };
  },

  createAdminProduct: async (productData: any) => {
    const res = await request<any>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return {
      success: true,
      product: res.data || res.product,
    };
  },
};
