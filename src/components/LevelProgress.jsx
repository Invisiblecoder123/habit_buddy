// src/components/LevelProgress.jsx
// Gamified Discipline Score & Level Bar

import React from 'react';
import { Shield, Flame, Zap, Award, Sparkles, TrendingUp } from 'lucide-react';

export const RANK_ICONS = {
  1: Shield,
  2: Zap,
  3: Flame,
  4: TrendingUp,
  5: Award,
  6: Award,
  7: Sparkles,
};

export default function LevelProgress({ rankInfo, streak = 0 }) {
  const IconComponent = RANK_ICONS[rankInfo.level] || Shield;

  return (
    <div className="rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 shadow-lg backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        {/* Left: Rank & Level info */}
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-inner border"
            style={{
              backgroundColor: `${rankInfo.color}15`,
              borderColor: `${rankInfo.color}40`,
            }}
          >
            <IconComponent className="h-6 w-6" style={{ color: rankInfo.color }} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider font-mono border"
                style={{
                  backgroundColor: `${rankInfo.color}20`,
                  color: rankInfo.color,
                  borderColor: `${rankInfo.color}40`,
                }}
              >
                Level {rankInfo.level}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {rankInfo.title}
              </h2>
            </div>
            <p className="text-xs text-slate-400 italic mt-0.5">
              "{rankInfo.quote}"
            </p>
          </div>
        </div>

        {/* Right: Scores & Streak Badges */}
        <div className="flex items-center gap-2.5 sm:self-center">
          {/* Daily Streak */}
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2">
            <Flame className="h-5 w-5 text-amber-400 fill-amber-400/30 animate-pulse" />
            <div>
              <div className="text-sm font-extrabold text-amber-300 font-mono leading-none">
                {streak} {streak === 1 ? 'Day' : 'Days'}
              </div>
              <div className="text-[10px] font-semibold text-amber-400/80 uppercase tracking-wider">
                Streak
              </div>
            </div>
          </div>

          {/* Discipline XP */}
          <div className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2">
            <Zap className="h-5 w-5 text-indigo-400 fill-indigo-400/20" />
            <div>
              <div className="text-sm font-extrabold text-indigo-300 font-mono leading-none">
                {rankInfo.score} XP
              </div>
              <div className="text-[10px] font-semibold text-indigo-400/80 uppercase tracking-wider">
                Discipline
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-slate-400">
            Progress to Level {rankInfo.nextRank ? rankInfo.nextRank.level : 'MAX'}
          </span>
          <span className="font-semibold text-slate-200">
            {rankInfo.nextRank ? (
              <>
                <span className="text-indigo-400">{rankInfo.neededForNext} XP</span> needed
              </>
            ) : (
              'Maximum Rank Reached'
            )}
          </span>
        </div>

        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${rankInfo.progressPercent}%`,
              background: `linear-gradient(90deg, #6366F1, ${rankInfo.color})`,
              boxShadow: `0 0 12px ${rankInfo.color}80`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
