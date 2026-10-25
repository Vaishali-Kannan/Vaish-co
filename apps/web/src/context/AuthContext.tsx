import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Address } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  addresses: Address[];
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<void>;
  loginWithGoogle: (googleData: { email: string; name?: string; avatar?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshAddresses: () => Promise<void>;
  addAddress: (address: any) => Promise<Address>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUser = (u: any): User | null => {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName || u.name || (u.email ? u.email.split('@')[0] : 'Shopper'),
    phone: u.phone,
    role: u.role || 'CUSTOMER',
    isEmailVerified: u.isEmailVerified ?? u.emailVerified ?? true,
    coinsBalance: u.coinsBalance ?? u.rewardAccount?.balance ?? 50,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('vaish_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const res = await api.getCurrentUser();
      if (res.success && res.user) {
        setUser(normalizeUser(res.user));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      localStorage.removeItem('vaish_token');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAddresses = async () => {
    if (!user) return;
    try {
      const res = await api.getAddresses();
      if (res.success) {
        setAddresses(res.addresses || []);
      }
    } catch (e) {
      console.error('Failed to fetch addresses:', e);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (user) {
      refreshAddresses();
    } else {
      setAddresses([]);
    }
  }, [user]);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    if (res.token) {
      localStorage.setItem('vaish_token', res.token);
    }
    setUser(normalizeUser(res.user));
  };

  const register = async (data: { email: string; password: string; fullName: string; phone?: string }) => {
    const res = await api.register(data);
    if (res.token) {
      localStorage.setItem('vaish_token', res.token);
    }
    setUser(normalizeUser(res.user));
  };

  const loginWithGoogle = async (googleData: { email: string; name?: string; avatar?: string }) => {
    const res = await api.loginWithGoogle(googleData);
    if (res.token) {
      localStorage.setItem('vaish_token', res.token);
    }
    setUser(normalizeUser(res.user));
  };

  const logout = () => {
    localStorage.removeItem('vaish_token');
    setUser(null);
    setAddresses([]);
  };

  const addAddress = async (data: any) => {
    const res = await api.createAddress(data);
    await refreshAddresses();
    return res.address;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        addresses,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
        refreshAddresses,
        addAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
