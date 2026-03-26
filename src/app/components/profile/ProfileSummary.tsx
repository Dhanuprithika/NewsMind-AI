import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, RefreshCw } from 'lucide-react';

const SUMMARY_POINTS = [
  'You focus heavily on market movements and central bank policy — 62% of your reading time is on financial topics.',
  'You prefer in-depth articles over quick snippets. Average reading time is 4.2 min vs. 2.1 min platform average.',
  'Morning (7–9am) is your peak reading window. Your briefing will be prioritised for early delivery.',
  'Your reading patterns suggest you track RBI, SEBI, and fintech regulatory developments closely.',
];

export function ProfileSummary() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-5 text-white"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-900" />
          </div>
          <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-white">
            Your Reader Profile
          </h3>
        </div>
        <button className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
          <RefreshCw className="w-3.5 h-3.5 text-gray-300" />
        </button>
      </div>

      <div className="space-y-3">
        {SUMMARY_POINTS.map((point, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-start gap-3"
          >
            <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-amber-400 text-xs">{i + 1}</span>
            </div>
            <p
              className="text-gray-300 text-sm leading-relaxed"
              style={{ fontFamily: "'Source Serif 4', serif" }}
            >
              {point}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-gray-500">
          Profile updated based on your last 30 days of reading activity.
        </p>
      </div>
    </motion.div>
  );
}
