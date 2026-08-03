'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, Check, X, Info } from 'lucide-react';

interface PreferenceWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (prefs: {
    diet: 'VEG' | 'NON_VEG';
    spice: 'Mild' | 'Medium' | 'Hot' | 'Nepali-Hot';
    wrapper: 'Organic Wheat' | 'Whole Wheat Atta' | 'Spinach Emerald' | 'Beetroot Crimson';
    onion: boolean;
  }) => void;
}

export const PreferenceWizard: React.FC<PreferenceWizardProps> = ({ isOpen, onClose, onConfirm }) => {
  const [step, setStep] = useState(1);
  const [diet, setDiet] = useState<'VEG' | 'NON_VEG' | null>(null);
  const [spice, setSpice] = useState<'Mild' | 'Medium' | 'Hot' | 'Nepali-Hot' | null>(null);
  const [wrapper, setWrapper] = useState<'Organic Wheat' | 'Whole Wheat Atta' | 'Spinach Emerald' | 'Beetroot Crimson' | null>(null);
  const [onion, setOnion] = useState<boolean>(true);

  // Resume or start fresh state check
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('tb_wizard_in_progress');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTimeout(() => {
            setDiet(parsed.diet || null);
            setSpice(parsed.spice || null);
            setWrapper(parsed.wrapper || null);
            setOnion(parsed.onion !== undefined ? parsed.onion : true);
            setStep(parsed.step || 1);
          }, 0);
        } catch {}
      }
    }
  }, [isOpen]);

  // Save progress dynamically
  const saveProgress = (currentStep: number) => {
    localStorage.setItem('tb_wizard_in_progress', JSON.stringify({
      diet,
      spice,
      wrapper,
      onion,
      step: currentStep
    }));
  };

  const handleSelectDiet = (val: 'VEG' | 'NON_VEG') => {
    setDiet(val);
    setTimeout(() => {
      setStep(2);
      localStorage.setItem('tb_wizard_in_progress', JSON.stringify({
        diet: val,
        spice,
        wrapper,
        onion,
        step: 2
      }));
    }, 350); // Under 400ms transition time
  };

  const handleSelectSpice = (val: 'Mild' | 'Medium' | 'Hot' | 'Nepali-Hot') => {
    setSpice(val);
    setTimeout(() => {
      setStep(3);
      localStorage.setItem('tb_wizard_in_progress', JSON.stringify({
        diet,
        spice: val,
        wrapper,
        onion,
        step: 3
      }));
    }, 350);
  };

  const handleSelectWrapper = (val: 'Organic Wheat' | 'Whole Wheat Atta' | 'Spinach Emerald' | 'Beetroot Crimson') => {
    setWrapper(val);
    setTimeout(() => {
      setStep(4);
      localStorage.setItem('tb_wizard_in_progress', JSON.stringify({
        diet,
        spice,
        wrapper: val,
        onion,
        step: 4
      }));
    }, 350);
  };

  const handleOnionNext = () => {
    setStep(5);
    saveProgress(5);
  };

  const handleConfirm = () => {
    if (diet && spice && wrapper) {
      onConfirm({ diet, spice, wrapper, onion });
      localStorage.removeItem('tb_wizard_in_progress'); // Clear state upon completion
      onClose();
    }
  };

  const handleReset = () => {
    if (confirm("Reset onboarding options and start from Step 1?")) {
      setDiet(null);
      setSpice(null);
      setWrapper(null);
      setOnion(true);
      setStep(1);
      localStorage.removeItem('tb_wizard_in_progress');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-lg rounded-[40px] border border-amber-500/20 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[500px]">
        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="p-6 md:p-8 flex justify-between items-center border-b border-stone-850/50 relative z-10 bg-black/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            <div>
              <h3 className="text-sm font-black uppercase text-stone-100 tracking-wider">Culinary Preferences</h3>
              <p className="text-[10px] text-stone-500 font-semibold">Wizard Step {step} of 5</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-900 border border-stone-800 hover:border-stone-700 flex items-center justify-center text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps Content Area */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-center relative z-10">
          
          {/* STEP 1: Veg / Non-Veg */}
          {step === 1 && (
            <div className="flex flex-col gap-4 text-center animate-[fadeIn_0.3s_ease-out]">
              <h2 className="text-lg font-black text-stone-100 uppercase tracking-wide">Are you Veg or Non-Veg?</h2>
              <p className="text-xs text-stone-400 max-w-sm mx-auto mb-4">We will adjust the default menu and customization wrapper ingredients based on your preference.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSelectDiet('VEG')}
                  className={`p-6 rounded-[28px] border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                    diet === 'VEG'
                      ? 'bg-emerald-950/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-stone-950/50 border-stone-850 hover:border-stone-700'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full" />
                  </div>
                  <strong className="text-sm uppercase tracking-wider text-emerald-400 font-black">Veg Only</strong>
                  <span className="text-[10px] text-stone-500 font-semibold">Clean vegetarian fills</span>
                </button>

                <button
                  onClick={() => handleSelectDiet('NON_VEG')}
                  className={`p-6 rounded-[28px] border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                    diet === 'NON_VEG'
                      ? 'bg-rose-950/20 border-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.2)]'
                      : 'bg-stone-950/50 border-stone-850 hover:border-stone-700'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 border-2 border-rose-600 flex items-center justify-center">
                    <div className="w-4 h-4 bg-rose-600 rounded-sm" />
                  </div>
                  <strong className="text-sm uppercase tracking-wider text-rose-400 font-black">Non-Veg</strong>
                  <span className="text-[10px] text-stone-500 font-semibold">Chicken, Buff & Mutton options</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Spice Tolerance */}
          {step === 2 && (
            <div className="flex flex-col gap-4 text-center animate-[fadeIn_0.3s_ease-out]">
              <h2 className="text-lg font-black text-stone-100 uppercase tracking-wide">How much spice can you handle?</h2>
              <p className="text-xs text-stone-400 max-w-sm mx-auto mb-4">Choose a spice level. Customizable items will receive this chutney selection by default.</p>

              <div className="grid grid-cols-2 gap-3">
                {(['Mild', 'Medium', 'Hot', 'Nepali-Hot'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => handleSelectSpice(level)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                      spice === level
                        ? 'bg-amber-500/10 border-amber-500 shadow-md'
                        : 'bg-stone-950/50 border-stone-850 hover:border-stone-700'
                    }`}
                  >
                    <span className="text-2xl">
                      {level === 'Mild' && '😊'}
                      {level === 'Medium' && '😋'}
                      {level === 'Hot' && '🌶️'}
                      {level === 'Nepali-Hot' && '🔥'}
                    </span>
                    <strong className="text-xs uppercase tracking-wider text-stone-200 font-black">{level}</strong>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Dough Wrapper Preference */}
          {step === 3 && (
            <div className="flex flex-col gap-4 text-center animate-[fadeIn_0.3s_ease-out]">
              <h2 className="text-lg font-black text-stone-100 uppercase tracking-wide">Choose Your Momo Wrapper</h2>
              <p className="text-xs text-stone-400 max-w-sm mx-auto mb-4">Select your default flour wrapper preference. Atta is 100% whole wheat.</p>

              <div className="grid grid-cols-2 gap-3">
                {(['Organic Wheat', 'Whole Wheat Atta', 'Spinach Emerald', 'Beetroot Crimson'] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => handleSelectWrapper(w)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                      wrapper === w
                        ? 'bg-amber-500/10 border-amber-500 shadow-md'
                        : 'bg-stone-950/50 border-stone-850 hover:border-stone-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full border border-stone-800 ${
                      w === 'Beetroot Crimson'
                        ? 'bg-red-800'
                        : w === 'Spinach Emerald'
                        ? 'bg-emerald-800'
                        : w === 'Whole Wheat Atta'
                        ? 'bg-stone-700'
                        : 'bg-stone-300'
                    }`} />
                    <strong className="text-[10px] uppercase tracking-wider text-stone-200 font-black">{w}</strong>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Onion Diet Restriction */}
          {step === 4 && (
            <div className="flex flex-col gap-4 text-center animate-[fadeIn_0.3s_ease-out]">
              <h2 className="text-lg font-black text-stone-100 uppercase tracking-wide">Onion Preference</h2>
              <p className="text-xs text-stone-400 max-w-sm mx-auto mb-2">Some Nepalese households and religious diets avoid onion/garlic.</p>
              
              <div className="bg-stone-950/60 border border-stone-850 p-4 rounded-2xl flex items-start gap-2.5 text-[10px] text-stone-500 font-semibold text-left max-w-sm mx-auto mb-4">
                <Info className="w-4.5 h-4.5 text-amber-500/70 shrink-0" />
                <span>Avoid onions and garlic? Choosing &apos;No&apos; sets items to be prepared without root onions (Satvik compatibility).</span>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => { setOnion(true); handleOnionNext(); }}
                  className={`w-32 py-3 rounded-2xl border-2 font-black uppercase text-xs tracking-wider transition-all ${
                    onion
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-md'
                      : 'bg-stone-950/50 border-stone-850 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  Yes, Include
                </button>
                <button
                  onClick={() => { setOnion(false); handleOnionNext(); }}
                  className={`w-32 py-3 rounded-2xl border-2 font-black uppercase text-xs tracking-wider transition-all ${
                    !onion
                      ? 'bg-emerald-600 text-stone-100 border-emerald-600 shadow-md'
                      : 'bg-stone-950/50 border-stone-850 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  No Onion
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Confirmation Summary */}
          {step === 5 && (
            <div className="flex flex-col gap-4 text-center animate-[fadeIn_0.3s_ease-out]">
              <h2 className="text-lg font-black text-stone-100 uppercase tracking-wide">Review & Confirm</h2>
              <p className="text-xs text-stone-400 max-w-sm mx-auto mb-2">Double-check your choices. Customizable food items added later will carry these defaults.</p>

              <div className="bg-stone-950/70 border border-stone-850 rounded-2xl p-5 text-left text-xs font-semibold text-stone-300 max-w-sm mx-auto w-full space-y-3">
                <div className="flex justify-between items-center border-b border-stone-850 pb-2">
                  <span className="text-stone-500">Dietary Option:</span>
                  <div className="flex items-center gap-1.5 font-extrabold text-amber-500">
                    <button onClick={() => setStep(1)} className="hover:underline text-[10px] text-amber-500 uppercase tracking-wider pr-1 border-r border-stone-850 mr-1.5 font-black text-amber-600/70">Edit</button>
                    {diet === 'VEG' ? '💚 Veg Only' : '🍗 Non-Veg'}
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-stone-850 pb-2">
                  <span className="text-stone-500">Spice Level:</span>
                  <div className="flex items-center gap-1.5 font-extrabold text-amber-500">
                    <button onClick={() => setStep(2)} className="hover:underline text-[10px] text-amber-500 uppercase tracking-wider pr-1 border-r border-stone-850 mr-1.5 font-black text-amber-600/70">Edit</button>
                    🌶️ {spice}
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-stone-850 pb-2">
                  <span className="text-stone-500">Momo Dough Wrapper:</span>
                  <div className="flex items-center gap-1.5 font-extrabold text-amber-500">
                    <button onClick={() => setStep(3)} className="hover:underline text-[10px] text-amber-500 uppercase tracking-wider pr-1 border-r border-stone-850 mr-1.5 font-black text-amber-600/70">Edit</button>
                    🥟 {wrapper}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Onion / Garlic diet:</span>
                  <div className="flex items-center gap-1.5 font-extrabold text-amber-500">
                    <button onClick={() => setStep(4)} className="hover:underline text-[10px] text-amber-500 uppercase tracking-wider pr-1 border-r border-stone-850 mr-1.5 font-black text-amber-600/70">Edit</button>
                    🧅 {onion ? 'Include Onion' : 'No Onion'}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-6 md:p-8 border-t border-stone-850/50 flex justify-between items-center relative z-10 bg-black/10">
          <div>
            {step > 1 && (
              <button
                onClick={() => {
                  const prev = step - 1;
                  setStep(prev);
                  saveProgress(prev);
                }}
                className="px-4 py-2 border border-stone-800 hover:border-stone-700 hover:text-stone-100 rounded-xl text-stone-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {step < 5 ? (
              <button
                onClick={handleReset}
                className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-stone-500 hover:text-stone-300 transition-colors border-0 bg-transparent cursor-pointer"
              >
                Reset
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer flex items-center gap-1"
              >
                Confirm & Apply <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
