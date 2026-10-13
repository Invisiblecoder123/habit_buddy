// src/lib/sanitize.js
// Defense-in-depth sanitization and input validation

import DOMPurify from 'dompurify';

export const ALLOWED_HEX_COLORS = [
  '#10B981', // Health / Emerald
  '#6366F1', // Intelligence / Indigo
  '#EF4444', // Strength / Crimson
  '#EC4899', // Relations / Pink
  '#06B6D4', // Mindfulness / Cyan
  '#F59E0B', // Vitality / Amber
  '#8B5CF6', // Arcane / Purple
  '#14B8A6', // Focus / Teal
  '#F97316', // Energy / Orange
  '#3B82F6', // Strategy / Blue
  '#84CC16', // Growth / Lime
  '#64748B', // Iron / Slate
];

/**
 * Validates a category color against the strictly allowed hex codes.
 * Returns the color if valid, or a safe default (#6366F1).
 */
export function validateCategoryColor(color) {
  if (!color || typeof color !== 'string') {
    return ALLOWED_HEX_COLORS[0];
  }
  const normalized = color.trim().toUpperCase();
  const matched = ALLOWED_HEX_COLORS.find(c => c.toUpperCase() === normalized);
  return matched || ALLOWED_HEX_COLORS[0];
}

/**
 * Checks if a hex color is within the allowed whitelist.
 */
export function isAllowedColor(color) {
  if (!color || typeof color !== 'string') return false;
  return ALLOWED_HEX_COLORS.some(c => c.toUpperCase() === color.trim().toUpperCase());
}

/**
 * Gets DOMPurify instance safely across browser and webview contexts
 */
function getPurifier() {
  if (typeof window !== 'undefined') {
    if (typeof DOMPurify === 'function') {
      try {
        return DOMPurify(window);
      } catch {
        // Fallback
      }
    }
    if (DOMPurify && typeof DOMPurify.sanitize === 'function') {
      return DOMPurify;
    }
  }
  return null;
}

/**
 * Sanitizes user text (habit names, category names, usernames).
 * Strips script tags, HTML entities, and restricts max length to prevent XSS and DB bloat.
 */
export function sanitizeInputText(input, maxLength = 60) {
  if (input === null || input === undefined) return '';
  const raw = String(input).trim();

  let cleaned = raw;
  const purifier = getPurifier();

  if (purifier && typeof purifier.sanitize === 'function') {
    cleaned = purifier.sanitize(raw, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
  } else {
    // Regex fallback: strip all HTML tags & quotes/brackets
    cleaned = raw.replace(/<[^>]*>?/gm, '');
  }

  // Extra defense: remove dangerous control characters and trim
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();

  return cleaned.slice(0, maxLength);
}
