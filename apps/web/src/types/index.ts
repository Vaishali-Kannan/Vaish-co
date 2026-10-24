export type DeliveryMode = 'QUICK' | 'FAST' | 'STANDARD';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  parentId?: string | null;
  children?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: string;
  salePrice?: string | null;
  stock: number;
  attributes?: Record<string, string>;
  imageUrl?: string | null;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  description: string;
  basePrice: string;
  salePrice?: string | null;
  discountPercent?: string | null;
  sku: string;
  stock: number;
  avgRating: string;
  reviewCount: number;
  deliveryModes: DeliveryMode[];
  tags: string[];
  attributes?: Record<string, any>;
  isPublished: boolean;
  isFeatured: boolean;
  category?: Category;
  brand?: Brand;
  images?: ProductImage[];
  variants?: ProductVariant[];
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  coinsDiscount: number;
  total: number;
  itemCount: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPPORT';
  isEmailVerified: boolean;
  coinsBalance: number;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string | null;
  variantName?: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentMethod = 'CASH_ON_DELIVERY' | 'ONLINE' | 'PAY_LATER';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  deliveryMode: DeliveryMode;
  itemsSubtotal: string;
  discountAmount: string;
  deliveryFee: string;
  rewardCoinsUsed: number;
  rewardCoinsDiscount: string;
  totalAmount: string;
  rewardCoinsEarned: number;
  deliveryAddress: Record<string, any>;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  estimatedDeliveryDate?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface RewardTransaction {
  id: string;
  amount: number;
  type: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'ADJUSTED' | 'REVERSED';
  description: string;
  orderId?: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  title?: string | null;
  content: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user: {
    fullName: string;
  };
}
