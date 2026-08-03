'use client';

import React from 'react';
import { Award, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface LoyaltyPanelProps {
  orderCount: number;
}

interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  milestone: number;
}

const BADGES: BadgeDef[] = [
  { id: 'first_bite', name: 'First Bite', emoji: '🍳', description: 'Placed your first order successfully.', milestone: 1 },
  { id: 'tasty_regular', name: 'Tasty Regular', emoji: '🥗', description: 'Placed 3 orders with Tasty Bites.', milestone: 3 },
  { id: 'momo_enthusiast', name: 'Momo Enthusiast', emoji: '🥟', description: 'Ordered 5 times from our kitchens.', milestone: 5 },
  { id: 'momo_master', name: 'Momo Master', emoji: '👑', description: 'Legendary ordering record of 10+ orders.', milestone: 10 },
];

export const LoyaltyPanel: React.FC<LoyaltyPanelProps> = ({ orderCount = 0 }) => {
  let hasError = false;
  let nextBadge: BadgeDef | null = null;
  let previousMilestone = 0;
  let progressPercent = 0;

  try {
    nextBadge = BADGES.find((b) => orderCount < b.milestone) || null;
    previousMilestone = [...BADGES].reverse().find((b) => orderCount >= b.milestone)?.milestone || 0;
    progressPercent = nextBadge
      ? Math.min(100, Math.max(0, ((orderCount - previousMilestone) / (nextBadge.milestone - previousMilestone)) * 100))
      : 100;
  } catch (err) {
    console.warn("Failsafe: Loyalty calculations error:", err);
    hasError = true;
  }

  if (hasError) {
    return (
      <div className="bg-stone-900 border border-stone-850 p-4 rounded-2xl flex items-center gap-2 text-stone-500 text-xs">
        <ShieldAlert className="w-4 h-4 text-stone-600" />
        <span>Milestone status temporarily offline.</span>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 border border-stone-850 p-6 md:p-8 rounded-[40px] shadow-xl w-full scroll-reveal">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-6 pb-4 border-b border-stone-850">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase block mb-0.5">
              Loyalty Achievements
            </span>
            <h3 className="text-base font-extrabold text-stone-100 uppercase tracking-wider">
              Rank & Culinary Badges
            </h3>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-stone-500 font-bold block uppercase tracking-wider">Orders Count</span>
          <span className="text-lg font-black text-amber-500">{orderCount}</span>
        </div>
      </div>

      {/* Milestone Progress Bar */}
      {nextBadge ? (
        <div className="mb-8">
          <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 mb-2">
            <span>Next Rank: <strong className="text-amber-500">{nextBadge.name}</strong> ({nextBadge.milestone} orders)</span>
            <span>{orderCount} / {nextBadge.milestone} Orders</span>
          </div>
          <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-stone-850 flex p-[2px]">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mb-8 bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-2xl flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>You have unlocked all current chef milestones! You are a certified <strong>Momo Master</strong>.</span>
        </div>
      )}

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {BADGES.map((badge) => {
          const isUnlocked = orderCount >= badge.milestone;
          return (
            <div
              key={badge.id}
              className={`p-4 rounded-3xl border flex flex-col items-center text-center justify-between min-h-[140px] transition-all duration-300 relative ${
                isUnlocked
                  ? 'bg-stone-950 border-amber-500/30 hover:border-amber-500/60 shadow-lg'
                  : 'bg-stone-950/40 border-stone-900 opacity-40 select-none'
              }`}
            >
              {/* Glow for unlocked */}
              {isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent rounded-3xl pointer-events-none" />
              )}

              <span className={`text-3xl mb-2 filter transition-all ${isUnlocked ? 'drop-shadow-md scale-110' : 'grayscale'}`}>
                {badge.emoji}
              </span>

              <div>
                <h4 className={`text-xs font-black tracking-wider uppercase mb-1 ${isUnlocked ? 'text-stone-200' : 'text-stone-600'}`}>
                  {badge.name}
                </h4>
                <p className="text-[9px] text-stone-500 font-semibold leading-relaxed px-1">
                  {badge.description}
                </p>
              </div>

              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-3 block ${
                isUnlocked ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-stone-900 text-stone-700'
              }`}>
                {isUnlocked ? 'Unlocked' : `${badge.milestone} Orders`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Zero state explanation */}
      {orderCount === 0 && (
        <p className="text-[10px] text-stone-500 font-semibold text-center mt-6">
          🎉 Welcome! Place your first food order today to unlock your first achievement badge!
        </p>
      )}
    </div>
  );
};
