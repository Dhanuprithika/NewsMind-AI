import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Coffee, ChevronDown, ChevronUp, Calendar, Play } from 'lucide-react';
import { VideoReelPlayer } from '../ai/VideoReelPlayer';

interface DailyBriefingProps {
  text: string;
}

const today = new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function DailyBriefing({ text }: DailyBriefingProps) {
  const [expanded, setExpanded] = useState(false);

  const preview = text.slice(0, 220) + '…';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#1a1a2e] text-white rounded-2xl overflow-hidden shadow-lg"
    >
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center shadow-inner">
            <Coffee className="w-5 h-5 text-amber-900" />
          </div>
          <div>
            <h2
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-lg text-white tracking-tight"
            >
              Today's Briefing
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">{today}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 text-green-400 px-2.5 py-1 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs tracking-wide">Updated</span>
        </div>
      </div>

      <div className="px-6 py-4">
        <motion.p
          className="text-gray-200 leading-relaxed text-sm"
          style={{ fontFamily: "'Source Serif 4', serif" }}
        >
          {expanded ? text : preview}
        </motion.p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 mt-3 text-amber-400 hover:text-amber-300 transition-colors text-xs tracking-wide"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> Read full briefing
            </>
          )}
        </button>
      </div>

      {/* AI Video Component: Only show when briefing text is present */}
      {text && text.length > 50 && (
        <div className="px-6 pb-6 pt-2 border-t border-white/5">
           <VideoReelPlayer type="briefing" compact={true} />
        </div>
      )}
    </motion.div>
  );
}
