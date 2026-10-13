// src/components/SyncConfigModal.jsx
// Cloud Sync Configuration dialog for Supabase & Gemini setup

import React, { useState } from 'react';
import { X, Database, Shield, Key, ExternalLink, Save, CheckCircle, Trash2 } from 'lucide-react';
import {
  isSupabaseConfigured,
  saveCustomSupabaseCredentials,
  clearCustomSupabaseCredentials,
} from '../lib/supabase';

export default function SyncConfigModal({ isOpen, onClose }) {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (url && key) {
      saveCustomSupabaseCredentials(url, key);
      setSaved(true);
    }
  };

  const handleClear = () => {
    clearCustomSupabaseCredentials();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-indigo-950/50 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Cloud Sync & Security Architecture
            </h2>
          </div>
          <button
            type="button"
            id="close-sync-modal-btn"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current Status */}
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Current Backend:</span>
            {isSupabaseConfigured ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5" />
                Supabase Connected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                Offline Guest Demo Mode
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {isSupabaseConfigured
              ? 'Your data syncs securely with your Supabase PostgreSQL instance under strict Row Level Security (RLS).'
              : 'The app is fully functional using encrypted browser storage. Connect Supabase anytime to sync habits across devices.'}
          </p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Supabase Project URL
            </label>
            <input
              type="url"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Supabase Anon Key (Public)
            </label>
            <input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {isSupabaseConfigured && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Disconnect Custom Keys</span>
              </button>
            )}

            <button
              type="submit"
              id="save-supabase-keys-btn"
              className="ml-auto flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-95"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save & Connect</span>
            </button>
          </div>
        </form>

        {/* Quick SQL Migration Guidance */}
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-emerald-400" />
            Supabase Setup Checklist
          </h3>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-400">
            <li>
              Open your Supabase Dashboard &rarr; <span className="text-slate-200">SQL Editor</span>.
            </li>
            <li>
              Run the provided <code className="text-indigo-400 font-mono">schema.sql</code> script to build tables, triggers, and RLS policies.
            </li>
            <li>
              Copy your Project URL and Anon API key from <span className="text-slate-200">Project Settings &rarr; API</span>.
            </li>
            <li>
              Add <code className="text-indigo-400 font-mono">GEMINI_API_KEY</code> to your Vercel Project Environment Variables.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
