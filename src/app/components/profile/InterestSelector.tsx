import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

const INTERESTS = [
  { id: 'markets', label: 'Markets & Stocks', emoji: '📈' },
  { id: 'banking', label: 'Banking & Finance', emoji: '🏦' },
  { id: 'startups', label: 'Startups & VC', emoji: '🚀' },
  { id: 'macro', label: 'Macro Economy', emoji: '🌏' },
  { id: 'realestate', label: 'Real Estate', emoji: '🏘️' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'crypto', label: 'Crypto & Web3', emoji: '₿' },
  { id: 'energy', label: 'Energy & Climate', emoji: '⚡' },
  { id: 'policy', label: 'Policy & Regulation', emoji: '📋' },
  { id: 'auto', label: 'Auto & EV', emoji: '🚗' },
  { id: 'healthcare', label: 'Healthcare', emoji: '🏥' },
  { id: 'fmcg', label: 'Consumer & FMCG', emoji: '🛒' },
];

export function InterestSelector() {
  const [selected, setSelected] = useState<string[]>(['markets', 'banking', 'startups', 'technology']);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-gray-900">
          Interests
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {selected.length} selected
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Select topics to personalise your daily briefing
      </p>

      <div className="flex flex-wrap gap-2">
        {INTERESTS.map((interest) => {
          const isSelected = selected.includes(interest.id);
          return (
            <motion.button
              key={interest.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle(interest.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all ${
                isSelected
                  ? 'bg-[#1a1a2e] border-[#1a1a2e] text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{interest.emoji}</span>
              <span>{interest.label}</span>
              {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
