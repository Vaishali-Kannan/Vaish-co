import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Truck,
  CheckCircle,
  Clock,
  Package,
  MapPin,
  CreditCard,
  Coins,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { api } from '../lib/api';
import { Order, OrderStatus } from '../types';
import { DeliveryBadge } from '../components/products/DeliveryBadge';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const res = await api.getOrderById(id);
        if (res.success && res.order) {
          setOrder(res.order);
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      const res = await api.cancelOrder(order.id, cancelReason || 'Customer requested cancellation');
      if (res.success && res.order) {
        setOrder(res.order);
        setShowCancelModal(false);
      }
    } catch (err: any) {
      alert(err.message || 'Unable to cancel this order.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-6 bg-brand-palePink/40 rounded w-32" />
        <div className="h-48 bg-white rounded-3xl border border-brand-border" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-brand-text">Order Not Found</h2>
        <Link to="/orders" className="text-xs font-bold text-brand-pink hover:underline">
          Return to My Orders
        </Link>
      </div>
    );
  }

  const canCancel = order.status === 'CONFIRMED' || order.status === 'PROCESSING' || order.status === 'PENDING_PAYMENT';

  const orderTimeline = [
    { label: 'Order Confirmed', completed: true },
    { label: 'Processing & Packed', completed: ['PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
    { label: 'Shipped', completed: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
    { label: 'Out for Delivery', completed: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
    { label: 'Delivered', completed: order.status === 'DELIVERED' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-secondary hover:text-brand-pink transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Orders</span>
      </Link>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border/60 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-brand-secondary">
            Order Details
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text">
            #{order.orderNumber}
          </h1>
          <p className="text-xs text-brand-secondary mt-1">
            Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DeliveryBadge mode={order.deliveryMode} size="md" />
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Tracking Timeline */}
      {order.status !== 'CANCELLED' ? (
        <div className="bg-white rounded-3xl p-6 border border-brand-border/80 shadow-xs">
          <h3 className="font-serif font-bold text-sm text-brand-text mb-6">Delivery Tracking</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
            {orderTimeline.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.completed
                      ? 'bg-brand-pink text-white shadow-subtle'
                      : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {step.completed ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                </div>
                <p className={`text-xs ${step.completed ? 'font-bold text-brand-text' : 'text-stone-400'}`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 rounded-3xl p-6 border border-red-200 text-red-800 flex items-center gap-3">
          <XCircle className="w-6 h-6 text-red-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Order Cancelled</h4>
            <p className="text-xs text-red-700 mt-0.5">
              This order has been cancelled and any eligible payments or rewards have been refunded.
            </p>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="bg-white rounded-3xl p-6 border border-brand-border/80 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-base text-brand-text pb-3 border-b border-brand-border/60">
          Items Ordered
        </h3>
        <div className="divide-y divide-brand-border/40">
          {order.items?.map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {item.productImage && (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0 bg-brand-palePink/30"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-serif font-bold text-sm text-brand-text truncate">
                    {item.productName}
                  </p>
                  {item.variantName && (
                    <p className="text-xs text-brand-secondary">{item.variantName}</p>
                  )}
                  <p className="text-xs text-brand-secondary mt-0.5">
                    Qty: {item.quantity} × ₹{item.unitPrice}
                  </p>
                </div>
              </div>
              <span className="font-bold text-sm text-brand-text shrink-0">
                ₹{Number(item.totalPrice).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary and Address Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white rounded-3xl p-6 border border-brand-border/80 shadow-xs space-y-2">
          <h3 className="font-serif font-bold text-sm text-brand-text flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-brand-pink" />
            <span>Shipping Address</span>
          </h3>
          <p className="text-xs font-bold text-brand-text">{order.deliveryAddress?.fullName}</p>
          <p className="text-xs text-brand-secondary">{order.deliveryAddress?.addressLine1}</p>
          <p className="text-xs text-brand-secondary">
            {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.postalCode}
          </p>
          <p className="text-[11px] text-brand-secondary pt-1">Phone: {order.deliveryAddress?.phone}</p>
        </div>

        {/* Payment & Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-brand-border/80 shadow-xs space-y-3">
          <h3 className="font-serif font-bold text-sm text-brand-text flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-brand-pink" />
            <span>Payment Summary</span>
          </h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-brand-secondary">
              <span>Payment Mode:</span>
              <span className="font-bold text-brand-text">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-brand-secondary">
              <span>Items Subtotal:</span>
              <span>₹{order.itemsSubtotal}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon Discount:</span>
                <span>-₹{order.discountAmount}</span>
              </div>
            )}
            {order.rewardCoinsUsed > 0 && (
              <div className="flex justify-between text-amber-700 font-semibold">
                <span>Vaish Coins ({order.rewardCoinsUsed}):</span>
                <span>-₹{order.rewardCoinsDiscount}</span>
              </div>
            )}
            <div className="flex justify-between text-brand-secondary">
              <span>Delivery Fee:</span>
              <span>₹{order.deliveryFee}</span>
            </div>
            <div className="pt-2 border-t border-brand-border/60 flex justify-between font-bold text-sm text-brand-text">
              <span>Total Paid:</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-elevated">
            <h3 className="font-serif font-bold text-base text-brand-text">Cancel Order #{order.orderNumber}</h3>
            <p className="text-xs text-brand-secondary">
              Are you sure you want to cancel this order? Any applied coins and payments will be credited back.
            </p>
            <div>
              <label className="text-xs font-bold text-brand-text block mb-1">Reason for cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush text-xs"
              >
                <option value="Changed my mind">Changed my mind</option>
                <option value="Order placed by mistake">Order placed by mistake</option>
                <option value="Delivery time is too long">Delivery time is too long</option>
                <option value="Want to change delivery address or items">Want to change delivery address or items</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
