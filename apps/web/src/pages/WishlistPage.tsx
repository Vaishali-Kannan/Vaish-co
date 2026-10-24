import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, Coins } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const WishlistPage: React.FC = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleMoveToCart = async (product: any) => {
    await addToCart(product, 1);
    await removeFromWishlist(product.id);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-brand-palePink text-brand-pink mx-auto flex items-center justify-center shadow-subtle">
          <Heart className="w-10 h-10 fill-brand-pink" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-brand-text">Your Wishlist is Empty</h2>
        <p className="text-xs sm:text-sm text-brand-secondary max-w-sm mx-auto">
          Save your favorite beauty serums, lifestyle accents, and tech picks here to keep an eye on them or redeem with Vaish Coins.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-pink hover:bg-brand-deepRose text-white font-semibold text-xs sm:text-sm transition-all shadow-elevated"
        >
          <span>Explore Lovely Finds</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-text">My Saved Finds</h1>
          <p className="text-xs sm:text-sm text-brand-secondary mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved in your wishlist
          </p>
        </div>

        {/* Wishlist Coins Perks */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold">
          <Coins className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>
            You have <strong className="font-bold">{user?.coinsBalance || 0} coins</strong> ready to apply
            at checkout!
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((product) => {
          const primaryImage =
            product.images?.[0]?.url ||
            'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80';
          const displayPrice = product.salePrice || product.basePrice;

          return (
            <div
              key={product.id}
              className="group bg-white rounded-2xl border border-brand-border/70 overflow-hidden shadow-xs hover:border-brand-pink/50 transition-all flex flex-col justify-between"
            >
              {/* Image & Remove */}
              <div className="relative aspect-square overflow-hidden bg-brand-palePink/30">
                <Link to={`/products/${product.slug}`}>
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-stone-400 hover:text-brand-error transition-colors shadow-sm"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-grow">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary">
                  {product.brand?.name || 'Vaish&Co.'}
                </span>
                <Link
                  to={`/products/${product.slug}`}
                  className="font-serif font-bold text-sm text-brand-text hover:text-brand-pink transition-colors line-clamp-1 mt-0.5"
                >
                  {product.name}
                </Link>
                <p className="font-bold text-sm text-brand-text mt-1.5">
                  ₹{Number(displayPrice).toLocaleString('en-IN')}
                </p>

                <div className="mt-4 pt-3 border-t border-brand-border/40">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="w-full py-2.5 px-3 rounded-xl bg-brand-palePink text-brand-deepRose hover:bg-brand-pink hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
