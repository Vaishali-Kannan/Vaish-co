import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle,
  Truck,
  CreditCard,
  MapPin,
  ShieldCheck,
  Coins,
  ArrowRight,
  AlertCircle,
  ChevronRight,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useDelivery } from '../context/DeliveryContext';
import { api } from '../lib/api';
import { Address, DeliveryMode, PaymentMethod } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, addresses, addAddress } = useAuth();
  const { items, subtotal, discount, deliveryFee, coinsUsed, coinsDiscount, total, appliedCoupon, clearCart } =
    useCart();
  const { deliveryMode, setDeliveryMode, getModeDetails, postalCode } = useDelivery();

  // Steps: 1 = Address, 2 = Delivery, 3 = Payment
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // New Address form
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '9876543210',
    addressLine1: '',
    addressLine2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: postalCode || '560001',
    country: 'India',
  });

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    } else if (addresses.length === 0) {
      setIsAddingNewAddress(true);
    }
  }, [addresses]);

  if (items.length === 0 && !completedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-brand-text">Your bag is empty</h2>
        <p className="text-xs text-brand-secondary">Please add items to your shopping bag before checking out.</p>
        <Link
          to="/products"
          className="inline-block px-6 py-2.5 rounded-full bg-brand-pink text-white text-xs font-semibold"
        >
          Explore Finds
        </Link>
      </div>
    );
  }

  // Handle Place Order
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const orderPayload: any = {
        deliveryMode,
        paymentMethod,
        rewardCoinsUsed: coinsUsed,
        couponCode: appliedCoupon || undefined,
      };

      if (selectedAddressId && !isAddingNewAddress) {
        orderPayload.addressId = selectedAddressId;
      } else {
        orderPayload.shippingAddress = newAddress;
      }

      const res = await api.createOrder(orderPayload);
      if (res.success && res.order) {
        if (paymentMethod === 'ONLINE') {
          // Razorpay test verification simulation
          try {
            await api.verifyPayment({
              orderId: res.order.id,
              razorpayOrderId: res.razorpayOrder?.id || 'order_sim_' + Date.now(),
              razorpayPaymentId: 'pay_sim_' + Date.now(),
              razorpaySignature: 'sig_valid_test_simulation',
            });
          } catch (e) {
            console.warn('Payment verify simulation handled:', e);
          }
        }

        setCompletedOrder(res.order);
        clearCart();
      } else {
        setErrorMessage('Failed to place order. Please check item availability.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during checkout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Success Screen
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-subtle animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-pink">Order Confirmed</span>
          <h1 className="font-serif text-3xl font-bold text-brand-text mt-1">Thank you for your order!</h1>
          <p className="text-xs sm:text-sm text-brand-secondary mt-1">
            Order #{completedOrder.orderNumber} has been received and is being prepared with love.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-border/80 shadow-card text-left space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60 text-xs">
            <span className="text-brand-secondary">Delivery Method:</span>
            <span className="font-bold text-brand-deepRose">
              {getModeDetails(completedOrder.deliveryMode).title} ({getModeDetails(completedOrder.deliveryMode).time})
            </span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60 text-xs">
            <span className="text-brand-secondary">Payment Method:</span>
            <span className="font-bold text-brand-text">{completedOrder.paymentMethod}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60 text-xs">
            <span className="text-brand-secondary">Total Amount Paid:</span>
            <span className="font-bold text-base text-brand-text">₹{completedOrder.totalAmount}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
            <span className="flex items-center gap-1.5 font-bold">
              <Coins className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Vaish Coins Earned:</span>
            </span>
            <span className="font-bold">+{completedOrder.rewardCoinsEarned || Math.floor(Number(completedOrder.totalAmount) / 100)} Coins</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            to={`/orders`}
            className="px-6 py-3 rounded-full bg-brand-pink hover:bg-brand-deepRose text-white text-xs font-bold transition-all shadow-subtle"
          >
            Track in My Orders
          </Link>
          <Link
            to="/"
            className="px-6 py-3 rounded-full bg-white hover:bg-brand-palePink border border-brand-border text-brand-text text-xs font-bold transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Steps Indicator */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-text">Checkout</h1>
        <div className="flex items-center gap-3 text-xs font-bold mt-2">
          <span className={`px-2.5 py-1 rounded-full ${currentStep >= 1 ? 'bg-brand-pink text-white' : 'bg-stone-200 text-stone-600'}`}>
            1. Address
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className={`px-2.5 py-1 rounded-full ${currentStep >= 2 ? 'bg-brand-pink text-white' : 'bg-stone-200 text-stone-600'}`}>
            2. Delivery
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className={`px-2.5 py-1 rounded-full ${currentStep >= 3 ? 'bg-brand-pink text-white' : 'bg-stone-200 text-stone-600'}`}>
            3. Payment
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Step Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Delivery Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
              <h3 className="font-serif font-bold text-lg text-brand-text flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-pink" />
                <span>1. Shipping Address</span>
              </h3>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                  className="text-xs font-bold text-brand-deepRose hover:underline"
                >
                  {isAddingNewAddress ? 'Select Saved Address' : '+ Add New Address'}
                </button>
              )}
            </div>

            {/* Existing Saved Addresses */}
            {!isAddingNewAddress && addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-brand-pink bg-brand-palePink/30 shadow-subtle'
                        : 'border-brand-border/70 hover:border-brand-pink/50'
                    }`}
                  >
                    <p className="font-bold text-xs text-brand-text">{addr.fullName}</p>
                    <p className="text-xs text-brand-secondary mt-1">{addr.addressLine1}</p>
                    <p className="text-xs text-brand-secondary">{addr.city}, {addr.state} - {addr.postalCode}</p>
                    <p className="text-[11px] text-brand-secondary mt-1">Phone: {addr.phone}</p>
                  </div>
                ))}
              </div>
            )}

            {/* New Address Form */}
            {(isAddingNewAddress || addresses.length === 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-brand-text block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                    placeholder="Recipient's Name"
                  />
                </div>
                <div>
                  <label className="font-bold text-brand-text block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-brand-text block mb-1">Address (House / Flat / Street)</label>
                  <input
                    type="text"
                    required
                    value={newAddress.addressLine1}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                    placeholder="e.g. 42 Rose Blossom Villa, 5th Cross"
                  />
                </div>
                <div>
                  <label className="font-bold text-brand-text block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                  />
                </div>
                <div>
                  <label className="font-bold text-brand-text block mb-1">Postal Code (PIN)</label>
                  <input
                    type="text"
                    required
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                    maxLength={6}
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Delivery Method */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-lg text-brand-text flex items-center gap-2 pb-3 border-b border-brand-border/60">
              <Truck className="w-5 h-5 text-brand-pink" />
              <span>2. Delivery Speed</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(['QUICK', 'FAST', 'STANDARD'] as DeliveryMode[]).map((mode) => {
                const info = getModeDetails(mode);
                const isSelected = deliveryMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setDeliveryMode(mode)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-brand-pink bg-brand-palePink/30 shadow-subtle'
                        : 'border-brand-border hover:border-brand-pink/40'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{info.icon}</span>
                    <p className="font-bold text-xs text-brand-text">{info.title}</p>
                    <p className="text-[11px] text-brand-deepRose font-bold">{info.time}</p>
                    <p className="text-[11px] text-brand-secondary mt-1">{info.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Payment Method */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-lg text-brand-text flex items-center gap-2 pb-3 border-b border-brand-border/60">
              <CreditCard className="w-5 h-5 text-brand-pink" />
              <span>3. Payment Method</span>
            </h3>

            <div className="space-y-3">
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'ONLINE'
                    ? 'border-brand-pink bg-brand-palePink/30'
                    : 'border-brand-border hover:border-brand-pink/40'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={() => setPaymentMethod('ONLINE')}
                  className="mt-1 text-brand-pink focus:ring-brand-pink"
                />
                <div>
                  <p className="font-bold text-xs text-brand-text">
                    Online Payment (UPI, Credit/Debit Card, NetBanking)
                  </p>
                  <p className="text-[11px] text-brand-secondary mt-0.5">
                    Secured by Razorpay test gateway simulation. Instant verification.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-brand-pink bg-brand-palePink/30'
                    : 'border-brand-border hover:border-brand-pink/40'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className="mt-1 text-brand-pink focus:ring-brand-pink"
                />
                <div>
                  <p className="font-bold text-xs text-brand-text">Cash on Delivery (COD)</p>
                  <p className="text-[11px] text-brand-secondary mt-0.5">
                    Pay upon arrival at your doorstep in cash or scan UPI with the courier.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-2xl border border-stone-200 opacity-60 cursor-not-allowed">
                <input type="radio" disabled name="payment" className="mt-1" />
                <div>
                  <p className="font-bold text-xs text-stone-500">Pay Later (Demo)</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Subject to provider configuration and credit approval.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Confirmation */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-brand-border/80 shadow-card space-y-4">
            <h3 className="font-serif font-bold text-base text-brand-text pb-3 border-b border-brand-border/60">
              Review & Place Order
            </h3>

            {/* Items preview */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between items-center text-xs">
                  <span className="truncate max-w-[180px] font-medium text-brand-text">
                    {i.quantity}x {i.product.name}
                  </span>
                  <span className="font-bold text-brand-text">
                    ₹{((Number(i.product.salePrice || i.product.basePrice)) * i.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="pt-3 border-t border-brand-border/60 space-y-2 text-xs">
              <div className="flex justify-between text-brand-secondary">
                <span>Subtotal</span>
                <span className="font-semibold text-brand-text">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {coinsDiscount > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>Vaish Coins ({coinsUsed})</span>
                  <span>-₹{coinsDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-brand-secondary">
                <span>Delivery Fee</span>
                <span className="font-semibold text-brand-text">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="pt-2 border-t border-brand-border/60 flex items-baseline justify-between font-bold text-sm">
                <span>Total Amount:</span>
                <span className="font-serif text-xl text-brand-text">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full py-4 rounded-full bg-brand-pink hover:bg-brand-deepRose text-white font-bold text-sm transition-all shadow-elevated hover:shadow-pink-glow disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Placing Order...' : `Pay ₹${total.toLocaleString('en-IN')} & Confirm`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
