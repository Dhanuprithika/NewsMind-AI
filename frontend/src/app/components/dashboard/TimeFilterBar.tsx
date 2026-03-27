import React from 'react';
import { motion } from 'motion/react';
import { Calendar, History } from 'lucide-react';

export type TimeFrame = 'today' | 'yesterday' | 'week' | 'month' | 'all';

interface TimeFilterBarProps {
  activeTimeframe: TimeFrame;
  onChange: (timeframe: TimeFrame) => void;
}

export function TimeFilterBar({ activeTimeframe, onChange }: TimeFilterBarProps) {
  const timeframes: { id: TimeFrame; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'week', label: 'Last 7 Days' },
    { id: 'month', label: 'Last 30 Days' },
    { id: 'all', label: 'Full Archive' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#c0392b]/5 rounded-lg border border-[#c0392b]/10">
        <History className="w-4 h-4 text-[#c0392b]" />
        <span className="text-xs font-bold text-[#c0392b] uppercase tracking-wider">Historical Intelligence</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-100 w-full sm:w-auto">
        {timeframes.map((tf) => (
          <button
            key={tf.id}
            onClick={() => onChange(tf.id)}
            className={`relative px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeTimeframe === tf.id
                ? 'text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            {activeTimeframe === tf.id && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 bg-[#1a1a2e] rounded-lg -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            {tf.label}
          </button>
        ))}
      </div>

      <div className="hidden sm:flex items-center gap-2 ml-auto text-gray-400">
        <Calendar className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase font-bold tracking-widest">Select Intelligence Window</span>
      </div>
    </div>
  );
}
