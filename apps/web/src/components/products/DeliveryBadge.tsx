import React from 'react';
import { DeliveryMode } from '../../types';
import { Zap, Clock, ShieldCheck } from 'lucide-react';

interface DeliveryBadgeProps {
  mode: DeliveryMode;
  size?: 'sm' | 'md';
}

export const DeliveryBadge: React.FC<DeliveryBadgeProps> = ({ mode, size = 'sm' }) => {
  if (mode === 'QUICK') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${
          size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
        }`}
      >
        <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
        <span>Quick (15-45m)</span>
      </span>
    );
  }

  if (mode === 'FAST') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-rose-50 text-brand-deepRose border border-brand-border ${
          size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
        }`}
      >
        <Clock className="w-3 h-3 text-brand-pink" />
        <span>Fast (1-2 Days)</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full bg-stone-50 text-stone-600 border border-stone-200 ${
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
    >
      <ShieldCheck className="w-3 h-3 text-stone-400" />
      <span>Standard</span>
    </span>
  );
};
