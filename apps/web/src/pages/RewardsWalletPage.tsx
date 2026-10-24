import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  HelpCircle,
  Gift,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../lib/api';
import { RewardTransaction } from '../types';
import { useAuth } from '../context/AuthContext';

export const RewardsWalletPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [balance, setBalance] = useState<number>(user?.coinsBalance || 0);
  const [rules, setRules] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRewardsData = async () => {
      try {
        setIsLoading(true);
        const [balRes, txRes] = await Promise.all([
          api.getRewardsBalance().catch(() => ({ success: false, balance: user?.coinsBalance || 0, rules: {} })),
          api.getRewardsTransactions().catch(() => ({ success: false, transactions: [] })),
        ]);

        if (balRes.success) {
          setBalance(balRes.balance);
          setRules(balRes.rules);
        }
        if (txRes.success) {
          setTransactions(txRes.transactions || []);
        }
      } catch (err) {
        console.error('Failed to load rewards wallet:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRewardsData();
  }, [user]);

  const rupeeEquivalent = (balance * 0.5).toFixed(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ─── Hero Wallet Card ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 p-8 text-white shadow-elevated">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-100 text-xs font-bold">
              <Award className="w-4 h-4" />
              <span>Vaish Coins Rewards Wallet</span>
            </div>
            <div className="pt-2">
              <span className="text-xs text-amber-100 font-medium">Available Balance</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">
                  {balance}
                </span>
                <span className="text-base text-amber-100 font-bold">Coins</span>
              </div>
              <p className="text-xs text-amber-100/90 mt-1">
                ≈ ₹{rupeeEquivalent} discount value on future orders or wishlist redemption
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <Link
              to="/products"
              className="px-6 py-3 rounded-full bg-white text-amber-900 font-bold text-xs hover:bg-amber-50 transition-colors text-center shadow-sm"
            >
              Shop & Earn More Coins
            </Link>
            <Link
              to="/wishlist"
              className="px-6 py-2.5 rounded-full bg-amber-700/60 border border-amber-300/40 text-white font-bold text-xs hover:bg-amber-700/80 transition-colors text-center"
            >
              Redeem toward Wishlist
            </Link>
          </div>
        </div>

        {/* Ambient watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-20 pointer-events-none">
          <Coins className="w-56 h-56 text-white" />
        </div>
      </div>

      {/* ─── How it Works Pillars ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-brand-border/80 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-serif font-bold text-sm text-brand-text mb-1">Earn Seamlessly</h4>
          <p className="text-xs text-brand-secondary leading-relaxed">
            Get 1 Vaish Coin for every ₹100 of eligible completed purchases automatically credited upon confirmation.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border/80 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Gift className="w-5 h-5" />
          </div>
          <h4 className="font-serif font-bold text-sm text-brand-text mb-1">Instant Value</h4>
          <p className="text-xs text-brand-secondary leading-relaxed">
            1 Coin = ₹0.50 discount. Apply your coins via slider at checkout to offset up to 20% of your cart total.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border/80 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Heart className="w-5 h-5" />
          </div>
          <h4 className="font-serif font-bold text-sm text-brand-text mb-1">Wishlist Drops</h4>
          <p className="text-xs text-brand-secondary leading-relaxed">
            Apply your saved coins directly to favorites in your wishlist to convert dreams into lovely finds.
          </p>
        </div>
      </div>

      {/* ─── Transaction History Ledger ─────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
          <h3 className="font-serif font-bold text-base text-brand-text flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-pink" />
            <span>Coin Transaction Ledger</span>
          </h3>
          <span className="text-xs text-brand-secondary">{transactions.length} records</span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Coins className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs text-brand-secondary italic">No coin transactions yet.</p>
            <p className="text-[11px] text-brand-secondary">
              Place an order or sign up to start earning Vaish Coins!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-brand-border/40">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-serif font-bold text-brand-text">{tx.description}</p>
                  <p className="text-[11px] text-brand-secondary mt-0.5">
                    {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div
                  className={`font-bold text-sm ${
                    tx.type === 'EARNED' || tx.type === 'ADJUSTED'
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {tx.type === 'EARNED' || tx.type === 'ADJUSTED' ? `+${tx.amount}` : `-${tx.amount}`} Coins
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
