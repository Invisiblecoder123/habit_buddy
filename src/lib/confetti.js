// src/lib/confetti.js
// Gamified celebration confetti effects

import confetti from 'canvas-confetti';

/**
 * Fires a single rewarding habit check-off burst.
 */
export function fireHabitCheckConfetti(originX = 0.5, originY = 0.5) {
  confetti({
    particleCount: 35,
    spread: 60,
    origin: { x: originX, y: originY },
    colors: ['#10B981', '#6366F1', '#EC4899', '#F59E0B', '#06B6D4'],
    ticks: 120,
    gravity: 1.2,
    scalar: 0.8,
  });
}

/**
 * Fires a grand celebration when all scheduled daily habits are completed (100% daily discipline)
 */
export function fireGrandCelebration() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 45 * (timeLeft / duration);
    // Left side burst
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.2, y: Math.random() - 0.2 },
      colors: ['#6366F1', '#10B981', '#F59E0B'],
    });
    // Right side burst
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.8, y: Math.random() - 0.2 },
      colors: ['#EC4899', '#8B5CF6', '#06B6D4'],
    });
  }, 250);
}
