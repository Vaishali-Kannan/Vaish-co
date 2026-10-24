import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  items: Product[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  itemCount: number;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('vaish_wishlist_guest');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      api.getWishlist()
        .then((res) => {
          if (res.success && res.items) {
            setItems(res.items.map((i: any) => i.product || i));
          }
        })
        .catch((e) => console.error('Wishlist fetch error:', e))
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('vaish_wishlist_guest', JSON.stringify(items));
    }
  }, [items, user]);

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.id === productId);
  };

  const toggleWishlist = async (product: Product) => {
    const exists = isInWishlist(product.id);
    if (exists) {
      await removeFromWishlist(product.id);
    } else {
      if (user) {
        try {
          await api.addToWishlist(product.id);
        } catch (e) {
          console.error('Failed to add to wishlist on server:', e);
        }
      }
      setItems((prev) => [...prev, product]);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (user) {
      try {
        await api.removeFromWishlist(productId);
      } catch (e) {
        console.error('Failed to remove from wishlist on server:', e);
      }
    }
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        itemCount: items.length,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
