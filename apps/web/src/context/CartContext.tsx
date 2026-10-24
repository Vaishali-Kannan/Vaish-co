import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '../types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { useDelivery } from './DeliveryContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  coinsUsed: number;
  coinsDiscount: number;
  total: number;
  appliedCoupon: string | null;
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  applyCoins: (coins: number) => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { deliveryMode } = useDelivery();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('vaish_cart_guest');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [coinsUsed, setCoinsUsed] = useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync with server if logged in
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      api.getCart()
        .then((res) => {
          if (res.success && res.cart && res.cart.items) {
            setItems(res.cart.items);
          }
        })
        .catch((e) => console.error('Cart fetch failed:', e))
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  // Save guest cart locally
  useEffect(() => {
    if (!user) {
      localStorage.setItem('vaish_cart_guest', JSON.stringify(items));
    }
  }, [items, user]);

  const addToCart = async (product: Product, quantity = 1, variant?: ProductVariant) => {
    if (user) {
      try {
        const res = await api.addToCart(product.id, quantity, variant?.id);
        if (res.success) {
          const cartRes = await api.getCart();
          if (cartRes.cart?.items) {
            setItems(cartRes.cart.items);
          }
        }
      } catch (err) {
        console.error('Failed to add to cart on server:', err);
      }
    } else {
      // Guest mode
      setItems((prev) => {
        const existingIdx = prev.findIndex(
          (i) => i.productId === product.id && i.variantId === (variant?.id || null)
        );
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx].quantity += quantity;
          return updated;
        } else {
          return [
            ...prev,
            {
              id: 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(7),
              productId: product.id,
              variantId: variant?.id || null,
              quantity,
              product,
              variant,
            },
          ];
        }
      });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }
    if (user && !itemId.startsWith('guest_')) {
      try {
        await api.updateCartItem(itemId, quantity);
        const cartRes = await api.getCart();
        if (cartRes.cart?.items) {
          setItems(cartRes.cart.items);
        }
      } catch (err) {
        console.error('Failed to update quantity:', err);
      }
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      );
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (user && !itemId.startsWith('guest_')) {
      try {
        await api.removeCartItem(itemId);
        setItems((prev) => prev.filter((i) => i.id !== itemId));
      } catch (err) {
        console.error('Failed to remove item:', err);
      }
    } else {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    }
  };

  const applyCoins = (coins: number) => {
    setCoinsUsed(coins);
  };

  const applyCoupon = async (code: string) => {
    if (code.toUpperCase() === 'WELCOME10' || code.toUpperCase() === 'VAISH50') {
      setAppliedCoupon(code.toUpperCase());
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const clearCart = () => {
    setItems([]);
    setCoinsUsed(0);
    setAppliedCoupon(null);
    localStorage.removeItem('vaish_cart_guest');
  };

  // Calculations
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = items.reduce((acc, item) => {
    const price = item.variant?.salePrice
      ? Number(item.variant.salePrice)
      : item.variant?.price
      ? Number(item.variant.price)
      : item.product.salePrice
      ? Number(item.product.salePrice)
      : Number(item.product.basePrice);
    return acc + price * item.quantity;
  }, 0);

  // Delivery fee calculation
  let deliveryFee = 0;
  if (items.length > 0) {
    if (deliveryMode === 'QUICK') {
      deliveryFee = 49;
    } else if (deliveryMode === 'FAST') {
      deliveryFee = subtotal >= 999 ? 0 : 79;
    } else {
      deliveryFee = subtotal >= 499 ? 0 : 49;
    }
  }

  // Coupon discount
  let discount = 0;
  if (appliedCoupon === 'WELCOME10') {
    discount = Math.round(subtotal * 0.1);
  } else if (appliedCoupon === 'VAISH50') {
    discount = 50;
  }

  // 1 coin = ₹0.50 discount, max 20% of subtotal
  const maxCoinsAllowed = Math.floor((subtotal * 0.2) / 0.5);
  const effectiveCoinsUsed = Math.min(coinsUsed, maxCoinsAllowed);
  const coinsDiscount = effectiveCoinsUsed * 0.5;

  const total = Math.max(0, subtotal - discount + deliveryFee - coinsDiscount);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        deliveryFee,
        coinsUsed: effectiveCoinsUsed,
        coinsDiscount,
        total,
        appliedCoupon,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoins,
        applyCoupon,
        removeCoupon,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
