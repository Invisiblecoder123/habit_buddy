// src/App.jsx
// Production-grade Gamified Habit Tracker & Discipline Operating System

import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import BannerQuote from './components/BannerQuote';
import LevelProgress from './components/LevelProgress';
import WeekStrip from './components/WeekStrip';
import HabitCard from './components/HabitCard';
import HabitModal from './components/HabitModal';
import CategoryModal from './components/CategoryModal';
import StatsOverview from './components/StatsOverview';
import AuthModal from './components/AuthModal';
import SyncConfigModal from './components/SyncConfigModal';

import {
  supabase,
  isSupabaseConfigured,
  fetchProfile,
  fetchCategories,
  fetchHabits,
  fetchAllLogs,
  createCategory,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitLog,
} from './lib/supabase';

import { getRankInfo, calculateStreakFromLogs } from './lib/gamification';
import { playCheckSound, playLevelUpSound, isSoundEnabled } from './lib/audio';
import { fireHabitCheckConfetti, fireGrandCelebration } from './lib/confetti';
import { Plus, Filter, Sparkles, CheckCircle, ShieldAlert } from 'lucide-react';

export default function App() {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Core State
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [habits, setHabits] = useState([]);
  const [allLogs, setAllLogs] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals & UI Controls
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Initial Data Load & Auth Listener
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        let currentUser = null;
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          currentUser = data?.session?.user || null;
          setUser(currentUser);

          supabase.auth.onAuthStateChange((_event, session) => {
            const nextUser = session?.user || null;
            setUser(nextUser);
            loadUserData(nextUser);
          });
        }
        await loadUserData(currentUser);
      } catch (e) {
        console.error('Initialization error:', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const loadUserData = async (activeUser) => {
    try {
      const [prof, cats, habs, logs] = await Promise.all([
        fetchProfile(activeUser),
        fetchCategories(activeUser),
        fetchHabits(activeUser),
        fetchAllLogs(activeUser),
      ]);
      setProfile(prof);
      setCategories(cats);
      setHabits(habs);
      setAllLogs(logs);
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    await loadUserData(null);
    showToast('Signed out successfully.');
  };

  // Gamification Metrics
  const calculatedStreak = useMemo(() => {
    return calculateStreakFromLogs(allLogs, habits);
  }, [allLogs, habits]);

  const rankInfo = useMemo(() => {
    return getRankInfo(profile?.discipline_score || 0);
  }, [profile?.discipline_score]);

  // Selected date metadata
  const selectedDayOfWeek = useMemo(() => {
    const parts = selectedDate.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.getDay();
  }, [selectedDate]);

  // Habits scheduled for the active date
  const visibleHabits = useMemo(() => {
    return habits.filter((h) => {
      // Category filter check
      if (categoryFilter !== 'ALL' && h.category_id !== categoryFilter) {
        return false;
      }
      // Day filter check (show all or scheduled)
      return true;
    });
  }, [habits, categoryFilter]);

  // Habit completion toggle with optimistic response, audio chime, and particle burst
  const handleToggleHabit = async (habitId, categoryId, newCompleted) => {
    // Optimistic UI updates
    const prevLogs = { ...allLogs };
    const dateLogs = { ...(allLogs[selectedDate] || {}) };
    dateLogs[habitId] = newCompleted;
    const updatedAllLogs = { ...allLogs, [selectedDate]: dateLogs };
    setAllLogs(updatedAllLogs);

    // Score Delta (+10 on check, -10 on uncheck)
    const delta = newCompleted ? 10 : -10;
    setProfile((prev) => ({
      ...prev,
      discipline_score: Math.max(0, (prev?.discipline_score || 0) + delta),
    }));

    setCategories((prevCats) =>
      prevCats.map((c) =>
        c.id === categoryId ? { ...c, points: Math.max(0, (c.points || 0) + delta) } : c
      )
    );

    // Sound & Confetti celebration
    if (newCompleted) {
      playCheckSound();
      fireHabitCheckConfetti(0.5, 0.6);

      // Check if all scheduled habits for today are now completed
      const scheduledToday = habits.filter(
        (h) => Array.isArray(h.scheduled_days) && h.scheduled_days.includes(selectedDayOfWeek)
      );
      const isAllDone =
        scheduledToday.length > 0 &&
        scheduledToday.every((h) => (h.id === habitId ? true : Boolean(dateLogs[h.id])));

      if (isAllDone) {
        setTimeout(() => {
          playLevelUpSound();
          fireGrandCelebration();
          showToast('🔥 100% Daily Discipline Achieved! Grand celebration!', 'success');
        }, 300);
      }
    }

    // Persist to backend / local storage
    try {
      await toggleHabitLog(user, habitId, categoryId, selectedDate, newCompleted);
    } catch (err) {
      console.error('Failed to toggle habit:', err);
      // Revert on error
      setAllLogs(prevLogs);
      showToast('Failed to save habit log.', 'error');
    }
  };

  // Add / Edit Habit
  const handleSaveHabit = async (habitData) => {
    try {
      if (habitData.id) {
        const updated = await updateHabit(user, habitData.id, habitData);
        setHabits((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
        showToast('Habit updated successfully.');
      } else {
        const created = await createHabit(user, habitData);
        setHabits((prev) => [...prev, created]);
        showToast('New habit forged! +10 XP awaits.');
      }
    } catch (err) {
      console.error('Habit save failed:', err);
      showToast('Error saving habit.', 'error');
    }
  };

  // Delete Habit
  const handleDeleteHabit = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await deleteHabit(user, habitId);
        setHabits((prev) => prev.filter((h) => h.id !== habitId));
        showToast('Habit removed.');
      } catch (err) {
        console.error('Delete failed:', err);
        showToast('Failed to delete habit.', 'error');
      }
    }
  };

  // Create Category
  const handleCreateCategory = async (catData) => {
    try {
      const created = await createCategory(user, catData);
      setCategories((prev) => [...prev, created]);
      showToast(`Attribute "${created.name}" created!`);
    } catch (err) {
      console.error('Category creation failed:', err);
      showToast('Error creating category.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-24 sm:pb-16">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-md animate-fade-in ${
            toast.type === 'error'
              ? 'border-red-500/40 bg-red-950/80 text-red-200'
              : 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? (
            <ShieldAlert className="h-4 w-4 text-red-400" />
          ) : (
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        profile={profile}
        rankInfo={rankInfo}
        user={user}
        isCloudConnected={isSupabaseConfigured && Boolean(user)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSync={() => setIsSyncModalOpen(true)}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        onSignOut={handleSignOut}
        soundOn={soundOn}
        setSoundOn={setSoundOn}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 space-y-5">
        {/* 1. AI Motivational Banner (Gemini + 60-Quote Fallback) */}
        <BannerQuote />

        {/* 2. Gamified Level & Discipline Progress Bar */}
        <LevelProgress rankInfo={rankInfo} streak={calculatedStreak} />

        {/* 3. 7-Day Date Selector Strip */}
        <WeekStrip
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          allLogs={allLogs}
        />

        {/* 4. Attribute Filter Pills & Add Habit Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              id="filter-category-all"
              onClick={() => setCategoryFilter('ALL')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 active:scale-95 ${
                categoryFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Attributes
            </button>
            {categories.map((cat) => {
              const active = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  id={`filter-category-${cat.id}`}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 border active:scale-95 ${
                    active
                      ? 'text-white border-white/30 shadow-md'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                  style={{
                    backgroundColor: active ? `${cat.color}25` : undefined,
                    borderColor: active ? cat.color : undefined,
                    color: active ? '#FFF' : undefined,
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Add Habit Button */}
          <button
            type="button"
            id="forge-habit-btn"
            onClick={() => {
              setEditingHabit(null);
              setIsHabitModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Forge Habit</span>
          </button>
        </div>

        {/* 5. Habits List Section */}
        <div className="space-y-3">
          {visibleHabits.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-10 text-center">
              <Sparkles className="h-8 w-8 text-indigo-400 animate-pulse mb-3" />
              <h3 className="text-base font-bold text-white">No habits found</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Begin your ascent into self-mastery. Forge your first habit to start earning
                discipline XP and building your streak.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingHabit(null);
                  setIsHabitModalOpen(true);
                }}
                className="mt-4 flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-md"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Forge First Habit</span>
              </button>
            </div>
          ) : (
            visibleHabits.map((habit) => {
              const category = categories.find((c) => c.id === habit.category_id);
              const dayLogs = allLogs[selectedDate] || {};
              const isCompleted = Boolean(dayLogs[habit.id]);

              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  category={category}
                  isCompleted={isCompleted}
                  dayOfWeek={selectedDayOfWeek}
                  onToggle={handleToggleHabit}
                  onEdit={(h) => {
                    setEditingHabit(h);
                    setIsHabitModalOpen(true);
                  }}
                  onDelete={handleDeleteHabit}
                />
              );
            })
          )}
        </div>

        {/* 6. RPG Stats Overview & 28-day Heatmap */}
        <div className="pt-4">
          <StatsOverview
            categories={categories}
            allLogs={allLogs}
            habits={habits}
            selectedDate={selectedDate}
          />
        </div>
      </main>

      {/* Floating Action Button for Mobile Screens */}
      <div className="sm:hidden fixed bottom-6 right-6 z-40">
        <button
          type="button"
          id="mobile-fab-btn"
          onClick={() => {
            setEditingHabit(null);
            setIsHabitModalOpen(true);
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-600/40 ring-4 ring-indigo-500/20 active:scale-90 transition-transform"
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>

      {/* Modals */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        categories={categories}
        editingHabit={editingHabit}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCreateCategory={handleCreateCategory}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(authedUser) => {
          setUser(authedUser);
          loadUserData(authedUser);
          showToast(`Welcome back, ${authedUser?.email?.split('@')[0]}!`);
        }}
        onOpenSyncConfig={() => setIsSyncModalOpen(true)}
      />

      <SyncConfigModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
}
