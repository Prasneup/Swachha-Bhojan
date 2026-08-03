'use client';

import React, { useState, useMemo } from 'react';
import { X, Check, Utensils } from 'lucide-react';
import { CustomThali, ThaliComponent } from '../types/food';

interface ThaliBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onAddThali: (thali: CustomThali, totalPrice: number) => void;
}

const BASES: ThaliComponent[] = [
  { name: 'Steamed Basmati Rice', price: 100 },
  { name: 'Organic Buckwheat Dhido', price: 130 },
  { name: 'Hand-rolled Butter Roti', price: 80 },
];

const CURRIES: ThaliComponent[] = [
  { name: 'Slow-cooked Black Lentil soup (Dal)', price: 60 },
  { name: 'Hilly Local Chicken Curry', price: 140 },
  { name: 'Spicy Local Mutton Curry', price: 180 },
  { name: 'Mustard Greens (Saag)', price: 50 },
];

const ACHARS: ThaliComponent[] = [
  { name: 'Traditional Gundruk Achar', price: 40 },
  { name: 'Zingy Tomato Pickle', price: 30 },
  { name: 'Spiced Radish Pickle (Mula ko Achar)', price: 30 },
];

const EXTRAS: ThaliComponent[] = [
  { name: 'Crunchy Pappadum', price: 20 },
  { name: 'Clarified Ghee Drizzle', price: 30 },
  { name: 'Curd Yogurt', price: 40 },
];

export const ThaliBuilder: React.FC<ThaliBuilderProps> = ({ isOpen, onClose, onAddThali }) => {
  const [selectedBase, setSelectedBase] = useState<ThaliComponent | null>(null);
  const [selectedCurries, setSelectedCurries] = useState<ThaliComponent[]>([]);
  const [selectedAchar, setSelectedAchar] = useState<ThaliComponent | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<ThaliComponent[]>([]);

  // Calculate dynamic total price
  const totalPrice = useMemo(() => {
    const basePrice = selectedBase?.price || 0;
    const curriesPrice = selectedCurries.reduce((sum, item) => sum + item.price, 0);
    const acharPrice = selectedAchar?.price || 0;
    const extrasPrice = selectedExtras.reduce((sum, item) => sum + item.price, 0);
    return basePrice + curriesPrice + acharPrice + extrasPrice;
  }, [selectedBase, selectedCurries, selectedAchar, selectedExtras]);

  if (!isOpen) return null;

  const handleToggleCurry = (curry: ThaliComponent) => {
    if (selectedCurries.find((c) => c.name === curry.name)) {
      setSelectedCurries(selectedCurries.filter((c) => c.name !== curry.name));
    } else {
      if (selectedCurries.length >= 2) {
        setSelectedCurries([selectedCurries[1], curry]);
      } else {
        setSelectedCurries([...selectedCurries, curry]);
      }
    }
  };

  const handleToggleExtra = (extra: ThaliComponent) => {
    if (selectedExtras.find((e) => e.name === extra.name)) {
      setSelectedExtras(selectedExtras.filter((e) => e.name !== extra.name));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const handleAdd = () => {
    if (!selectedBase) {
      alert('Please choose 1 Base (Rice, Dhido, or Roti) to complete your Thali.');
      return;
    }
    if (selectedCurries.length === 0) {
      alert('Please choose at least 1 Curry or Dal item.');
      return;
    }
    if (!selectedAchar) {
      alert('Please choose 1 Achar option.');
      return;
    }

    const thali: CustomThali = {
      base: selectedBase,
      curries: selectedCurries,
      achar: selectedAchar,
      extras: selectedExtras,
    };

    onAddThali(thali, totalPrice);
    setSelectedBase(null);
    setSelectedCurries([]);
    setSelectedAchar(null);
    setSelectedExtras([]);
    onClose();
  };

  const handleCancelClose = () => {
    setSelectedBase(null);
    setSelectedCurries([]);
    setSelectedAchar(null);
    setSelectedExtras([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-850 rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 flex flex-col justify-between shadow-2xl relative scrollbar-thin">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase block mb-0.5">
                Artisan Combo Builder
              </span>
              <h3 className="text-xl font-extrabold text-stone-100 serif-title">
                Build Your Custom Thali
              </h3>
            </div>
          </div>
          <button
            onClick={handleCancelClose}
            className="w-8 h-8 rounded-full bg-stone-950 border border-stone-850 flex items-center justify-center text-stone-400 hover:text-stone-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Stages */}
        <div className="flex flex-col gap-6 mb-8 pr-1">
          {/* STAGE 1: BASE */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">
                1. Select Base (Required - Pick 1)
              </label>
              {selectedBase && (
                <span className="text-[8px] bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-900/30 font-black">
                  COMPLETED
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BASES.map((b) => {
                const isSelected = selectedBase?.name === b.name;
                return (
                  <button
                    key={b.name}
                    onClick={() => setSelectedBase(b)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between min-h-[70px] cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500 border-amber-500 text-stone-950 shadow-md shadow-amber-500/15'
                        : 'bg-stone-950 border-stone-850 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <span className="text-[11px] font-extrabold">{b.name}</span>
                    <span className={`text-[10px] font-black mt-2 ${isSelected ? 'text-stone-950' : 'text-amber-500'}`}>
                      Rs. {b.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STAGE 2: DAL/CURRY */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">
                2. Select Curries & Lentils (Required - Pick 1 to 2)
              </label>
              <span className="text-[9px] text-stone-500 font-bold">
                Selected: {selectedCurries.length}/2
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CURRIES.map((c) => {
                const isSelected = selectedCurries.find((curry) => curry.name === c.name);
                return (
                  <button
                    key={c.name}
                    onClick={() => handleToggleCurry(c)}
                    className={`p-3 rounded-2xl border text-left flex justify-between items-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500 border-amber-500 text-stone-950 shadow-md'
                        : 'bg-stone-950 border-stone-850 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-extrabold">{c.name}</span>
                      <span className={`text-[10px] font-black mt-1 ${isSelected ? 'text-stone-950' : 'text-amber-500'}`}>
                        Rs. {c.price}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STAGE 3: ACHAR */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">
                3. Choose Local Achar (Required - Pick 1)
              </label>
              {selectedAchar && (
                <span className="text-[8px] bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-900/30 font-black">
                  COMPLETED
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ACHARS.map((a) => {
                const isSelected = selectedAchar?.name === a.name;
                return (
                  <button
                    key={a.name}
                    onClick={() => setSelectedAchar(a)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between min-h-[70px] cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500 border-amber-500 text-stone-950 shadow-md shadow-amber-500/15'
                        : 'bg-stone-950 border-stone-850 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <span className="text-[11px] font-extrabold">{a.name}</span>
                    <span className={`text-[10px] font-black mt-2 ${isSelected ? 'text-stone-950' : 'text-amber-500'}`}>
                      Rs. {a.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STAGE 4: EXTRAS */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">
                4. Select Optional Extras (Pick Multiple)
              </label>
              <span className="text-[9px] text-stone-500 font-bold">
                Optional
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {EXTRAS.map((e) => {
                const isSelected = selectedExtras.find((item) => item.name === e.name);
                return (
                  <button
                    key={e.name}
                    onClick={() => handleToggleExtra(e)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between min-h-[70px] cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500 border-amber-500 text-stone-950 shadow-md shadow-amber-500/15'
                        : 'bg-stone-950 border-stone-850 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-[11px] font-extrabold">{e.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-stone-950 shrink-0" />}
                    </div>
                    <span className={`text-[10px] font-black mt-2 ${isSelected ? 'text-stone-950' : 'text-amber-500'}`}>
                      Rs. {e.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-stone-850 pt-5 flex items-center justify-between gap-4 mt-auto">
          <div className="text-left">
            <span className="text-[10px] text-stone-500 font-bold block uppercase tracking-wider">
              Total Combo Price
            </span>
            <span className="text-xl font-black text-amber-500">
              Rs. {totalPrice}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCancelClose}
              className="px-5 py-2.5 rounded-xl border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-950/60 font-extrabold text-xs uppercase cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs uppercase shadow-md shadow-amber-500/10 cursor-pointer flex items-center gap-1.5"
            >
              Add To Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
