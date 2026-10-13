// src/components/StatsOverview.jsx
// RPG Attributes Breakdown & Habit Consistency Heatmap

import React from 'react';
import { Activity, BarChart3, Target, CheckCircle2 } from 'lucide-react';

export default function StatsOverview({
  categories = [],
  allLogs = {},
  habits = [],
  selectedDate,
}) {
  // Calculate today's completion rate
  const scheduledToday = habits.filter((h) => {
    const day = new Date(selectedDate).getDay();
    return Array.isArray(h.scheduled_days) ? h.scheduled_days.includes(day) : true;
  });

  const todayLogs = allLogs[selectedDate] || {};
  const completedTodayCount = scheduledToday.filter((h) => todayLogs[h.id]).length;
  const completionRate =
    scheduledToday.length > 0
      ? Math.round((completedTodayCount / scheduledToday.length) * 100)
      : 100;

  // Calculate total lifetime completions
  let totalCompletions = 0;
  Object.values(allLogs).forEach((dayMap) => {
    if (dayMap && typeof dayMap === 'object') {
      Object.values(dayMap).forEach((val) => {
        if (val) totalCompletions += 1;
      });
    }
  });

  // Generate 28-day activity heatmap
  const getHeatmapDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const count = Object.values(allLogs[str] || {}).filter(Boolean).length;
      days.push({ date: str, count });
    }
    return days;
  };

  const heatmapDays = getHeatmapDays();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* RPG Attribute Matrix */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
              RPG Attributes
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {categories.length} Attributes
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {categories.map((cat) => {
            const points = cat.points || 0;
            const attrLevel = Math.floor(points / 50) + 1;
            const progress = (points % 50) * 2; // 0 to 100%

            return (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-semibold text-slate-200">{cat.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      (Tier {attrLevel})
                    </span>
                  </div>
                  <span className="font-mono font-bold" style={{ color: cat.color }}>
                    {points} pts
                  </span>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: cat.color,
                      boxShadow: `0 0 8px ${cat.color}60`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 28-Day Consistency Heatmap & Daily Rate */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
                Consistency Matrix
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              {completionRate}% Today
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Target className="h-3.5 w-3.5 text-indigo-400" />
                <span>Today's Target</span>
              </div>
              <div className="text-lg font-bold font-mono text-white mt-1">
                {completedTodayCount} / {scheduledToday.length}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Total Cleared</span>
              </div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                {totalCompletions}
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Grid (4 rows x 7 cols = 28 days) */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2">
            <span>28-Day Activity Grid</span>
            <div className="flex items-center gap-1 text-[10px]">
              <span>Less</span>
              <span className="h-2 w-2 rounded-xs bg-slate-800 inline-block" />
              <span className="h-2 w-2 rounded-xs bg-emerald-700 inline-block" />
              <span className="h-2 w-2 rounded-xs bg-emerald-500 inline-block" />
              <span className="h-2 w-2 rounded-xs bg-emerald-400 inline-block" />
              <span>More</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {heatmapDays.map((d) => {
              let bg = 'bg-slate-800/80';
              if (d.count === 1) bg = 'bg-emerald-800';
              else if (d.count === 2) bg = 'bg-emerald-600';
              else if (d.count >= 3) bg = 'bg-emerald-400 shadow-[0_0_6px_#10B981]';

              return (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.count} habits completed`}
                  className={`h-5 rounded-md ${bg} transition-transform hover:scale-110 cursor-pointer`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
