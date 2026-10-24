import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Clock,
  ShieldCheck,
  Star,
  Award,
  ChevronRight,
  Heart,
  TrendingUp,
  Gift,
  RefreshCw,
} from 'lucide-react';
import { api } from '../lib/api';
import { Product, Category, DeliveryMode } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { useDelivery } from '../context/DeliveryContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { deliveryMode, setDeliveryMode, getModeDetails } = useDelivery();

  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [quickDeliveryProducts, setQuickDeliveryProducts] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [catsRes, trendingRes, quickRes, bestsellersRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ isFeatured: true, limit: 8 }),
          api.getProducts({ deliveryMode: 'QUICK', limit: 4 }),
          api.getProducts({ sortBy: 'bestselling', limit: 8 }),
        ]);

        if (catsRes.success) setCategories(catsRes.categories || []);
        if (trendingRes.success) setTrendingProducts(trendingRes.products || []);
        if (quickRes.success) setQuickDeliveryProducts(quickRes.products || []);
        if (bestsellersRes.success) setBestsellers(bestsellersRes.products || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentModeInfo = getModeDetails(deliveryMode);

  return (
    <div className="space-y-16 pb-16">
      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-palePink/60 via-brand-blush to-white pt-8 pb-16 sm:py-20 border-b border-brand-border">
        {/* Soft pink ambient blur spheres */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-pink/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-10 w-80 h-80 bg-brand-palePink/80 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-brand-border text-brand-deepRose text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
                <span>The Vaish&Co. Lifestyle Collection</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-text tracking-tight leading-[1.15]">
                Good finds. <br />
                <span className="italic font-normal text-brand-deepRose">Great feelings.</span>
              </h1>

              <p className="text-base sm:text-lg text-brand-secondary max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                From everyday essentials to little luxuries, discover curated beauty, lifestyle, tech, and grocery products that make every day feel a little more you.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/products"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-brand-pink hover:bg-brand-deepRose text-white font-semibold text-sm transition-all duration-300 shadow-elevated hover:shadow-pink-glow text-center flex items-center justify-center gap-2"
                >
                  <span>Explore Lovely Finds</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/products?deliveryMode=QUICK"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-brand-palePink border border-brand-border text-brand-text font-semibold text-sm transition-all duration-300 shadow-xs text-center flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Shop Quick Delivery</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-brand-border/60 text-left">
                <div>
                  <p className="font-bold text-base text-brand-text">100%</p>
                  <p className="text-xs text-brand-secondary">Curated & Authentic</p>
                </div>
                <div>
                  <p className="font-bold text-base text-brand-text">3 Modes</p>
                  <p className="text-xs text-brand-secondary">Flexible Delivery</p>
                </div>
                <div>
                  <p className="font-bold text-base text-brand-text">1 Coin / ₹100</p>
                  <p className="text-xs text-brand-secondary">Vaish Rewards</p>
                </div>
              </div>
            </div>

            {/* Right Hero Imagery Grid */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-brand-palePink">
                  <img
                    src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80"
                    alt="Vaish&Co. Luxury Skincare and Lifestyle"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Floating Promo Tag */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl glass-panel shadow-elevated">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-brand-deepRose">
                      Special Editorial
                    </p>
                    <p className="font-serif font-bold text-sm sm:text-base text-brand-text">
                      Radiant Morning Skincare Routine
                    </p>
                    <p className="text-xs text-brand-secondary mt-0.5">
                      Starting from ₹499 with same-day doorstep dispatch
                    </p>
                  </div>
                </div>

                {/* Floating mini badge */}
                <div className="absolute -top-4 -left-4 bg-white p-3 rounded-2xl shadow-elevated border border-brand-border flex items-center gap-2.5 animate-soft-pulse">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Zap className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-brand-secondary uppercase font-bold tracking-wider">
                      Quick Commerce
                    </p>
                    <p className="text-xs font-bold text-brand-text">Minutes away</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Delivery Mode Selector Banner ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-subtle">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-pink">
                Tailor Your Delivery
              </span>
              <h2 className="font-serif text-2xl font-bold text-brand-text mt-1">
                Shop with your schedule in mind
              </h2>
              <p className="text-xs sm:text-sm text-brand-secondary mt-1">
                Currently browsing with:{' '}
                <span className="font-bold text-brand-deepRose">{currentModeInfo.title}</span> (
                {currentModeInfo.time})
              </p>
            </div>
            <Link
              to={`/products?deliveryMode=${deliveryMode}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-deepRose hover:text-brand-pink transition-colors"
            >
              <span>View all {currentModeInfo.title} items</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['QUICK', 'FAST', 'STANDARD'] as DeliveryMode[]).map((mode) => {
              const info = getModeDetails(mode);
              const isSelected = deliveryMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setDeliveryMode(mode)}
                  className={`p-5 rounded-2xl text-left border-2 transition-all relative ${
                    isSelected
                      ? 'border-brand-pink bg-brand-palePink/30 shadow-subtle'
                      : 'border-brand-border/70 hover:border-brand-pink/50 hover:bg-brand-blush/40'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-4 right-4 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-brand-pink text-white">
                      Selected
                    </span>
                  )}
                  <span className="text-3xl block mb-2">{info.icon}</span>
                  <h3 className="font-serif font-bold text-base text-brand-text">{info.title}</h3>
                  <p className="text-xs text-brand-deepRose font-bold mt-0.5">{info.time}</p>
                  <p className="text-xs text-brand-secondary mt-1.5 leading-relaxed">
                    {info.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Category Discovery ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-pink">
              Curated Collections
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text mt-1">
              Explore by Category
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-brand-deepRose hover:text-brand-pink flex items-center gap-1 transition-colors"
          >
            <span>All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group bg-white rounded-2xl p-4 border border-brand-border/70 hover:border-brand-pink hover:shadow-card transition-all text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-brand-palePink/50 mb-3 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={
                    cat.imageUrl ||
                    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80'
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-serif font-bold text-xs sm:text-sm text-brand-text group-hover:text-brand-deepRose transition-colors">
                {cat.name}
              </h3>
              <p className="text-[10px] text-brand-secondary mt-0.5 line-clamp-1">
                {cat.description || 'Explore collection'}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Quick Delivery Highlights (Instant Picks) ────────────────── */}
      {quickDeliveryProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-500/10 via-brand-palePink/40 to-amber-500/10 p-6 sm:p-8 rounded-3xl border border-amber-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-sm">
                  <Zap className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                    Quick-Commerce Spotlight
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-brand-text">
                    Need it right away? Delivered in 15–45 minutes
                  </h2>
                </div>
              </div>
              <Link
                to="/products?deliveryMode=QUICK"
                className="px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shrink-0 text-center"
              >
                Browse All Quick Items
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickDeliveryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Trending Products ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-pink">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trending Now</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text mt-1">
              Most Loved Finds This Week
            </h2>
          </div>
          <Link
            to="/products?featured=true"
            className="text-xs font-bold text-brand-deepRose hover:text-brand-pink flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-brand-palePink/30 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ─── Vaish Coins Loyalty Programme Promo ────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-deepRose via-brand-pink to-[#E08AAB] p-8 sm:p-12 text-white shadow-elevated">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-brand-palePink text-xs font-bold">
              <Award className="w-4 h-4" />
              <span>Vaish Coins Loyalty Program</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Earn coins on every find. <br />
              Redeem anytime toward your wishlist.
            </h2>

            <p className="text-sm sm:text-base text-brand-palePink/90 font-light leading-relaxed">
              Earn 1 Vaish Coin for every ₹100 of eligible completed purchases. Use your coins to offset up to 20% of your cart, or save them for exclusive wishlist drops.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <Link
                to="/rewards"
                className="px-6 py-3 rounded-full bg-white text-brand-deepRose font-bold text-xs sm:text-sm hover:bg-brand-palePink transition-colors text-center shadow-sm"
              >
                View Your Rewards Wallet
              </Link>
              <Link
                to="/wishlist"
                className="px-6 py-3 rounded-full bg-white/20 border border-white/40 text-white font-bold text-xs sm:text-sm hover:bg-white/30 transition-colors text-center"
              >
                Check Wishlist Coins Eligibility
              </Link>
            </div>
          </div>

          {/* Decorative coin illustrations */}
          <div className="absolute -right-10 -bottom-10 opacity-20 pointer-events-none">
            <Award className="w-80 h-80 text-white" />
          </div>
        </div>
      </section>

      {/* ─── Bestselling Products ─────────────────────────────────────── */}
      {bestsellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-pink">
                Customer Favorites
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text mt-1">
                Bestsellers
              </h2>
            </div>
            <Link
              to="/products?sortBy=bestselling"
              className="text-xs font-bold text-brand-deepRose hover:text-brand-pink flex items-center gap-1 transition-colors"
            >
              <span>Explore All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Customer Testimonials / Reviews ─────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-pink">
            Loved by Shoppers
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text mt-1">
            Real Reviews from Lovely Finders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-brand-border/70 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="font-serif font-bold text-sm text-brand-text mb-2">
                “Arrived in 30 minutes! Truly amazed.”
              </p>
              <p className="text-xs text-brand-secondary leading-relaxed">
                I needed a quick birthday gift for my best friend and picked the Glow Serum with Quick Delivery. It arrived packed in signature pink packaging within 35 minutes!
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-border/40 flex items-center justify-between text-xs">
              <span className="font-bold text-brand-text">Pooja S.</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                Verified Buyer
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-brand-border/70 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="font-serif font-bold text-sm text-brand-text mb-2">
                “The Vaish Coins system is genuine savings.”
              </p>
              <p className="text-xs text-brand-secondary leading-relaxed">
                Unlike other apps with complicated voucher tricks, Vaish Coins applied directly to my cart total without any fuss. Love the elegant aesthetic of this shop!
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-border/40 flex items-center justify-between text-xs">
              <span className="font-bold text-brand-text">Ananya M.</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                Verified Buyer
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-brand-border/70 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="font-serif font-bold text-sm text-brand-text mb-2">
                “Vee AI recommended exactly what I needed.”
              </p>
              <p className="text-xs text-brand-secondary leading-relaxed">
                I wasn't sure which earphone was best for study focus and Vee compared the battery life and noise isolation specs cleanly. Super smooth checkout experience.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-border/40 flex items-center justify-between text-xs">
              <span className="font-bold text-brand-text">Rohan V.</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                Verified Buyer
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
