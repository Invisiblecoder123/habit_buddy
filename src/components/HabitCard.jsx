// src/components/HabitCard.jsx
// Interactive Habit Card with rewarding checkbox feedback & animations

import React from 'react';
import { Check, Edit2, Trash2, Flame } from 'lucide-react';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HabitCard({
  habit,
  category,
  isCompleted,
  onToggle,
  onEdit,
  onDelete,
  dayOfWeek, // 0 = Sun, 1 = Mon ...
}) {
  const isScheduledToday = Array.isArray(habit.scheduled_days)
    ? habit.scheduled_days.includes(dayOfWeek)
    : true;

  const categoryColor = category?.color || '#6366F1';
  const categoryName = category?.name || 'General';

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggle(habit.id, habit.category_id, !isCompleted);
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isCompleted
          ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/20 via-slate-900/60 to-slate-900/80 shadow-md shadow-emerald-950/20'
          : 'border-slate-800/90 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900/90 shadow-sm'
      }`}
    >
      {/* Category color accent bar on left */}
      <div
        className="absolute top-0 bottom-0 left-0 w-1.5 transition-all duration-300"
        style={{ backgroundColor: categoryColor }}
      />

      <div className="flex items-center justify-between gap-3 p-4 pl-5">
        {/* Left: Checkbox & Title */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          {/* Big Tactile Checkbox Button */}
          <button
            type="button"
            id={`toggle-habit-${habit.id}`}
            onClick={handleCheckboxClick}
            className={`relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border-2 transition-all duration-200 active:scale-90 ${
              isCompleted
                ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'border-slate-700 bg-slate-800/80 hover:border-indigo-400 text-transparent'
            }`}
          >
            <Check
              className={`h-5 w-5 stroke-[3] transition-transform duration-200 ${
                isCompleted ? 'scale-100' : 'scale-0'
              }`}
            />
          </button>

          {/* Habit Details */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider font-mono border"
                style={{
                  backgroundColor: `${categoryColor}15`,
                  color: categoryColor,
                  borderColor: `${categoryColor}30`,
                }}
              >
                {categoryName}
              </span>

              {!isScheduledToday && (
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                  Rest Day
                </span>
              )}
            </div>

            <h3
              className={`text-sm sm:text-base font-semibold tracking-tight transition-all truncate mt-0.5 ${
                isCompleted
                  ? 'text-slate-400 line-through decoration-slate-600'
                  : 'text-slate-100 group-hover:text-white'
              }`}
            >
              {habit.name}
            </h3>

            {/* Scheduled Days Pill */}
            <div className="mt-1.5 flex items-center gap-1">
              {DAY_LABELS.map((label, idx) => {
                const active = habit.scheduled_days?.includes(idx);
                const isCurrent = idx === dayOfWeek;
                return (
                  <span
                    key={idx}
                    className={`flex h-4 w-4 items-center justify-center rounded text-[9px] font-mono font-bold ${
                      active
                        ? isCurrent
                          ? 'bg-indigo-600 text-white ring-1 ring-indigo-400'
                          : 'bg-slate-800 text-slate-300'
                        : 'bg-transparent text-slate-600'
                    }`}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            id={`edit-habit-${habit.id}`}
            onClick={() => onEdit(habit)}
            title="Edit Habit"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            id={`delete-habit-${habit.id}`}
            onClick={() => onDelete(habit.id)}
            title="Delete Habit"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
