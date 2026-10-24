import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Coins,
  Menu,
  X,
  Zap,
  Clock,
  Package,
  ChevronDown,
  LogOut,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useDelivery } from '../../context/DeliveryContext';
import { api } from '../../lib/api';
import { Category, DeliveryMode } from '../../types';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { deliveryMode, setDeliveryMode, getModeDetails } = useDelivery();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDeliveryDropdownOpen, setIsDeliveryDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const deliveryRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch categories
  useEffect(() => {
    api.getCategories().then((res) => {
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    }).catch(() => {});
  }, []);

  // Autocomplete suggestions debounce
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        api.getSearchSuggestions(searchQuery.trim()).then((res) => {
          if (res.success) {
            setSuggestions(res.suggestions || []);
          }
        }).catch(() => {});
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (deliveryRef.current && !deliveryRef.current.contains(event.target as Node)) {
        setIsDeliveryDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const currentModeInfo = getModeDetails(deliveryMode);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-brand-text hover:text-brand-pink"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo & Tagline */}
          <Link to="/" className="flex flex-col shrink-0 group">
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-brand-text group-hover:text-brand-deepRose transition-colors">
              Vaish<span className="text-brand-pink">&</span>Co<span className="text-brand-deepRose">.</span>
            </span>
            <span className="text-[10px] sm:text-xs text-brand-secondary font-medium tracking-wide -mt-1 hidden sm:block">
              Little things, lovely finds.
            </span>
          </Link>

          {/* Delivery Mode Selector (Desktop) */}
          <div className="relative hidden lg:block" ref={deliveryRef}>
            <button
              onClick={() => setIsDeliveryDropdownOpen(!isDeliveryDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-border bg-brand-palePink/40 hover:bg-brand-palePink text-brand-text text-xs font-semibold transition-colors"
            >
              <span className="text-base">{currentModeInfo.icon}</span>
              <div className="text-left">
                <p className="text-[10px] text-brand-secondary leading-none">Deliver via</p>
                <p className="font-bold leading-tight text-brand-deepRose">{currentModeInfo.title}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-brand-secondary ml-1" />
            </button>

            {/* Delivery Dropdown */}
            {isDeliveryDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-elevated border border-brand-border p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-brand-border/60">
                  <p className="text-xs font-bold text-brand-text">Select delivery preference</p>
                  <p className="text-[11px] text-brand-secondary">Filter products suited to your schedule</p>
                </div>
                {(['QUICK', 'FAST', 'STANDARD'] as DeliveryMode[]).map((mode) => {
                  const info = getModeDetails(mode);
                  const isSelected = deliveryMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => {
                        setDeliveryMode(mode);
                        setIsDeliveryDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors my-1 ${
                        isSelected
                          ? 'bg-brand-palePink/80 border border-brand-pink/30 text-brand-deepRose'
                          : 'hover:bg-brand-blush text-brand-text'
                      }`}
                    >
                      <span className="text-xl shrink-0 mt-0.5">{info.icon}</span>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{info.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-palePink text-brand-deepRose font-semibold">
                            {info.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-brand-secondary mt-0.5">{info.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative flex-grow max-w-md hidden sm:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search skincare, dresses, essentials, technology..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-brand-border bg-brand-blush text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink transition-all placeholder:text-brand-secondary/70"
                />
                <Search className="w-4 h-4 text-brand-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </form>

            {/* Autocomplete Suggestions Box */}
            {isSearchOpen && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-elevated border border-brand-border py-2 z-50 max-h-80 overflow-y-auto">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-secondary">
                  Suggestions
                </div>
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsSearchOpen(false);
                      if (item.type === 'product') {
                        navigate(`/products/${item.slug}`);
                      } else {
                        navigate(`/products?search=${encodeURIComponent(item.text)}`);
                      }
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-brand-palePink/50 flex items-center justify-between text-xs text-brand-text transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-brand-secondary" />
                      <span>{item.text}</span>
                    </div>
                    {item.category && (
                      <span className="text-[10px] text-brand-secondary bg-brand-blush px-2 py-0.5 rounded-full border border-brand-border">
                        {item.category}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Vaish Coins Badge */}
            <Link
              to="/rewards"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors"
              title="Vaish Coins Loyalty Program"
            >
              <Coins className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="font-bold">{user?.coinsBalance || 0}</span>
              <span className="hidden xl:inline text-[11px] font-medium text-amber-700">Coins</span>
            </Link>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-brand-text hover:text-brand-pink transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-deepRose text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Bag */}
            <Link
              to="/cart"
              className="relative p-2 text-brand-text hover:text-brand-pink transition-colors"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-pink text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Account Menu */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-brand-palePink transition-colors border border-transparent hover:border-brand-border"
                  title="My Account"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-pink text-white font-bold text-xs flex items-center justify-center">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-brand-secondary hidden sm:block" />
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-brand-text hover:text-brand-pink px-2.5 py-1.5 rounded-full hover:bg-brand-palePink transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs font-semibold text-white bg-brand-pink hover:bg-brand-deepRose px-3.5 py-1.5 rounded-full transition-all shadow-subtle hidden sm:inline-block"
                  >
                    Join
                  </Link>
                </div>
              )}

              {/* User Dropdown */}
              {isUserMenuOpen && user && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-brand-border p-2 z-50">
                  <div className="px-3 py-2 border-b border-brand-border/60">
                    <p className="text-xs font-bold text-brand-text truncate">{user.fullName}</p>
                    <p className="text-[11px] text-brand-secondary truncate">{user.email}</p>
                    {user.role === 'ADMIN' && (
                      <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="py-1">
                    <Link
                      to="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-3 py-2 text-xs text-brand-text hover:bg-brand-palePink/50 rounded-lg transition-colors"
                    >
                      My Profile & Addresses
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-3 py-2 text-xs text-brand-text hover:bg-brand-palePink/50 rounded-lg transition-colors"
                    >
                      Orders & Tracking
                    </Link>
                    <Link
                      to="/rewards"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-3 py-2 text-xs text-brand-text hover:bg-brand-palePink/50 rounded-lg transition-colors"
                    >
                      Vaish Coins Wallet ({user.coinsBalance})
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                  </div>
                  <div className="pt-1 border-t border-brand-border/60">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-brand-error hover:bg-red-50 rounded-lg transition-colors text-left font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Navigation Bar (Desktop) */}
        <nav className="hidden md:flex items-center justify-between border-t border-brand-border/40 py-2.5 overflow-x-auto text-xs">
          <div className="flex items-center gap-6">
            <Link
              to="/products"
              className="font-semibold text-brand-text hover:text-brand-pink transition-colors shrink-0"
            >
              All Lovely Finds
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="text-brand-secondary hover:text-brand-pink font-medium transition-colors shrink-0"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/products?sale=true"
              className="font-bold text-brand-deepRose hover:text-brand-pink transition-colors shrink-0 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
              Special Offers
            </Link>
          </div>
          <Link
            to="/products?deliveryMode=QUICK"
            className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60 hover:bg-amber-100 transition-colors shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            Quick Commerce
          </Link>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-brand-border px-4 pt-3 pb-6 space-y-4">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-brand-border bg-brand-blush text-sm"
              />
              <Search className="w-4 h-4 text-brand-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </form>

          {/* Delivery Mode on Mobile */}
          <div className="bg-brand-palePink/30 p-3 rounded-xl border border-brand-border">
            <p className="text-xs font-bold text-brand-text mb-2">Delivery Speed</p>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {(['QUICK', 'FAST', 'STANDARD'] as DeliveryMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDeliveryMode(mode)}
                  className={`py-1.5 px-2 rounded-lg text-center font-semibold transition-all ${
                    deliveryMode === mode
                      ? 'bg-brand-pink text-white shadow-sm'
                      : 'bg-white text-brand-text hover:bg-brand-palePink'
                  }`}
                >
                  {mode === 'QUICK' ? '⚡ Quick' : mode === 'FAST' ? '🚀 Fast' : '📦 Standard'}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Categories */}
          <div>
            <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-2">
              Explore Categories
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-brand-blush hover:bg-brand-palePink text-brand-text font-medium"
              >
                All Products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-brand-blush hover:bg-brand-palePink text-brand-text font-medium"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
