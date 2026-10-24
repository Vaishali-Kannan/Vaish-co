import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { DeliveryBadge } from './DeliveryBadge';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const isFavorited = isInWishlist(product.id);

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images.find((img) => img.isPrimary)?.url || product.images[0].url
      : 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80';

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    await addToCart(product, 1);
    setIsAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const hasSale = product.salePrice && Number(product.salePrice) < Number(product.basePrice);
  const displayPrice = hasSale ? product.salePrice : product.basePrice;

  return (
    <div className="group relative bg-white rounded-2xl border border-brand-border/70 overflow-hidden hover:shadow-card hover:border-brand-pink/40 transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <Link to={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-brand-palePink/30">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            isFavorited
              ? 'bg-brand-pink text-white shadow-pink-glow'
              : 'bg-white/80 text-brand-text hover:bg-white hover:text-brand-pink'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white' : ''}`} />
        </button>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {hasSale && (
            <span className="bg-brand-deepRose text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {product.discountPercent ? `${product.discountPercent}% OFF` : 'SALE'}
            </span>
          )}
          {product.deliveryModes && product.deliveryModes.includes('QUICK') && (
            <DeliveryBadge mode="QUICK" size="sm" />
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Brand & Delivery */}
        <div className="flex items-center justify-between text-xs text-brand-secondary mb-1">
          <span className="font-medium tracking-wide uppercase text-[10px]">
            {product.brand?.name || 'Vaish&Co.'}
          </span>
          {(!product.deliveryModes || !product.deliveryModes.includes('QUICK')) &&
            product.deliveryModes?.[0] && (
              <DeliveryBadge mode={product.deliveryModes[0]} size="sm" />
            )}
        </div>

        {/* Title */}
        <Link
          to={`/products/${product.slug}`}
          className="font-serif text-brand-text font-medium text-base line-clamp-1 hover:text-brand-pink transition-colors mb-1.5"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Ratings */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-brand-text ml-1">
              {product.avgRating ? Number(product.avgRating).toFixed(1) : '4.5'}
            </span>
          </div>
          <span className="text-xs text-brand-secondary">
            ({product.reviewCount || 12})
          </span>
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-2 border-t border-brand-border/40 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-brand-text">
              ₹{Number(displayPrice).toLocaleString('en-IN')}
            </span>
            {hasSale && (
              <span className="text-xs text-brand-secondary line-through">
                ₹{Number(product.basePrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={isAdding}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-palePink text-brand-deepRose hover:bg-brand-pink hover:text-white'
            }`}
            title="Add to shopping bag"
          >
            {added ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
