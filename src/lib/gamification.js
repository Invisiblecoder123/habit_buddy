// src/lib/gamification.js
// Gamified progression calculations, ranks, and streak metrics

export const RANKS = [
  { level: 1, title: 'Novice Adept', min: 0, max: 99, color: '#94A3B8', icon: 'Shield', quote: 'The journey of ten thousand steps begins here.' },
  { level: 2, title: 'Initiate of Will', min: 100, max: 249, color: '#10B981', icon: 'Zap', quote: 'Consistency takes root in fertile soil.' },
  { level: 3, title: 'Iron Disciple', min: 250, max: 499, color: '#3B82F6', icon: 'Flame', quote: 'Forging an unbreakable routine.' },
  { level: 4, title: 'Shadow Warrior', min: 500, max: 999, color: '#8B5CF6', icon: 'Sword', quote: 'Excuses wither in your presence.' },
  { level: 5, title: 'Sentinel of Mind', min: 1000, max: 1999, color: '#EC4899', icon: 'Crown', quote: 'Mastery over body and spirit achieved.' },
  { level: 6, title: 'Grandmaster', min: 2000, max: 3499, color: '#F59E0B', icon: 'Award', quote: 'An exemplar of relentless sovereign discipline.' },
  { level: 7, title: 'Ascended Sovereign', min: 3500, max: Infinity, color: '#06B6D4', icon: 'Sparkles', quote: 'Your will bends reality itself.' },
];

export function getRankInfo(score = 0) {
  const safeScore = Math.max(0, Number(score) || 0);
  const currentRank = RANKS.find((r) => safeScore >= r.min && safeScore <= r.max) || RANKS[0];
  const nextRank = RANKS.find((r) => r.level === currentRank.level + 1) || null;

  let progressPercent = 100;
  let neededForNext = 0;

  if (nextRank) {
    const range = currentRank.max - currentRank.min + 1;
    const currentProgress = safeScore - currentRank.min;
    progressPercent = Math.min(100, Math.max(0, Math.round((currentProgress / range) * 100)));
    neededForNext = nextRank.min - safeScore;
  }

  return {
    ...currentRank,
    score: safeScore,
    progressPercent,
    neededForNext,
    nextRank,
  };
}

/**
 * Calculates the current daily streak from habit logs.
 */
export function calculateStreakFromLogs(allLogs = {}, habits = []) {
  if (!allLogs || Object.keys(allLogs).length === 0) return 0;

  let streak = 0;
  const today = new Date();
  
  // Check day by day backwards
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    const dayOfWeek = checkDate.getDay();

    // Check habits scheduled for this day
    const scheduledHabits = habits.filter(
      (h) => Array.isArray(h.scheduled_days) && h.scheduled_days.includes(dayOfWeek)
    );

    const dayLogs = allLogs[dateStr] || {};
    const hasAnyCompletion = Object.values(dayLogs).some(Boolean);

    if (i === 0) {
      // If today has completions, count it! If not completed yet today, check yesterday
      if (hasAnyCompletion) {
        streak += 1;
      }
      continue;
    }

    if (hasAnyCompletion) {
      streak += 1;
    } else {
      // If there were no scheduled habits on that day, don't break streak
      if (scheduledHabits.length === 0) {
        continue;
      }
      break;
    }
  }

  return streak;
}
