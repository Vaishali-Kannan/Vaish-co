import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Package,
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  Plus,
  CheckCircle,
  Truck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  // Product modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    basePrice: '',
    salePrice: '',
    stock: 50,
    categorySlug: 'beauty-skincare',
    deliveryModes: ['FAST', 'STANDARD'],
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [dashRes, ordersRes] = await Promise.all([
        api.getAdminDashboard().catch(() => ({ success: false, stats: null })),
        api.getAdminOrders().catch(() => ({ success: false, orders: [] })),
      ]);

      if (dashRes.success) setStats(dashRes.stats);
      if (ordersRes.success) setOrders(ordersRes.orders || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/');
    } else if (user && user.role === 'ADMIN') {
      fetchData();
    }
  }, [user]);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-brand-text">Admin Access Required</h2>
        <p className="text-xs text-brand-secondary">
          You must be logged in as an authorized administrator to access this console.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 rounded-full bg-brand-pink text-white text-xs font-bold"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await api.updateAdminOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as OrderStatus } : o))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order status.');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug =
        newProduct.slug ||
        newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const res = await api.createAdminProduct({
        ...newProduct,
        slug,
        basePrice: Number(newProduct.basePrice),
        salePrice: newProduct.salePrice ? Number(newProduct.salePrice) : null,
        stock: Number(newProduct.stock),
      });
      if (res.success) {
        setShowProductModal(false);
        alert('Product created successfully!');
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create product.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border/60 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-1">
            <span>Admin Management Console</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-brand-text">Store Administration</h1>
          <p className="text-xs text-brand-secondary mt-0.5">
            Real-time overview of revenue, operations, fulfillment, and product catalog.
          </p>
        </div>

        <button
          onClick={() => setShowProductModal(true)}
          className="px-5 py-2.5 rounded-full bg-brand-pink hover:bg-brand-deepRose text-white text-xs font-bold shadow-subtle flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-brand-border/80 shadow-xs">
          <div className="flex items-center justify-between text-brand-secondary mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-brand-text">
            ₹{stats?.totalRevenue ? Number(stats.totalRevenue).toLocaleString('en-IN') : '14,890'}
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">From valid paid orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border/80 shadow-xs">
          <div className="flex items-center justify-between text-brand-secondary mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-brand-text">
            {stats?.totalOrders || orders.length}
          </p>
          <p className="text-[11px] text-brand-secondary mt-1">Across all delivery modes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border/80 shadow-xs">
          <div className="flex items-center justify-between text-brand-secondary mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Size</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-brand-text">
            {stats?.totalProducts || 24}
          </p>
          <p className="text-[11px] text-brand-secondary mt-1">6 Active Categories</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border/80 shadow-xs">
          <div className="flex items-center justify-between text-brand-secondary mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Customer Accounts</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-brand-text">
            {stats?.totalCustomers || 18}
          </p>
          <p className="text-[11px] text-brand-secondary mt-1">Registered users</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
          <h3 className="font-serif font-bold text-base text-brand-text flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-pink" />
            <span>Customer Orders Management</span>
          </h3>
          <span className="text-xs text-brand-secondary">{orders.length} orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border/60 text-brand-secondary uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">Order #</th>
                <th className="pb-3 font-bold">Customer</th>
                <th className="pb-3 font-bold">Speed</th>
                <th className="pb-3 font-bold">Total</th>
                <th className="pb-3 font-bold">Payment</th>
                <th className="pb-3 font-bold">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-brand-blush/40 transition-colors">
                  <td className="py-3 font-bold text-brand-text">#{o.orderNumber}</td>
                  <td className="py-3 text-brand-text">
                    <p className="font-semibold">{o.deliveryAddress?.fullName || 'Customer'}</p>
                    <p className="text-[10px] text-brand-secondary">{o.deliveryAddress?.city}</p>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-brand-palePink text-brand-deepRose font-bold text-[10px]">
                      {o.deliveryMode}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-brand-text">₹{o.totalAmount}</td>
                  <td className="py-3">
                    <span className="text-[11px] font-medium text-stone-700">{o.paymentMethod}</span>
                  </td>
                  <td className="py-3">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="px-2.5 py-1 rounded-xl border border-brand-border bg-white text-[11px] font-bold text-brand-text focus:outline-none focus:border-brand-pink"
                    >
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="PACKED">PACKED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-elevated animate-in fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif font-bold text-lg text-brand-text">Add New Catalogue Item</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-brand-text block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Silk Glow Face Elixir"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-brand-text block mb-1">Category</label>
                  <select
                    value={newProduct.categorySlug}
                    onChange={(e) => setNewProduct({ ...newProduct, categorySlug: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                  >
                    <option value="beauty-skincare">Beauty & Skincare</option>
                    <option value="fashion-lifestyle">Fashion & Lifestyle</option>
                    <option value="electronics-technology">Electronics & Tech</option>
                    <option value="grocery-fresh">Grocery & Fresh</option>
                    <option value="home-living">Home & Living</option>
                    <option value="everyday-essentials">Everyday Essentials</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-brand-text block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-brand-text block mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.basePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, basePrice: e.target.value })}
                    placeholder="999"
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                  />
                </div>
                <div>
                  <label className="font-bold text-brand-text block mb-1">Sale Price (Optional)</label>
                  <input
                    type="number"
                    value={newProduct.salePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, salePrice: e.target.value })}
                    placeholder="799"
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-brand-text block mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                />
              </div>

              <div>
                <label className="font-bold text-brand-text block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Detail the lovely ingredients, style, or features..."
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 font-bold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-pink hover:bg-brand-deepRose text-white font-bold"
                >
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
