import React from 'react';
import { motion } from 'motion/react';
import { Lightbulb, TrendingUp } from 'lucide-react';

interface KeyInsightProps {
  text: string;
}

export function KeyInsight({ text }: KeyInsightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-amber-100 rounded-full -translate-y-10 translate-x-10 opacity-60" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-100 rounded-full translate-y-6 -translate-x-6 opacity-60" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-xs tracking-widest uppercase text-amber-700">Key Insight</span>
        </div>

        <p
          className="text-gray-800 leading-relaxed text-sm"
          style={{ fontFamily: "'Source Serif 4', serif" }}
        >
          {text}
        </p>

        <div className="flex items-center gap-1.5 mt-3">
          <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs text-amber-700">Personalized for your interests</span>
        </div>
      </div>
    </motion.div>
  );
}
