// src/components/HabitModal.jsx
// Create & Edit Habit Dialog with input sanitization & scheduling

import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Tag, AlertCircle } from 'lucide-react';
import { sanitizeInputText } from '../lib/sanitize';

const DAYS = [
  { id: 0, label: 'Sun', short: 'S' },
  { id: 1, label: 'Mon', short: 'M' },
  { id: 2, label: 'Tue', short: 'T' },
  { id: 3, label: 'Wed', short: 'W' },
  { id: 4, label: 'Thu', short: 'T' },
  { id: 5, label: 'Fri', short: 'F' },
  { id: 6, label: 'Sat', short: 'S' },
];

export default function HabitModal({
  isOpen,
  onClose,
  onSave,
  categories = [],
  editingHabit = null,
}) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [scheduledDays, setScheduledDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name || '');
      setCategoryId(editingHabit.category_id || (categories[0]?.id || ''));
      setScheduledDays(editingHabit.scheduled_days || [0, 1, 2, 3, 4, 5, 6]);
    } else {
      setName('');
      setCategoryId(categories[0]?.id || '');
      setScheduledDays([0, 1, 2, 3, 4, 5, 6]);
    }
    setError('');
  }, [editingHabit, categories, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (dayId) => {
    if (scheduledDays.includes(dayId)) {
      if (scheduledDays.length === 1) {
        setError('At least one day must be scheduled.');
        return;
      }
      setScheduledDays(scheduledDays.filter((d) => d !== dayId));
    } else {
      setScheduledDays([...scheduledDays, dayId].sort());
    }
    setError('');
  };

  const setAllDays = () => setScheduledDays([0, 1, 2, 3, 4, 5, 6]);
  const setWeekdays = () => setScheduledDays([1, 2, 3, 4, 5]);
  const setWeekends = () => setScheduledDays([0, 6]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const sanitized = sanitizeInputText(name, 60);

    if (!sanitized) {
      setError('Please provide a habit name.');
      return;
    }

    if (scheduledDays.length === 0) {
      setError('Select at least one day for this habit.');
      return;
    }

    onSave({
      id: editingHabit?.id,
      name: sanitized,
      category_id: categoryId || categories[0]?.id,
      scheduled_days: scheduledDays,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-indigo-950/40">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {editingHabit ? 'Edit Habit' : 'Forge New Habit'}
          </h2>
          <button
            type="button"
            id="close-habit-modal-btn"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Habit Name */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
              <label htmlFor="habit-name-input">Habit Name</label>
              <span className="font-mono text-slate-500 text-[11px]">{name.length}/60</span>
            </div>
            <input
              id="habit-name-input"
              type="text"
              required
              maxLength={60}
              placeholder="e.g. 50 Push-ups, Read 20 Pages, Meditate..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category Select */}
          <div className="space-y-1.5">
            <label htmlFor="habit-category-select" className="block text-xs font-semibold text-slate-300">
              RPG Attribute / Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/15 text-white ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Days */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Target Schedule</span>
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={setAllDays}
                  className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300 hover:bg-slate-700"
                >
                  Daily
                </button>
                <button
                  type="button"
                  onClick={setWeekdays}
                  className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300 hover:bg-slate-700"
                >
                  Weekdays
                </button>
                <button
                  type="button"
                  onClick={setWeekends}
                  className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300 hover:bg-slate-700"
                >
                  Weekends
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {DAYS.map((d) => {
                const isDaySelected = scheduledDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDay(d.id)}
                    className={`flex flex-col items-center justify-center rounded-xl py-2 transition-all ${
                      isDaySelected
                        ? 'border border-indigo-500 bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                        : 'border border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs">{d.short}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              id="cancel-habit-btn"
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-habit-btn"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-95"
            >
              {editingHabit ? 'Save Changes' : 'Forge Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
