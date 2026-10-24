import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  Coins,
  ShieldCheck,
  Tag,
  Check,
  Zap,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useDelivery } from '../context/DeliveryContext';
import { DeliveryMode } from '../types';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    itemCount,
    subtotal,
    discount,
    deliveryFee,
    coinsUsed,
    coinsDiscount,
    total,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    applyCoins,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { deliveryMode, setDeliveryMode, getModeDetails } = useDelivery();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const maxCoinsAllowed = Math.floor((subtotal * 0.2) / 0.5);
  const userCoins = user?.coinsBalance || 0;
  const maxRedeemableCoins = Math.min(userCoins, maxCoinsAllowed);

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;
    const ok = await applyCoupon(couponInput.trim());
    if (ok) {
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code. Try WELCOME10 or VAISH50');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-brand-palePink text-brand-deepRose mx-auto flex items-center justify-center shadow-subtle">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-brand-text">Your bag is empty</h2>
        <p className="text-xs sm:text-sm text-brand-secondary max-w-sm mx-auto">
          Explore our lovely finds across beauty, lifestyle, tech, and everyday essentials to fill your bag!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-pink hover:bg-brand-deepRose text-white font-semibold text-xs sm:text-sm transition-all shadow-elevated"
        >
          <span>Discover Lovely Finds</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-text">Shopping Bag</h1>
        <p className="text-xs sm:text-sm text-brand-secondary mt-1">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} in your bag
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Delivery Mode Banner */}
          <div className="p-4 rounded-2xl bg-white border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-secondary">
                Selected Delivery Speed
              </span>
              <p className="text-xs font-bold text-brand-deepRose mt-0.5">
                {getModeDetails(deliveryMode).icon} {getModeDetails(deliveryMode).title} ({getModeDetails(deliveryMode).time})
              </p>
            </div>
            <div className="flex gap-1.5">
              {(['QUICK', 'FAST', 'STANDARD'] as DeliveryMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDeliveryMode(mode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    deliveryMode === mode
                      ? 'bg-brand-pink text-white border-brand-pink shadow-xs'
                      : 'bg-brand-blush text-brand-text border-brand-border hover:bg-brand-palePink'
                  }`}
                >
                  {mode === 'QUICK' ? '⚡ Quick' : mode === 'FAST' ? '🚀 Fast' : '📦 Std'}
                </button>
              ))}
            </div>
          </div>

          {/* Cart Items */}
          <div className="bg-white rounded-3xl border border-brand-border/70 divide-y divide-brand-border/50 overflow-hidden shadow-xs">
            {items.map((item) => {
              const unitPrice = item.variant?.salePrice
                ? Number(item.variant.salePrice)
                : item.variant?.price
                ? Number(item.variant.price)
                : item.product.salePrice
                ? Number(item.product.salePrice)
                : Number(item.product.basePrice);

              const itemImage =
                item.variant?.imageUrl ||
                item.product.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80';

              return (
                <div key={item.id} className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-center">
                  {/* Photo */}
                  <Link
                    to={`/products/${item.product.slug}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-brand-palePink/40 shrink-0 border border-brand-border/60"
                  >
                    <img src={itemImage} alt={item.product.name} className="w-full h-full object-cover" />
                  </Link>

                  {/* Info */}
                  <div className="flex-grow min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary">
                      {item.product.brand?.name || 'Vaish&Co.'}
                    </span>
                    <Link
                      to={`/products/${item.product.slug}`}
                      className="font-serif font-bold text-sm sm:text-base text-brand-text hover:text-brand-pink transition-colors line-clamp-1 block"
                    >
                      {item.product.name}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-brand-secondary mt-0.5">
                        Option: <span className="font-semibold text-brand-text">{item.variant.name}</span>
                      </p>
                    )}
                    <p className="font-bold text-sm text-brand-text mt-1">
                      ₹{unitPrice.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Quantity & Delete */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                    <div className="flex items-center border border-brand-border rounded-xl bg-brand-blush overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-xs font-bold text-brand-text hover:bg-brand-palePink"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-brand-text min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-xs font-bold text-brand-text hover:bg-brand-palePink"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-stone-400 hover:text-brand-error transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Summary, Coins & Checkout */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order Summary Box */}
          <div className="bg-white rounded-3xl p-6 border border-brand-border/70 shadow-card space-y-5">
            <h3 className="font-serif font-bold text-lg text-brand-text pb-3 border-b border-brand-border/60">
              Order Summary
            </h3>

            {/* Price lines */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-brand-secondary">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold text-brand-text">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {coinsDiscount > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>Vaish Coins ({coinsUsed} coins)</span>
                  <span>-₹{coinsDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-brand-secondary">
                <span>Delivery Fee ({getModeDetails(deliveryMode).title})</span>
                <span className="font-semibold text-brand-text">
                  {deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>
            </div>

            {/* Vaish Coins Slider / Redemption */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Vaish Coins</span>
                </span>
                <span className="text-[11px] text-amber-800 font-semibold">
                  Balance: {userCoins}
                </span>
              </div>

              {userCoins > 0 ? (
                <div>
                  <input
                    type="range"
                    min="0"
                    max={maxRedeemableCoins}
                    step="1"
                    value={coinsUsed}
                    onChange={(e) => applyCoins(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[11px] text-amber-800 mt-1">
                    <span>Using: {coinsUsed} coins</span>
                    <span className="font-bold">Saves ₹{(coinsUsed * 0.5).toFixed(0)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-amber-800/80">
                  You'll earn ~{Math.floor(subtotal / 100)} coins on this order!
                </p>
              )}
            </div>

            {/* Coupon Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon '{appliedCoupon}' Applied</span>
                  </div>
                  <button onClick={removeCoupon} className="text-emerald-600 hover:underline text-[11px]">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCouponSubmit} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. WELCOME10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-grow px-3 py-2 text-xs rounded-xl border border-brand-border bg-brand-blush uppercase font-semibold"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-brand-blush hover:bg-brand-palePink border border-brand-border text-xs font-bold text-brand-deepRose"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
                </form>
              )}
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-brand-border/60 flex items-baseline justify-between">
              <div>
                <p className="text-xs text-brand-secondary font-medium">Final Payable Total</p>
                <p className="font-serif text-2xl font-bold text-brand-text">
                  ₹{total.toLocaleString('en-IN')}
                </p>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                Savings: ₹{(discount + coinsDiscount).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-6 rounded-full bg-brand-pink hover:bg-brand-deepRose text-white font-bold text-sm transition-all shadow-elevated hover:shadow-pink-glow flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-brand-secondary pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-pink" />
              <span>Safe & 256-bit Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
