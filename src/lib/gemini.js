// src/lib/gemini.js
// Client-side quote fetcher that calls /api/quote.js with deterministic fallback

import { fallbackQuotes, getDeterministicDailyQuote } from '../data/fallbackQuotes';

const QUOTE_CACHE_KEY = 'habit_buddy_daily_quote_cache';

/**
 * Fetches the daily motivational quote.
 * Tries the secure Vercel serverless function /api/quote first.
 * If offline, error, or unconfigured, gracefully falls back to the deterministic 60-quote pool.
 */
export async function fetchMotivationalQuote(forceRefresh = false) {
  const todayKey = new Date().toISOString().split('T')[0];

  // Check cache first unless forced
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(QUOTE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.date === todayKey && parsed.quote) {
          return parsed;
        }
      }
    } catch {
      // Ignore cache parsing errors
    }
  }

  // Attempt to call serverless function
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch('/api/quote', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.quote) {
        const quoteObj = {
          quote: data.quote,
          author: data.author || 'Discipline Core',
          source: data.source || 'gemini',
          date: todayKey,
        };
        try {
          localStorage.setItem(QUOTE_CACHE_KEY, JSON.stringify(quoteObj));
        } catch {
          // ignore storage error
        }
        return quoteObj;
      }
    }
  } catch (err) {
    // Expected during offline or local Vite preview without Vercel CLI
    console.debug('Quote API fetch skipped or failed, using deterministic fallback.', err?.message);
  }

  // Resilient deterministic fallback
  const fallback = getDeterministicDailyQuote(fallbackQuotes, new Date());
  const fallbackObj = {
    quote: fallback.quote,
    author: fallback.author,
    source: 'fallback',
    date: todayKey,
  };

  try {
    localStorage.setItem(QUOTE_CACHE_KEY, JSON.stringify(fallbackObj));
  } catch {
    // ignore
  }

  return fallbackObj;
}
