import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, Clock, TrendingUp, Eye } from 'lucide-react';

const TOP_CATEGORIES = [
  { name: 'Markets', pct: 38, color: '#1e40af' },
  { name: 'Banking', pct: 25, color: '#166534' },
  { name: 'Startups', pct: 20, color: '#ea580c' },
  { name: 'Technology', pct: 12, color: '#0e7490' },
  { name: 'Economy', pct: 5, color: '#9f1239' },
];

const PEAK_HOURS = [
  { hour: '7am', val: 60 },
  { hour: '8am', val: 90 },
  { hour: '9am', val: 75 },
  { hour: '12pm', val: 50 },
  { hour: '6pm', val: 80 },
  { hour: '9pm', val: 65 },
  { hour: '10pm', val: 40 },
];

export function BehaviorInsights() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-purple-600" />
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-gray-900">
          Reading Insights
        </h3>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <Eye className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-gray-900 text-lg">148</p>
          <p className="text-xs text-gray-500">Articles read</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <Clock className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-gray-900 text-lg">4.2 min</p>
          <p className="text-xs text-gray-500">Avg. read time</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <TrendingUp className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-gray-900 text-lg">+34%</p>
          <p className="text-xs text-gray-500">vs last month</p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="mb-5">
        <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Top Categories</p>
        <div className="space-y-2.5">
          {TOP_CATEGORIES.map((cat, i) => (
            <div key={cat.name} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-20 shrink-0">{cat.name}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: cat.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.pct}%` }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <span className="text-xs text-gray-500 w-8 text-right">{cat.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Peak reading hours */}
      <div>
        <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Peak Reading Hours</p>
        <div className="flex items-end gap-1.5 h-16">
          {PEAK_HOURS.map((h, i) => (
            <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                className="w-full rounded-t-sm bg-[#1a1a2e]/80 hover:bg-[#c0392b] transition-colors cursor-default"
                style={{ maxWidth: 28 }}
                initial={{ height: 0 }}
                animate={{ height: `${h.val}%` }}
                transition={{ delay: 0.4 + i * 0.06, duration: 0.5, ease: 'easeOut' }}
              />
              <span className="text-xs text-gray-400" style={{ fontSize: '0.6rem' }}>{h.hour}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
