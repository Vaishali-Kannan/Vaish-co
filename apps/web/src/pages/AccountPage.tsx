import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  MapPin,
  Package,
  Award,
  Heart,
  LogOut,
  Plus,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, addresses, addAddress, logout } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '9876543210',
    addressLine1: '',
    addressLine2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560001',
    country: 'India',
    isDefault: true,
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-brand-text">Please Sign In</h2>
        <p className="text-xs text-brand-secondary">
          Sign in to view your profile, manage addresses, and access orders.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 rounded-full bg-brand-pink text-white text-xs font-bold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.addressLine1.trim()) return;
    try {
      await addAddress(newAddr);
      setShowAddModal(false);
      setNewAddr({ ...newAddr, addressLine1: '' });
    } catch (err: any) {
      alert(err.message || 'Failed to save address.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-text">My Account</h1>
        <p className="text-xs sm:text-sm text-brand-secondary mt-1">
          Manage your contact details, saved addresses, and shopping preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-brand-border/80 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-palePink text-brand-deepRose flex items-center justify-center font-serif text-2xl font-bold">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-brand-text">{user.fullName}</h3>
            <p className="text-xs text-brand-secondary">{user.email}</p>
            {user.phone && <p className="text-xs text-brand-secondary">{user.phone}</p>}
          </div>

          <div className="pt-2 border-t border-brand-border/50 space-y-2 text-xs">
            <Link
              to="/orders"
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-brand-palePink/50 text-brand-text font-medium transition-colors"
            >
              <Package className="w-4 h-4 text-brand-pink" />
              <span>My Orders</span>
            </Link>
            <Link
              to="/rewards"
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-brand-palePink/50 text-brand-text font-medium transition-colors"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>Vaish Coins ({user.coinsBalance})</span>
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-brand-palePink/50 text-brand-text font-medium transition-colors"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>My Wishlist</span>
            </Link>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Address Book */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-brand-border/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
            <h3 className="font-serif font-bold text-base text-brand-text flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-pink" />
              <span>Saved Delivery Addresses</span>
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-palePink text-brand-deepRose text-xs font-bold hover:bg-brand-pink hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Address</span>
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <MapPin className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-xs text-brand-secondary">No delivery addresses saved yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-2xl border border-brand-border/80 bg-brand-blush/30 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-brand-text">{addr.fullName}</p>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-brand-deepRose bg-brand-palePink px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-brand-secondary">{addr.addressLine1}</p>
                  <p className="text-brand-secondary">{addr.city}, {addr.state} - {addr.postalCode}</p>
                  <p className="text-brand-secondary pt-1">Phone: {addr.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-elevated animate-in fade-in">
            <h3 className="font-serif font-bold text-base text-brand-text">Add New Delivery Address</h3>
            <form onSubmit={handleAddAddressSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-brand-text block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAddr.fullName}
                  onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                />
              </div>
              <div>
                <label className="font-bold text-brand-text block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                />
              </div>
              <div>
                <label className="font-bold text-brand-text block mb-1">Address Line</label>
                <input
                  type="text"
                  required
                  value={newAddr.addressLine1}
                  onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-brand-text block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                  />
                </div>
                <div>
                  <label className="font-bold text-brand-text block mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newAddr.postalCode}
                    onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-blush"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 font-bold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-pink hover:bg-brand-deepRose text-white font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
