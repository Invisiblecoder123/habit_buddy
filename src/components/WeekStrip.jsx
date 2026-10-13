// src/components/WeekStrip.jsx
// Interactive 7-Day Date Selector

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function WeekStrip({ selectedDate, setSelectedDate, allLogs = {} }) {
  // Generate 7 days around the selected date or current week
  const todayStr = new Date().toISOString().split('T')[0];

  const getWeekDays = () => {
    const curr = new Date(selectedDate);
    // Find Monday of the current week (or Sunday)
    const day = curr.getDay(); // 0 is Sunday
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    const monday = new Date(curr.setDate(diff));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const handlePrevWeek = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 7);
    setSelectedDate(prev.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 7);
    setSelectedDate(next.toISOString().split('T')[0]);
  };

  const handleJumpToToday = () => {
    setSelectedDate(todayStr);
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3 sm:p-4 backdrop-blur-md">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {selectedDate !== todayStr && (
            <button
              type="button"
              id="jump-today-btn"
              onClick={handleJumpToToday}
              className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-bold text-indigo-300 hover:bg-indigo-500/20 transition-all"
            >
              Today
            </button>
          )}

          <button
            type="button"
            id="prev-week-btn"
            onClick={handlePrevWeek}
            title="Previous Week"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            id="next-week-btn"
            onClick={handleNextWeek}
            title="Next Week"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
        {weekDays.map((dateObj, idx) => {
          const dateStr = dateObj.toISOString().split('T')[0];
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          const dayNum = dateObj.getDate();
          const dayLogs = allLogs[dateStr] || {};
          const hasCompletions = Object.values(dayLogs).some(Boolean);

          return (
            <button
              key={dateStr}
              type="button"
              id={`week-day-${dateStr}`}
              onClick={() => setSelectedDate(dateStr)}
              className={`group relative flex flex-col items-center justify-center rounded-xl py-2.5 px-1 transition-all active:scale-95 ${
                isSelected
                  ? 'border border-indigo-500 bg-indigo-600/20 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500/50'
                  : 'border border-slate-800/80 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                {dayNames[idx]}
              </span>
              <span
                className={`mt-0.5 text-base sm:text-lg font-bold font-mono ${
                  isSelected ? 'text-white' : isToday ? 'text-indigo-400' : 'text-slate-200'
                }`}
              >
                {dayNum}
              </span>

              {/* Status Indicator Dot */}
              <div className="mt-1 flex h-1.5 w-1.5 items-center justify-center">
                {hasCompletions ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
                ) : isToday ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                ) : (
                  <span className="h-1 w-1 rounded-full bg-slate-700 opacity-60" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
