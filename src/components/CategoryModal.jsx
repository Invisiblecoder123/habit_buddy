// src/components/CategoryModal.jsx
// Category / RPG Attribute Management with strict hex color validation

import React, { useState } from 'react';
import { X, Plus, Shield, Check, AlertCircle } from 'lucide-react';
import { ALLOWED_HEX_COLORS, validateCategoryColor, sanitizeInputText } from '../lib/sanitize';

export default function CategoryModal({
  isOpen,
  onClose,
  categories = [],
  onCreateCategory,
}) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(ALLOWED_HEX_COLORS[0]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const sanitizedName = sanitizeInputText(name, 30);

    if (!sanitizedName) {
      setError('Please provide a category name.');
      return;
    }

    const validatedColor = validateCategoryColor(selectedColor);

    onCreateCategory({
      name: sanitizedName,
      color: validatedColor,
    });

    setName('');
    setSelectedColor(ALLOWED_HEX_COLORS[0]);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-indigo-950/40">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              RPG Attributes & Categories
            </h2>
          </div>
          <button
            type="button"
            id="close-category-modal-btn"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Existing Categories List */}
        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Attributes
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-2.5"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {cat.name}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-indigo-300">
                  {cat.points || 0} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Add Category Section */}
        <form onSubmit={handleSubmit} className="mt-5 pt-4 border-t border-slate-800 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Forge New Attribute
          </label>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-2 text-xs text-red-300">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <input
              type="text"
              required
              maxLength={30}
              placeholder="e.g. Creativity, Agility, Finance..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Color Palette Whitelist */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-400">
              Calibrated Color Palette (Whitelisted):
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {ALLOWED_HEX_COLORS.map((hex) => {
                const isSelected = selectedColor === hex;
                return (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setSelectedColor(hex)}
                    className={`relative flex h-7 w-7 items-center justify-center rounded-lg border transition-transform active:scale-95 ${
                      isSelected
                        ? 'border-white scale-110 shadow-md ring-2 ring-indigo-500'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    {isSelected && <Check className="h-4 w-4 stroke-[3] text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="submit"
              id="create-category-btn"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Attribute</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
