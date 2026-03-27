import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Send, Sparkles, ChevronRight } from 'lucide-react';

const QUESTIONS = [
  'How does RBI\'s liquidity injection affect home loan rates?',
  'Which sectors benefit most from India\'s Q3 GDP growth?',
  'What does FII return signal for Indian equities in Q1 FY26?',
];

export function ExploreMore() {
  const [input, setInput] = useState('');
  const [activeQ, setActiveQ] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-[#1a1a2e] rounded-lg flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs tracking-widest uppercase text-gray-500">Explore More</span>
      </div>

      <div className="space-y-2 mb-4">
        {QUESTIONS.map((q, i) => (
          <motion.button
            key={i}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveQ(activeQ === i ? null : i)}
            className={`w-full text-left text-sm px-3.5 py-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 group ${
              activeQ === i
                ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
            }`}
          >
            <span className="leading-snug">{q}</span>
            <ChevronRight
              className={`w-4 h-4 shrink-0 transition-transform ${
                activeQ === i ? 'rotate-90 text-amber-400' : 'text-gray-400'
              }`}
            />
          </motion.button>
        ))}
      </div>

      {/* Custom question input */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#c0392b] focus-within:ring-2 focus-within:ring-[#c0392b]/10 transition-all">
        <Sparkles className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about today's news…"
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
        <button
          className={`p-1 rounded-lg transition-colors ${
            input.trim() ? 'text-[#c0392b] hover:bg-red-50' : 'text-gray-300'
          }`}
          disabled={!input.trim()}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
