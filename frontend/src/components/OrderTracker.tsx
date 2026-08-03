'use client';

import React from 'react';
import { 
  ClipboardList, 
  Flame, 
  Box, 
  Truck, 
  CheckCircle2, 
  RotateCcw,
  Play
} from 'lucide-react';

export interface OrderTrackerProps {
  currentStageIndex: number; // 0 to 5
  onStageChange?: (newIndex: number) => void;
  isDemoMode?: boolean;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  currentStageIndex,
  onStageChange,
  isDemoMode = false,
}) => {
  const stages = [
    { label: 'Order Received', icon: ClipboardList, desc: 'Your order has been logged' },
    { label: 'Prepping', icon: Flame, desc: 'Fresh ingredients are prepped' },
    { label: 'Cooking', icon: Flame, desc: 'Wok and momo steamers heating up' },
    { label: 'Packed', icon: Box, desc: 'Insulated thermal sealing applied' },
    { label: 'Out for Delivery', icon: Truck, desc: 'Rider is on their way' },
    { label: 'Delivered', icon: CheckCircle2, desc: 'Enjoy your warm Nepali meal!' },
  ];

  return (
    <div className="bg-stone-900 border border-stone-850 p-6 md:p-8 rounded-[40px] shadow-xl w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-2">
        <div>
          <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase block mb-1">
            Real-Time Delivery tracking
          </span>
          <h3 className="text-xl font-extrabold text-stone-100 serif-title">
            Live Order Status
          </h3>
        </div>
        
        {isDemoMode && onStageChange && (
          <div className="flex gap-2 items-center bg-stone-950 p-1.5 rounded-xl border border-stone-800">
            <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider px-2">Demo Simulator:</span>
            <button
              onClick={() => onStageChange((currentStageIndex + 1) % 6)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 text-[9px] font-black uppercase tracking-wider cursor-pointer"
            >
              <Play className="w-2.5 h-2.5" /> Next Stage
            </button>
            <button
              onClick={() => onStageChange(0)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-850 text-stone-300 text-[9px] font-black uppercase tracking-wider border border-stone-800 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Reset
            </button>
          </div>
        )}
      </div>

      {/* Stepper horizontal track */}
      <div className="relative w-full py-4 overflow-x-auto no-scrollbar">
        <div className="min-w-[700px] flex justify-between items-start relative px-4">
          
          {/* Progress bar connector behind steps */}
          <div className="absolute top-7 left-10 right-10 h-0.5 bg-stone-800 -z-10" />
          <div 
            className="absolute top-7 left-10 h-0.5 bg-amber-500 transition-all duration-500 ease-in-out -z-10"
            style={{ width: `${(currentStageIndex / 5) * 88}%` }}
          />

          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = idx < currentStageIndex;
            const isActive = idx === currentStageIndex;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center text-center px-1">
                {/* Stage Circle/Icon */}
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-amber-500 border-amber-500 text-stone-950 scale-110 shadow-lg shadow-amber-500/20'
                      : isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-stone-100'
                      : 'bg-stone-900 border-stone-800 text-stone-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Text Label */}
                <span 
                  className={`text-[10px] font-black uppercase tracking-wider mt-3 transition-colors ${
                    isActive ? 'text-amber-500' : isCompleted ? 'text-emerald-500' : 'text-stone-500'
                  }`}
                >
                  {stage.label}
                </span>

                {/* Subtext description */}
                <p className="text-[9px] text-stone-600 mt-1 max-w-[90px] leading-tight font-medium">
                  {stage.desc}
                </p>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};
