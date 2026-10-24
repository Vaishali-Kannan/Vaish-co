import React, { createContext, useContext, useState, useEffect } from 'react';
import { DeliveryMode } from '../types';

interface DeliveryContextType {
  deliveryMode: DeliveryMode;
  setDeliveryMode: (mode: DeliveryMode) => void;
  postalCode: string;
  setPostalCode: (code: string) => void;
  getModeDetails: (mode: DeliveryMode) => { title: string; subtitle: string; icon: string; time: string };
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deliveryMode, setDeliveryModeState] = useState<DeliveryMode>(() => {
    return (localStorage.getItem('vaish_delivery_mode') as DeliveryMode) || 'FAST';
  });
  const [postalCode, setPostalCodeState] = useState<string>(() => {
    return localStorage.getItem('vaish_postal_code') || '560001';
  });

  const setDeliveryMode = (mode: DeliveryMode) => {
    setDeliveryModeState(mode);
    localStorage.setItem('vaish_delivery_mode', mode);
  };

  const setPostalCode = (code: string) => {
    setPostalCodeState(code);
    localStorage.setItem('vaish_postal_code', code);
  };

  const getModeDetails = (mode: DeliveryMode) => {
    switch (mode) {
      case 'QUICK':
        return {
          title: 'Quick Delivery',
          subtitle: 'Select items delivered within minutes',
          icon: '⚡',
          time: '15-45 mins',
        };
      case 'FAST':
        return {
          title: 'Fast Delivery',
          subtitle: 'Guaranteed 1-2 days doorstep delivery',
          icon: '🚀',
          time: '1-2 Days',
        };
      case 'STANDARD':
      default:
        return {
          title: 'Standard Delivery',
          subtitle: 'Eco-friendly shipping with free thresholds',
          icon: '📦',
          time: '3-5 Days',
        };
    }
  };

  return (
    <DeliveryContext.Provider
      value={{
        deliveryMode,
        setDeliveryMode,
        postalCode,
        setPostalCode,
        getModeDetails,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
};
