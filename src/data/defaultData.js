// src/data/defaultData.js
// Default categories & seed data matching the SQL migration

export const DEFAULT_CATEGORIES = [
  { id: 'cat-health', name: 'Health', color: '#10B981', points: 30 },
  { id: 'cat-intel', name: 'Intelligence', color: '#6366F1', points: 40 },
  { id: 'cat-strength', name: 'Strength', color: '#EF4444', points: 50 },
  { id: 'cat-relations', name: 'Relations', color: '#EC4899', points: 20 },
  { id: 'cat-mind', name: 'Mindfulness', color: '#06B6D4', points: 30 },
];

export const DEFAULT_HABITS = [
  {
    id: 'habit-1',
    category_id: 'cat-strength',
    name: 'Morning Calisthenics / 50 Push-ups',
    scheduled_days: [0, 1, 2, 3, 4, 5, 6], // Daily
    created_at: new Date().toISOString().split('T')[0],
  },
  {
    id: 'habit-2',
    category_id: 'cat-intel',
    name: 'Read 20 Pages of Deep Work / Philosophy',
    scheduled_days: [1, 2, 3, 4, 5], // Weekdays
    created_at: new Date().toISOString().split('T')[0],
  },
  {
    id: 'habit-3',
    category_id: 'cat-mind',
    name: '15 Minutes Meditation & Breathwork',
    scheduled_days: [0, 1, 2, 3, 4, 5, 6], // Daily
    created_at: new Date().toISOString().split('T')[0],
  },
  {
    id: 'habit-4',
    category_id: 'cat-health',
    name: 'Zero Sugar & 3 Liters Hydration',
    scheduled_days: [0, 1, 2, 3, 4, 5, 6], // Daily
    created_at: new Date().toISOString().split('T')[0],
  },
  {
    id: 'habit-5',
    category_id: 'cat-relations',
    name: 'Express Gratitude / Reach Out to a Friend',
    scheduled_days: [0, 6], // Weekends
    created_at: new Date().toISOString().split('T')[0],
  },
];

export const DEFAULT_PROFILE = {
  id: 'guest-warrior',
  username: 'Iron Disciple',
  avatar_url: null,
  discipline_score: 170,
  current_daily_streak: 5,
  last_active_date: new Date().toISOString().split('T')[0],
};
