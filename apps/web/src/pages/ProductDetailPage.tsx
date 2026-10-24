import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Star,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  Check,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Clock,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { api } from '../lib/api';
import { Product, ProductVariant, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useDelivery } from '../context/DeliveryContext';
import { DeliveryBadge } from '../components/products/DeliveryBadge';
import { ProductCard } from '../components/products/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { postalCode, setPostalCode, deliveryMode } = useDelivery();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [pincodeCheck, setPincodeCheck] = useState(postalCode);
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchProductData = async () => {
      try {
        setIsLoading(true);
        const res = await api.getProductBySlug(slug);
        if (res.success && res.product) {
          const prod = res.product;
          setProduct(prod);
          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          }
          if (prod.images && prod.images.length > 0) {
            setSelectedImage(prod.images[0].url);
          } else {
            setSelectedImage(
              'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
            );
          }

          // Fetch related and reviews
          const [relRes, revRes] = await Promise.all([
            api.getRelatedProducts(prod.id).catch(() => ({ success: false, relatedProducts: [] })),
            api.getProductReviews(prod.id).catch(() => ({ success: false, reviews: [] })),
          ]);

          if (relRes.success) setRelatedProducts(relRes.relatedProducts || []);
          if (revRes.success) setReviews(revRes.reviews || []);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-6 bg-brand-palePink/50 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-brand-palePink/40 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-brand-palePink/60 rounded w-3/4" />
            <div className="h-6 bg-brand-palePink/40 rounded w-1/4" />
            <div className="h-24 bg-brand-palePink/30 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-brand-text">Product Not Found</h2>
        <p className="text-xs text-brand-secondary">
          The lovely find you are looking for might have been moved or is currently unavailable.
        </p>
        <Link
          to="/products"
          className="inline-block px-6 py-2.5 rounded-full bg-brand-pink text-white text-xs font-semibold"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const hasSale = product.salePrice && Number(product.salePrice) < Number(product.basePrice);
  const currentPrice = selectedVariant?.salePrice
    ? selectedVariant.salePrice
    : selectedVariant?.price
    ? selectedVariant.price
    : product.salePrice || product.basePrice;

  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    await addToCart(product, quantity, selectedVariant || undefined);
    setIsAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    await addToCart(product, quantity, selectedVariant || undefined);
    navigate('/checkout');
  };

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeCheck) return;
    setPostalCode(pincodeCheck);
    try {
      const res = await api.checkDeliveryEligibility({
        postalCode: pincodeCheck,
        mode: deliveryMode,
        productIds: [product.id],
      });
      if (res.success && res.eligible) {
        setPincodeResult(
          `✅ Delivery available to ${pincodeCheck}! Estimated: ${res.estimates?.estimate || '1-2 Days'}`
        );
      } else {
        setPincodeResult(`⚠️ Standard delivery available to ${pincodeCheck} (3-5 days).`);
      }
    } catch {
      setPincodeResult(`✅ Pincode ${pincodeCheck} is eligible for delivery.`);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) return;
    setIsSubmittingReview(true);
    try {
      const res = await api.createReview(product.id, {
        rating: reviewRating,
        content: reviewContent.trim(),
      });
      if (res.success) {
        setReviewSuccess(true);
        setReviewContent('');
        const revRes = await api.getProductReviews(product.id);
        if (revRes.success) setReviews(revRes.reviews || []);
      }
    } catch (err: any) {
      alert(err.message || 'Please log in to submit a review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* ─── Breadcrumb ────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-xs text-brand-secondary">
        <Link to="/" className="hover:text-brand-pink transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-brand-pink transition-colors">
          Shop
        </Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              to={`/products?category=${product.category.slug}`}
              className="hover:text-brand-pink transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-brand-text font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* ─── Product Hero Details Grid ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[500px]">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img.url
                      ? 'border-brand-pink shadow-subtle'
                      : 'border-brand-border/60 hover:border-brand-pink/50'
                  }`}
                >
                  <img src={img.url} alt={img.altText || product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Photo View */}
          <div className="relative flex-grow aspect-square rounded-3xl overflow-hidden bg-white border border-brand-border/80 shadow-subtle">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {hasSale && (
              <span className="absolute top-4 left-4 bg-brand-deepRose text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {product.discountPercent ? `${product.discountPercent}% OFF` : 'SALE'}
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all shadow-sm ${
                isFavorited
                  ? 'bg-brand-pink text-white shadow-pink-glow'
                  : 'bg-white/80 text-brand-text hover:bg-white hover:text-brand-pink'
              }`}
              aria-label="Wishlist toggle"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right: Product Actions & Info */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-secondary">
              {product.brand?.name || 'Vaish&Co. Edit'}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text mt-1">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-brand-text ml-1.5">
                  {product.avgRating ? Number(product.avgRating).toFixed(1) : '4.5'}
                </span>
              </div>
              <span className="text-xs text-brand-secondary">
                ({product.reviewCount || reviews.length} customer reviews)
              </span>
              <span className="text-brand-border">•</span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Genuine
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="p-4 rounded-2xl bg-brand-palePink/30 border border-brand-border/60 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-brand-text font-serif">
                  ₹{Number(currentPrice).toLocaleString('en-IN')}
                </span>
                {hasSale && (
                  <span className="text-sm text-brand-secondary line-through">
                    ₹{Number(product.basePrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-brand-secondary mt-0.5">
                Inclusive of all taxes. Earn ~{Math.floor(Number(currentPrice) / 100)} Vaish Coins.
              </p>
            </div>
            {isOutOfStock ? (
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                Out of Stock
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                In Stock ({currentStock} available)
              </span>
            )}
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-secondary">
                Select Option / Variant:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-brand-pink bg-brand-palePink text-brand-deepRose shadow-xs'
                        : 'border-brand-border bg-white text-brand-text hover:border-brand-pink/40'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-secondary">
              Quantity:
            </span>
            <div className="flex items-center border border-brand-border rounded-xl bg-white overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1.5 hover:bg-brand-palePink text-brand-text text-sm font-bold"
              >
                -
              </button>
              <span className="px-4 py-1.5 text-xs font-bold text-brand-text min-w-[2.5rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                className="px-3 py-1.5 hover:bg-brand-palePink text-brand-text text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className={`py-3.5 px-4 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-subtle ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-palePink text-brand-deepRose hover:bg-brand-pink hover:text-white border border-brand-pink/30'
              } disabled:opacity-50`}
            >
              {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
              <span>{added ? 'Added to Bag' : 'Add to Bag'}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="py-3.5 px-4 rounded-full bg-brand-pink hover:bg-brand-deepRose text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-elevated hover:shadow-pink-glow disabled:opacity-50"
            >
              <span>Buy Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Delivery & Pincode Checker */}
          <div className="p-4 rounded-2xl bg-white border border-brand-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-text flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-pink" />
                <span>Delivery & Availability</span>
              </span>
              <div className="flex gap-1">
                {product.deliveryModes?.map((m) => (
                  <DeliveryBadge key={m} mode={m} size="sm" />
                ))}
              </div>
            </div>

            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                value={pincodeCheck}
                onChange={(e) => setPincodeCheck(e.target.value)}
                className="flex-grow px-3 py-2 text-xs rounded-xl border border-brand-border bg-brand-blush focus:outline-none focus:border-brand-pink"
                maxLength={6}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-blush hover:bg-brand-palePink border border-brand-border text-xs font-bold text-brand-deepRose"
              >
                Check
              </button>
            </form>
            {pincodeResult && (
              <p className="text-xs text-brand-text font-medium pt-1">{pincodeResult}</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Detailed Tabs: Overview, Specifications, Reviews ─────── */}
      <div className="bg-white rounded-3xl border border-brand-border/70 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-8 border-b border-brand-border/60 pb-3 text-sm">
          <button
            onClick={() => setActiveTab('details')}
            className={`font-serif font-bold pb-2 transition-colors relative ${
              activeTab === 'details'
                ? 'text-brand-deepRose border-b-2 border-brand-pink'
                : 'text-brand-secondary hover:text-brand-text'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`font-serif font-bold pb-2 transition-colors relative ${
              activeTab === 'specs'
                ? 'text-brand-deepRose border-b-2 border-brand-pink'
                : 'text-brand-secondary hover:text-brand-text'
            }`}
          >
            Specifications & Details
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`font-serif font-bold pb-2 transition-colors relative ${
              activeTab === 'reviews'
                ? 'text-brand-deepRose border-b-2 border-brand-pink'
                : 'text-brand-secondary hover:text-brand-text'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'details' && (
          <div className="prose prose-sm max-w-none text-brand-text/90 leading-relaxed space-y-4">
            <p className="text-sm whitespace-pre-line">{product.description}</p>
            {product.tags && product.tags.length > 0 && (
              <div className="pt-4 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-brand-secondary">Tags:</span>
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full bg-brand-palePink/50 text-brand-deepRose text-[11px] font-medium border border-brand-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Specifications */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-brand-blush/60 border border-brand-border/40 flex justify-between">
              <span className="font-bold text-brand-secondary">SKU:</span>
              <span className="text-brand-text font-semibold">{product.sku}</span>
            </div>
            <div className="p-3 rounded-xl bg-brand-blush/60 border border-brand-border/40 flex justify-between">
              <span className="font-bold text-brand-secondary">Category:</span>
              <span className="text-brand-text font-semibold">{product.category?.name || 'General'}</span>
            </div>
            <div className="p-3 rounded-xl bg-brand-blush/60 border border-brand-border/40 flex justify-between">
              <span className="font-bold text-brand-secondary">Brand:</span>
              <span className="text-brand-text font-semibold">{product.brand?.name || 'Vaish&Co.'}</span>
            </div>
            <div className="p-3 rounded-xl bg-brand-blush/60 border border-brand-border/40 flex justify-between">
              <span className="font-bold text-brand-secondary">Eligible Delivery Modes:</span>
              <span className="text-brand-text font-semibold">
                {product.deliveryModes?.join(', ') || 'FAST, STANDARD'}
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Customer Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Write a review */}
            <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl bg-brand-blush/80 border border-brand-border space-y-3">
              <h4 className="font-serif font-bold text-sm text-brand-text">Share your thoughts</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-brand-secondary">Your rating:</span>
                <div className="flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= reviewRating ? 'fill-amber-400' : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                required
                rows={3}
                placeholder="What did you love about this find? How was the packaging and delivery?"
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                className="w-full p-3 rounded-xl border border-brand-border bg-white text-xs focus:outline-none focus:border-brand-pink"
              />
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-5 py-2 rounded-xl bg-brand-pink hover:bg-brand-deepRose text-white text-xs font-bold shadow-subtle transition-colors"
              >
                {isSubmittingReview ? 'Submitting...' : 'Post Review'}
              </button>
              {reviewSuccess && (
                <p className="text-xs text-emerald-700 font-medium">
                  ✨ Thank you for leaving a lovely review!
                </p>
              )}
            </form>

            {/* Existing reviews */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-xs text-brand-secondary italic">
                  Be the first to leave a review for this lovely find!
                </p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl border border-brand-border/60 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-brand-text">
                          {rev.user?.fullName || 'Verified Shopper'}
                        </span>
                        {rev.isVerifiedPurchase && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-brand-secondary leading-relaxed">{rev.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Related Products ──────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-pink">
                Complete Your Look
              </span>
              <h2 className="font-serif text-2xl font-bold text-brand-text mt-1">
                You May Also Love
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
