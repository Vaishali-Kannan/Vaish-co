import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoCustomer = () => {
    setEmail('demo@vaishandco.com');
    setPassword('Password123!');
  };

  const handleDemoAdmin = () => {
    setEmail('admin@vaishandco.com');
    setPassword('Password123!');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-8 border border-brand-border/80 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <span className="font-serif text-3xl font-bold tracking-tight text-brand-text">
              Vaish<span className="text-brand-pink">&</span>Co<span className="text-brand-deepRose">.</span>
            </span>
          </Link>
          <h2 className="font-serif text-xl font-bold text-brand-text">Welcome Back</h2>
          <p className="text-xs text-brand-secondary">Sign in to your Vaish&Co. shopping account</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-brand-text block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-border bg-brand-blush focus:outline-none focus:border-brand-pink"
              />
              <Mail className="w-4 h-4 text-brand-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-brand-text">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-brand-deepRose hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-border bg-brand-blush focus:outline-none focus:border-brand-pink"
              />
              <Lock className="w-4 h-4 text-brand-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full bg-brand-pink hover:bg-brand-deepRose text-white font-bold text-xs transition-all shadow-subtle flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Fill Buttons */}
        <div className="p-3.5 rounded-2xl bg-brand-palePink/30 border border-brand-border/60 text-xs space-y-2">
          <p className="font-bold text-brand-deepRose text-[11px]">Quick Demo Logins:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDemoCustomer}
              className="flex-1 py-1.5 px-2 bg-white hover:bg-brand-palePink border border-brand-border rounded-lg font-semibold text-[11px] text-brand-text"
            >
              Customer Demo
            </button>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="flex-1 py-1.5 px-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg font-semibold text-[11px] text-purple-700"
            >
              Admin Demo
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-brand-secondary pt-2 border-t border-brand-border/60">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-bold text-brand-deepRose hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-8 border border-brand-border/80 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <span className="font-serif text-3xl font-bold tracking-tight text-brand-text">
              Vaish<span className="text-brand-pink">&</span>Co<span className="text-brand-deepRose">.</span>
            </span>
          </Link>
          <h2 className="font-serif text-xl font-bold text-brand-text">Join Vaish&Co.</h2>
          <p className="text-xs text-brand-secondary">
            Earn 50 Vaish Coins welcome bonus on your first order!
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-brand-text block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Pooja Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-blush focus:outline-none focus:border-brand-pink"
            />
          </div>

          <div>
            <label className="font-bold text-brand-text block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="pooja@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-blush focus:outline-none focus:border-brand-pink"
            />
          </div>

          <div>
            <label className="font-bold text-brand-text block mb-1">Mobile Phone (Optional)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="9876543210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-blush focus:outline-none focus:border-brand-pink"
            />
          </div>

          <div>
            <label className="font-bold text-brand-text block mb-1">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="At least 8 characters"
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-blush focus:outline-none focus:border-brand-pink"
            />
          </div>

          <div>
            <label className="font-bold text-brand-text block mb-1">Confirm Password</label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Repeat password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-blush focus:outline-none focus:border-brand-pink"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-brand-pink hover:bg-brand-deepRose text-white font-bold text-xs transition-all shadow-subtle flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-brand-secondary pt-2 border-t border-brand-border/60">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-brand-deepRose hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-8 border border-brand-border/80 shadow-card space-y-6 text-center">
        <h2 className="font-serif text-2xl font-bold text-brand-text">Reset Password</h2>
        <p className="text-xs text-brand-secondary">
          Enter your registered email address and we will send you secure recovery instructions.
        </p>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <p className="font-bold">Reset link sent!</p>
            <p className="mt-1">If an account exists for {email}, a recovery link has been dispatched.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs text-left">
            <div>
              <label className="font-bold text-brand-text block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-blush"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-brand-pink hover:bg-brand-deepRose text-white font-bold text-xs shadow-subtle"
            >
              Send Password Reset Link
            </button>
          </form>
        )}

        <Link to="/login" className="inline-block text-xs font-bold text-brand-deepRose hover:underline">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};
