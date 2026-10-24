import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Send, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-white border-t border-brand-border mt-20 pt-16 pb-12">
      {/* Brand Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-brand-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-brand-blush/60 border border-brand-border/50">
            <div className="p-2.5 rounded-full bg-brand-palePink text-brand-deepRose mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-brand-text mb-1">3 Speed Delivery</h4>
            <p className="text-[11px] sm:text-xs text-brand-secondary">
              From instant quick-commerce to eco standard courier.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-brand-blush/60 border border-brand-border/50">
            <div className="p-2.5 rounded-full bg-brand-palePink text-brand-deepRose mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-brand-text mb-1">Vaish Coins Rewards</h4>
            <p className="text-[11px] sm:text-xs text-brand-secondary">
              Earn coins on every rupee and redeem seamlessly.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-brand-blush/60 border border-brand-border/50">
            <div className="p-2.5 rounded-full bg-brand-palePink text-brand-deepRose mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-brand-text mb-1">100% Genuine Finds</h4>
            <p className="text-[11px] sm:text-xs text-brand-secondary">
              Curated beauty, lifestyle, and home products.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-brand-blush/60 border border-brand-border/50">
            <div className="p-2.5 rounded-full bg-brand-palePink text-brand-deepRose mb-3">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-brand-text mb-1">Hassle-Free Returns</h4>
            <p className="text-[11px] sm:text-xs text-brand-secondary">
              7-day seamless return & cancellation window.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-tight text-brand-text">
                Vaish<span className="text-brand-pink">&</span>Co<span className="text-brand-deepRose">.</span>
              </span>
            </Link>
            <p className="text-xs text-brand-secondary max-w-sm leading-relaxed">
              “Little things, lovely finds.” An all-in-one shopping platform designed with care to bring beauty, lifestyle, technology, and everyday essentials directly to your doorstep.
            </p>
            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="pt-2">
              <p className="text-xs font-semibold text-brand-text mb-2">
                Join our lovely newsletter for secret drops & coin bonuses:
              </p>
              <div className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow px-3.5 py-2 rounded-xl text-xs border border-brand-border bg-brand-blush focus:outline-none focus:border-brand-pink"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-pink hover:bg-brand-deepRose text-white text-xs font-semibold transition-all shrink-0 flex items-center gap-1 shadow-subtle"
                >
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribed && (
                <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Thank you for joining our community!
                </p>
              )}
            </form>
          </div>

          {/* Quick Categories */}
          <div>
            <h5 className="font-serif text-sm font-bold text-brand-text mb-3">Categories</h5>
            <ul className="space-y-2 text-xs text-brand-secondary">
              <li>
                <Link to="/products?category=beauty-skincare" className="hover:text-brand-pink transition-colors">
                  Beauty & Skincare
                </Link>
              </li>
              <li>
                <Link to="/products?category=fashion-lifestyle" className="hover:text-brand-pink transition-colors">
                  Fashion & Lifestyle
                </Link>
              </li>
              <li>
                <Link to="/products?category=electronics-technology" className="hover:text-brand-pink transition-colors">
                  Electronics & Tech
                </Link>
              </li>
              <li>
                <Link to="/products?category=home-living" className="hover:text-brand-pink transition-colors">
                  Home & Living
                </Link>
              </li>
              <li>
                <Link to="/products?category=grocery-fresh" className="hover:text-brand-pink transition-colors">
                  Grocery & Fresh
                </Link>
              </li>
              <li>
                <Link to="/products?category=everyday-essentials" className="hover:text-brand-pink transition-colors">
                  Everyday Essentials
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="font-serif text-sm font-bold text-brand-text mb-3">Customer Care</h5>
            <ul className="space-y-2 text-xs text-brand-secondary">
              <li>
                <Link to="/orders" className="hover:text-brand-pink transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/rewards" className="hover:text-brand-pink transition-colors">
                  Vaish Coins Loyalty
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-brand-pink transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link to="/returns-policy" className="hover:text-brand-pink transition-colors">
                  Returns & Cancellation
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-brand-pink transition-colors">
                  FAQs & Help Center
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-brand-pink transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Security */}
          <div>
            <h5 className="font-serif text-sm font-bold text-brand-text mb-3">Trust & Legal</h5>
            <ul className="space-y-2 text-xs text-brand-secondary">
              <li>
                <Link to="/privacy-policy" className="hover:text-brand-pink transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-brand-pink transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="inline-block py-1 px-2 rounded-md bg-stone-100 text-[10px] text-stone-600 font-semibold mt-2">
                  🔒 256-Bit SSL Encrypted
                </span>
              </li>
              <li className="text-[11px] text-brand-secondary/80 pt-1">
                Accepting UPI, Cards, NetBanking, and Cash on Delivery
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-secondary gap-4">
        <p>© {new Date().getFullYear()} Vaish&Co. All rights reserved.</p>
        <div className="flex items-center gap-1 text-brand-secondary">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-brand-pink fill-brand-pink" />
          <span>for lovely everyday finds</span>
        </div>
      </div>
    </footer>
  );
};
