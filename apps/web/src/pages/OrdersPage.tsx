import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { api } from '../lib/api';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { DeliveryBadge } from '../components/products/DeliveryBadge';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const res = await api.getOrders();
        if (res.success && res.orders) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Delivered</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 animate-pulse">Out for Delivery</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">Shipped</span>;
      case 'CONFIRMED':
      case 'PROCESSING':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Processing</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-800">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-4">
        <div className="h-8 bg-brand-palePink/50 rounded w-48" />
        <div className="h-32 bg-white rounded-2xl border border-brand-border" />
        <div className="h-32 bg-white rounded-2xl border border-brand-border" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-text">My Orders</h1>
        <p className="text-xs sm:text-sm text-brand-secondary mt-1">
          Track packages, view receipts, and review past lovely finds.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-brand-border space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-brand-palePink text-brand-deepRose mx-auto flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-brand-text">No orders placed yet</h3>
          <p className="text-xs text-brand-secondary max-w-sm mx-auto">
            Once you make your first lovely discovery, you'll be able to track every step of delivery right here.
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-2.5 rounded-full bg-brand-pink text-white text-xs font-bold"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-6 border border-brand-border/80 shadow-xs space-y-4 hover:border-brand-pink/50 transition-colors"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border/50 gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-brand-secondary">
                    Order #{order.orderNumber}
                  </span>
                  <p className="text-xs text-brand-secondary">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <DeliveryBadge mode={order.deliveryMode} size="sm" />
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 bg-brand-palePink/30"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-serif font-bold text-brand-text truncate">{item.productName}</p>
                        <p className="text-brand-secondary text-[11px]">
                          Qty: {item.quantity} {item.variantName ? `• ${item.variantName}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-brand-text shrink-0">
                      ₹{Number(item.totalPrice).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer info & Total */}
              <div className="pt-3 border-t border-brand-border/50 flex items-center justify-between text-xs">
                <div>
                  <span className="text-brand-secondary">Total: </span>
                  <span className="font-bold text-sm text-brand-text">₹{order.totalAmount}</span>
                  {order.rewardCoinsEarned > 0 && (
                    <span className="text-[11px] text-amber-700 font-semibold ml-2">
                      (+{order.rewardCoinsEarned} coins earned)
                    </span>
                  )}
                </div>

                <Link
                  to={`/orders/${order.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-deepRose hover:text-brand-pink transition-colors"
                >
                  <span>View Details & Tracking</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
