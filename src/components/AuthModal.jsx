// src/components/AuthModal.jsx
// Supabase Authentication Modal (Sign In / Sign Up) with Guest fallback

import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { sanitizeInputText } from '../lib/sanitize';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, onOpenSyncConfig }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured yet. Configure your URL and Anon Key in Sync Settings or use Guest Mode.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const cleanUsername = sanitizeInputText(username, 25) || email.split('@')[0];
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: cleanUsername,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data?.session) {
          onAuthSuccess(data.user);
          onClose();
        } else {
          setMessage('Account created! Please check your email inbox to confirm your account.');
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) throw signInError;

        if (data?.user) {
          onAuthSuccess(data.user);
          onClose();
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-indigo-950/50">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isSignUp ? 'Create Warrior Account' : 'Sign In to Habit Buddy'}
            </h2>
          </div>
          <button
            type="button"
            id="close-auth-modal-btn"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Supabase status warning if not yet configured */}
        {!isSupabaseConfigured && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 space-y-1.5">
            <p className="font-semibold">Supabase is currently running in Guest Demo Mode.</p>
            <p className="text-[11px] text-amber-300/80">
              To enable cloud accounts, configure your Supabase URL & Key.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSyncConfig();
              }}
              className="text-indigo-400 underline font-semibold text-[11px] hover:text-indigo-300 block"
            >
              Open Cloud Sync Settings &rarr;
            </button>
          </div>
        )}

        {/* Tab switch */}
        <div className="mt-4 flex rounded-xl border border-slate-800 bg-slate-950/60 p-1">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError('');
              setMessage('');
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              !isSignUp ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError('');
              setMessage('');
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              isSignUp ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-300">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Warrior Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. IronSpartan"
                  maxLength={25}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="warrior@discipline.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              id="auth-submit-btn"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block animate-spin">⌛</span>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Authenticate'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo Mode Button */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <button
            type="button"
            id="continue-guest-btn"
            onClick={onClose}
            className="text-xs font-medium text-slate-400 hover:text-indigo-300 transition-colors"
          >
            Continue in Guest Demo Mode &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
