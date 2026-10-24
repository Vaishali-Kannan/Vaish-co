import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  Check,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { api } from '../lib/api';
import { Product, Category, DeliveryMode } from '../types';
import { ProductCard } from '../components/products/ProductCard';

export const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters from URL
  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const selectedDeliveryMode = searchParams.get('deliveryMode') || '';
  const sortBy = searchParams.get('sortBy') || 'featured';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const saleOnly = searchParams.get('sale') === 'true';

  useEffect(() => {
    api.getCategories().then((res) => {
      if (res.success && res.categories) setCategories(res.categories);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const params: Record<string, any> = {
          sortBy,
          limit: 30,
        };

        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery) params.search = searchQuery;
        if (selectedDeliveryMode) params.deliveryMode = selectedDeliveryMode;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (saleOnly) params.sale = 'true';

        const res = await api.getProducts(params);
        if (res.success) {
          setProducts(res.products || []);
          setTotalCount(res.pagination?.total || (res.products ? res.products.length : 0));
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    Boolean(searchQuery) ||
    Boolean(selectedDeliveryMode) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    saleOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ─── Breadcrumb & Title ─────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-brand-text">
          {searchQuery
            ? `Search results for "${searchQuery}"`
            : selectedCategory
            ? categories.find((c) => c.slug === selectedCategory)?.name || 'Lovely Finds'
            : selectedDeliveryMode === 'QUICK'
            ? '⚡ Quick Commerce (Delivered in Minutes)'
            : 'All Lovely Finds'}
        </h1>
        <p className="text-xs sm:text-sm text-brand-secondary mt-1">
          Showing {products.length} {products.length === 1 ? 'product' : 'curated products'}
        </p>
      </div>

      {/* ─── Control Bar ────────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border/70 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Toggle on Mobile */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="md:hidden w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-palePink text-brand-deepRose text-xs font-bold"
        >
          <Filter className="w-4 h-4" />
          <span>Filters & Categories {hasActiveFilters ? '(Active)' : ''}</span>
        </button>

        {/* Active Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-palePink text-brand-deepRose font-semibold border border-brand-border">
              Category: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
              <button onClick={() => updateParam('category', null)} aria-label="Remove filter">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {selectedDeliveryMode && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
              Delivery: {selectedDeliveryMode}
              <button onClick={() => updateParam('deliveryMode', null)} aria-label="Remove filter">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {saleOnly && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-brand-deepRose font-semibold border border-rose-200">
              Special Offers Only
              <button onClick={() => updateParam('sale', null)} aria-label="Remove filter">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-brand-secondary hover:text-brand-pink underline underline-offset-2 flex items-center gap-1 ml-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear all</span>
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <label htmlFor="sort-select" className="text-xs text-brand-secondary font-medium">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => updateParam('sortBy', e.target.value)}
            className="text-xs font-semibold rounded-xl border border-brand-border bg-brand-blush px-3 py-2 text-brand-text focus:outline-none focus:border-brand-pink"
          >
            <option value="featured">Featured Picks</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="bestselling">Bestsellers</option>
            <option value="newest">New Arrivals</option>
          </select>
        </div>
      </div>

      {/* ─── Main Content Grid: Sidebar + Products ──────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-brand-border/70 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <h3 className="font-serif font-bold text-sm text-brand-text flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-pink" />
                <span>Filters</span>
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-brand-deepRose hover:underline font-semibold"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Categories Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-3">
                Category
              </h4>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => updateParam('category', null)}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors ${
                    !selectedCategory
                      ? 'bg-brand-palePink font-bold text-brand-deepRose'
                      : 'text-brand-text hover:bg-brand-blush'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParam('category', cat.slug)}
                    className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-brand-palePink font-bold text-brand-deepRose'
                        : 'text-brand-text hover:bg-brand-blush'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5 text-brand-deepRose" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Mode Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-3">
                Delivery Speed
              </h4>
              <div className="space-y-1.5 text-xs">
                {(['QUICK', 'FAST', 'STANDARD'] as DeliveryMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() =>
                      updateParam('deliveryMode', selectedDeliveryMode === mode ? null : mode)
                    }
                    className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors flex items-center justify-between ${
                      selectedDeliveryMode === mode
                        ? 'bg-amber-50 font-bold text-amber-800 border border-amber-200'
                        : 'text-brand-text hover:bg-brand-blush'
                    }`}
                  >
                    <span>
                      {mode === 'QUICK' ? '⚡ Quick (Minutes)' : mode === 'FAST' ? '🚀 Fast (1-2 Days)' : '📦 Standard'}
                    </span>
                    {selectedDeliveryMode === mode && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-3">
                Price Range (₹)
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParam('minPrice', e.target.value || null)}
                  className="p-2 rounded-xl border border-brand-border bg-brand-blush"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value || null)}
                  className="p-2 rounded-xl border border-brand-border bg-brand-blush"
                />
              </div>
            </div>

            {/* Special Deals Checkbox */}
            <div className="pt-2 border-t border-brand-border/60">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-brand-text">
                <input
                  type="checkbox"
                  checked={saleOnly}
                  onChange={(e) => updateParam('sale', e.target.checked ? 'true' : null)}
                  className="rounded text-brand-pink focus:ring-brand-pink"
                />
                <span>Special Offers & Deals</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Cards Grid */}
        <main className="md:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-white rounded-2xl border border-brand-border animate-pulse p-4 flex flex-col justify-between"
                >
                  <div className="w-full aspect-square bg-brand-palePink/40 rounded-xl" />
                  <div className="space-y-2 mt-4">
                    <div className="h-4 bg-brand-palePink/60 rounded w-3/4" />
                    <div className="h-3 bg-brand-palePink/40 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-brand-border/70 space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-palePink text-brand-deepRose mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-text">No lovely finds matched</h3>
              <p className="text-xs text-brand-secondary max-w-sm mx-auto">
                We couldn't find anything matching your exact filter combination. Try clearing some filters or searching for something else.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 rounded-full bg-brand-pink hover:bg-brand-deepRose text-white font-semibold text-xs transition-colors shadow-subtle"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ─── Mobile Filters Drawer ───────────────────────────────────── */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-80 bg-white h-full p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <h3 className="font-serif font-bold text-base text-brand-text">Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} aria-label="Close filters">
                <X className="w-5 h-5 text-brand-text" />
              </button>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-3">
                Category
              </h4>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => {
                    updateParam('category', null);
                    setIsMobileFilterOpen(false);
                  }}
                  className={`w-full text-left py-2 px-3 rounded-lg ${
                    !selectedCategory ? 'bg-brand-palePink font-bold text-brand-deepRose' : 'text-brand-text'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      updateParam('category', cat.slug);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-brand-palePink font-bold text-brand-deepRose'
                        : 'text-brand-text'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-3">
                Delivery Speed
              </h4>
              <div className="space-y-1.5 text-xs">
                {(['QUICK', 'FAST', 'STANDARD'] as DeliveryMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      updateParam('deliveryMode', selectedDeliveryMode === mode ? null : mode);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-lg ${
                      selectedDeliveryMode === mode
                        ? 'bg-amber-50 font-bold text-amber-800'
                        : 'text-brand-text'
                    }`}
                  >
                    {mode === 'QUICK' ? '⚡ Quick (Minutes)' : mode === 'FAST' ? '🚀 Fast' : '📦 Standard'}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-brand-border">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-brand-pink text-white font-bold text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
