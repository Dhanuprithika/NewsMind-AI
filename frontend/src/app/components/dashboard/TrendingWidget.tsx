import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Hash, Flame } from 'lucide-react';

const TRENDING_TOPICS = [
  { tag: 'RBI Policy', count: '12.4K', trend: 'up', category: 'Banking' },
  { tag: 'Budget 2025', count: '8.2K', trend: 'up', category: 'Economy' },
  { tag: 'AI Startups', count: '6.8K', trend: 'up', category: 'Tech' },
  { tag: 'Rupee Outlook', count: '5.1K', trend: 'down', category: 'Markets' },
  { tag: 'Sensex Rally', count: '4.9K', trend: 'up', category: 'Markets' },
  { tag: 'IPO Watch', count: '3.7K', trend: 'up', category: 'Finance' },
  { tag: 'Green Energy', count: '2.9K', trend: 'up', category: 'Infra' },
];

const CATEGORY_COLORS: Record<string, string> = {
  Banking: 'bg-blue-50 text-blue-700',
  Economy: 'bg-emerald-50 text-emerald-700',
  Tech: 'bg-violet-50 text-violet-700',
  Markets: 'bg-orange-50 text-orange-700',
  Finance: 'bg-cyan-50 text-cyan-700',
  Infra: 'bg-teal-50 text-teal-700',
};

export function TrendingWidget() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-[#c0392b]" />
          <span
            className="text-xs tracking-widest uppercase text-gray-700"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.9rem' }}
          >
            Trending Now
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs text-orange-500">Hot</span>
        </div>
      </div>

      <div className="space-y-2">
        {TRENDING_TOPICS.map((item, i) => (
          <motion.button
            key={item.tag}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            whileHover={{ x: 3 }}
            onClick={() => setActiveTag(activeTag === item.tag ? null : item.tag)}
            className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl transition-all text-left ${
              activeTag === item.tag
                ? 'bg-[#1a1a2e] text-white'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`text-xs shrink-0 ${activeTag === item.tag ? 'text-amber-400' : 'text-gray-300'}`}
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <Hash
                    className={`w-2.5 h-2.5 shrink-0 ${activeTag === item.tag ? 'text-gray-400' : 'text-gray-400'}`}
                  />
                  <span
                    className={`text-sm truncate ${activeTag === item.tag ? 'text-white' : 'text-gray-800'}`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {item.tag}
                  </span>
                </div>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTag === item.tag
                      ? 'text-gray-300'
                      : CATEGORY_COLORS[item.category] ?? 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {item.category}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {item.trend === 'up' ? (
                <TrendingUp className={`w-3 h-3 ${activeTag === item.tag ? 'text-green-400' : 'text-green-500'}`} />
              ) : (
                <TrendingDown className={`w-3 h-3 ${activeTag === item.tag ? 'text-red-400' : 'text-red-500'}`} />
              )}
              <span
                className={`text-xs ${activeTag === item.tag ? 'text-gray-300' : 'text-gray-400'}`}
              >
                {item.count}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
        {['#Budget', '#RBI', '#HDFC', '#Sensex', '#IPO', '#UPI'].map((tag) => (
          <button
            key={tag}
            className="text-xs px-2 py-0.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-700 rounded-full transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
