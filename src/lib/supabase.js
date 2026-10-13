// src/lib/supabase.js
// Production-grade Supabase client with offline guest mode fallback

import { createClient } from '@supabase/supabase-js';
import { DEFAULT_CATEGORIES, DEFAULT_HABITS, DEFAULT_PROFILE } from '../data/defaultData';
import { sanitizeInputText, validateCategoryColor } from './sanitize';

// Local storage keys for guest/offline fallback
const STORAGE_PROFILE_KEY = 'habit_buddy_profile';
const STORAGE_CATEGORIES_KEY = 'habit_buddy_categories';
const STORAGE_HABITS_KEY = 'habit_buddy_habits';
const STORAGE_LOGS_KEY = 'habit_buddy_logs';
const STORAGE_CUSTOM_SUPABASE_KEY = 'habit_buddy_custom_supabase';

function getCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey && !envUrl.includes('your-supabase-url')) {
    return { url: envUrl, key: envKey };
  }

  // Check custom storage (configured via UI modal)
  try {
    const custom = localStorage.getItem(STORAGE_CUSTOM_SUPABASE_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.url && parsed.key) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse error
  }

  return { url: '', key: '' };
}

const { url, key } = getCredentials();
export const isSupabaseConfigured = Boolean(url && key);

export const supabase = isSupabaseConfigured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function saveCustomSupabaseCredentials(newUrl, newKey) {
  if (newUrl && newKey) {
    localStorage.setItem(STORAGE_CUSTOM_SUPABASE_KEY, JSON.stringify({ url: newUrl.trim(), key: newKey.trim() }));
  } else {
    localStorage.removeItem(STORAGE_CUSTOM_SUPABASE_KEY);
  }
  window.location.reload();
}

export function clearCustomSupabaseCredentials() {
  localStorage.removeItem(STORAGE_CUSTOM_SUPABASE_KEY);
  window.location.reload();
}

// ============================================================================
// LOCAL STORAGE / OFFLINE FALLBACK HELPERS
// ============================================================================
function getLocalProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

function setLocalProfile(profile) {
  localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
}

function getLocalCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

function setLocalCategories(cats) {
  localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(cats));
}

function getLocalHabits() {
  try {
    const raw = localStorage.getItem(STORAGE_HABITS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_HABITS;
  } catch {
    return DEFAULT_HABITS;
  }
}

function setLocalHabits(habits) {
  localStorage.setItem(STORAGE_HABITS_KEY, JSON.stringify(habits));
}

function getLocalLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_LOGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLocalLogs(logs) {
  localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs));
}

// ============================================================================
// DATA OPERATIONS (ONLINE SUPABASE WITH LOCALSTORAGE FALLBACK)
// ============================================================================

export async function fetchProfile(user) {
  if (supabase && user?.id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      return data;
    }
  }
  return getLocalProfile();
}

export async function fetchCategories(user) {
  if (supabase && user?.id) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
  }
  return getLocalCategories();
}

export async function fetchHabits(user) {
  if (supabase && user?.id) {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      return data;
    }
  }
  return getLocalHabits();
}

export async function fetchHabitLogs(user, dateString) {
  if (supabase && user?.id) {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', dateString);

    if (!error && data) {
      // Return a map of habit_id -> completed boolean
      const map = {};
      data.forEach((log) => {
        map[log.habit_id] = log.completed;
      });
      return map;
    }
  }

  // Local fallback: logs stored as { 'YYYY-MM-DD': { habitId: true } }
  const allLogs = getLocalLogs();
  return allLogs[dateString] || {};
}

export async function fetchAllLogs(user) {
  if (supabase && user?.id) {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id);

    if (!error && data) {
      const logs = {};
      data.forEach((l) => {
        if (!logs[l.log_date]) logs[l.log_date] = {};
        logs[l.log_date][l.habit_id] = l.completed;
      });
      return logs;
    }
  }
  return getLocalLogs();
}

export async function createCategory(user, { name, color }) {
  const sanitizedName = sanitizeInputText(name, 30);
  const validatedColor = validateCategoryColor(color);

  if (supabase && user?.id) {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: sanitizedName,
        color: validatedColor,
        points: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Local fallback
  const current = getLocalCategories();
  const newCat = {
    id: `cat-${Date.now()}`,
    name: sanitizedName,
    color: validatedColor,
    points: 0,
    created_at: new Date().toISOString(),
  };
  setLocalCategories([...current, newCat]);
  return newCat;
}

export async function createHabit(user, { category_id, name, scheduled_days }) {
  const sanitizedName = sanitizeInputText(name, 60);

  if (supabase && user?.id) {
    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        category_id,
        name: sanitizedName,
        scheduled_days,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Local fallback
  const current = getLocalHabits();
  const newHabit = {
    id: `habit-${Date.now()}`,
    category_id,
    name: sanitizedName,
    scheduled_days,
    created_at: new Date().toISOString().split('T')[0],
  };
  setLocalHabits([...current, newHabit]);
  return newHabit;
}

export async function updateHabit(user, habitId, { name, category_id, scheduled_days }) {
  const sanitizedName = sanitizeInputText(name, 60);

  if (supabase && user?.id) {
    const { data, error } = await supabase
      .from('habits')
      .update({
        name: sanitizedName,
        category_id,
        scheduled_days,
      })
      .eq('id', habitId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Local fallback
  const current = getLocalHabits();
  const updated = current.map((h) =>
    h.id === habitId ? { ...h, name: sanitizedName, category_id, scheduled_days } : h
  );
  setLocalHabits(updated);
  return updated.find((h) => h.id === habitId);
}

export async function deleteHabit(user, habitId) {
  if (supabase && user?.id) {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  }

  // Local fallback
  const current = getLocalHabits();
  setLocalHabits(current.filter((h) => h.id !== habitId));
  return true;
}

export async function toggleHabitLog(user, habitId, categoryId, dateString, completed) {
  const pointsDelta = completed ? 10 : -10;

  if (supabase && user?.id) {
    // Upsert into habit_logs
    const { error: logErr } = await supabase
      .from('habit_logs')
      .upsert(
        {
          habit_id: habitId,
          user_id: user.id,
          log_date: dateString,
          completed,
        },
        { onConflict: 'habit_id,log_date' }
      );

    if (logErr) throw logErr;

    // Increment profile discipline score
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('discipline_score, current_daily_streak')
        .eq('id', user.id)
        .single();

      if (profile) {
        const newScore = Math.max(0, (profile.discipline_score || 0) + pointsDelta);
        await supabase
          .from('profiles')
          .update({
            discipline_score: newScore,
            last_active_date: dateString,
          })
          .eq('id', user.id);
      }
    } catch (e) {
      console.warn('Profile score update failed', e);
    }

    // Increment category points
    try {
      if (categoryId) {
        const { data: cat } = await supabase
          .from('categories')
          .select('points')
          .eq('id', categoryId)
          .eq('user_id', user.id)
          .single();

        if (cat) {
          const newPoints = Math.max(0, (cat.points || 0) + pointsDelta);
          await supabase
            .from('categories')
            .update({ points: newPoints })
            .eq('id', categoryId)
            .eq('user_id', user.id);
        }
      }
    } catch (e) {
      console.warn('Category points update failed', e);
    }

    return { completed };
  }

  // Local fallback
  const logs = getLocalLogs();
  if (!logs[dateString]) logs[dateString] = {};
  logs[dateString][habitId] = completed;
  setLocalLogs(logs);

  // Update local profile score
  const profile = getLocalProfile();
  profile.discipline_score = Math.max(0, (profile.discipline_score || 0) + pointsDelta);
  profile.last_active_date = dateString;
  setLocalProfile(profile);

  // Update local category points
  if (categoryId) {
    const cats = getLocalCategories();
    const updatedCats = cats.map((c) =>
      c.id === categoryId ? { ...c, points: Math.max(0, (c.points || 0) + pointsDelta) } : c
    );
    setLocalCategories(updatedCats);
  }

  return { completed };
}
