// src/components/BannerQuote.jsx
// AI Motivational Banner: Gemini API with 60-quote resilient fallback

import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Volume2, ShieldCheck, Copy, Check } from 'lucide-react';
import { fetchMotivationalQuote } from '../lib/gemini';

export default function BannerQuote() {
  const [quoteData, setQuoteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const loadQuote = async (force = false) => {
    setLoading(true);
    try {
      const data = await fetchMotivationalQuote(force);
      setQuoteData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuote(false);
  }, []);

  const handleCopy = () => {
    if (!quoteData) return;
    navigator.clipboard.writeText(`"${quoteData.quote}" — ${quoteData.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!quoteData || typeof window === 'undefined' || !window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(`${quoteData.quote}. By ${quoteData.author}`);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 p-5 md:p-6 shadow-xl backdrop-blur-md transition-all hover:border-indigo-500/35">
      {/* Background ambient glow effect */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-purple-500/15 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 space-y-2.5">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {quoteData?.source === 'gemini' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
                <Sparkles className="h-3 w-3 text-indigo-400 animate-pulse" />
                Gemini AI Generated
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                Stoic Vault Fallback
              </span>
            )}
            <span className="text-[11px] font-mono text-slate-400 tracking-wide uppercase">
              Daily Discipline Spark
            </span>
          </div>

          {/* Quote Content */}
          <div className="min-h-[56px] flex items-center">
            {loading ? (
              <div className="space-y-2 w-full animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                <div className="h-3 bg-slate-800 rounded w-1/3"></div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-base sm:text-lg font-medium tracking-tight text-slate-100 leading-snug">
                  "{quoteData?.quote}"
                </p>
                <p className="text-xs sm:text-sm font-semibold text-indigo-400/90 font-mono">
                  — {quoteData?.author}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            type="button"
            id="quote-copy-btn"
            onClick={handleCopy}
            title="Copy Quote"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-all active:scale-95"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>

          <button
            type="button"
            id="quote-speak-btn"
            onClick={handleSpeak}
            title={speaking ? "Stop Audio" : "Listen Quote"}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all active:scale-95 ${
              speaking
                ? 'bg-indigo-600 text-white border-indigo-400 animate-pulse'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border-slate-700/60'
            }`}
          >
            <Volume2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            id="quote-refresh-btn"
            onClick={() => loadQuote(true)}
            disabled={loading}
            title="Fetch Fresh Quote"
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold tracking-wide border border-indigo-400/30 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Inspire</span>
          </button>
        </div>
      </div>
    </div>
  );
}
