// src/components/Header.jsx
// Header with Profile Rank, Cloud Status, Audio Toggle, and Navigation

import React from 'react';
import { Flame, Shield, Volume2, VolumeX, Cloud, CloudOff, User, LogOut, Settings } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled } from '../lib/audio';

export default function Header({
  profile,
  rankInfo,
  user,
  isCloudConnected,
  onOpenAuth,
  onOpenSync,
  onOpenCategoryModal,
  onSignOut,
  soundOn,
  setSoundOn,
}) {
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 shadow-md shadow-indigo-500/20 ring-1 ring-white/10">
            <Flame className="h-6 w-6 text-amber-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Habit Buddy</h1>
              <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 hidden sm:block">
              Gamified Discipline OS
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            type="button"
            id="sound-toggle-btn"
            onClick={toggleSound}
            title={soundOn ? 'Sound FX On (Click to Mute)' : 'Sound FX Muted (Click to Unmute)'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/90 text-slate-400 hover:text-white hover:border-slate-700 transition-all active:scale-95"
          >
            {soundOn ? <Volume2 className="h-4 w-4 text-indigo-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
          </button>

          {/* Cloud Sync Status Badge */}
          <button
            type="button"
            id="cloud-sync-status-btn"
            onClick={onOpenSync}
            title={isCloudConnected ? 'Supabase Connected' : 'Guest Mode / Offline Storage (Click to connect Supabase)'}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
              isCloudConnected
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                : 'border-slate-800 bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {isCloudConnected ? (
              <>
                <Cloud className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Cloud Synced</span>
              </>
            ) : (
              <>
                <CloudOff className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Guest Mode</span>
              </>
            )}
          </button>

          {/* Categories Management Trigger */}
          <button
            type="button"
            id="manage-categories-btn"
            onClick={onOpenCategoryModal}
            title="Manage RPG Attributes & Categories"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/90 text-slate-400 hover:text-white hover:border-slate-700 transition-all active:scale-95"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-1">
              <div className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white uppercase">
                  {profile?.username ? profile.username[0] : 'U'}
                </div>
                <span className="text-xs font-semibold text-indigo-200 hidden md:inline">
                  {profile?.username || 'Warrior'}
                </span>
              </div>
              <button
                type="button"
                id="signout-btn"
                onClick={onSignOut}
                title="Sign Out"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/90 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all active:scale-95"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="login-trigger-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-95"
            >
              <User className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
