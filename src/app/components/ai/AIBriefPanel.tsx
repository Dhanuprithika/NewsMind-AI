import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ExternalLink,
  Clock,
  Tag,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Newspaper,
  ChevronRight,
} from 'lucide-react';
import { AIProcessingLogs } from './AIProcessingLogs';
import type { Article } from '../../services/api';
import type { AIResult } from '../../services/api';

interface AIBriefPanelProps {
  article: Article | null;
  logs: string[];
  result: AIResult | null;
  isLoading: boolean;
  isDone: boolean;
  onClose: () => void;
}

export function AIBriefPanel({
  article,
  logs,
  result,
  isLoading,
  isDone,
  onClose,
}: AIBriefPanelProps) {
  return (
    <AnimatePresence>
      {article && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] lg:w-[520px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#1a1a2e] text-white px-5 py-4 shrink-0">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-white leading-snug line-clamp-2"
                    style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem' }}
                  >
                    {article.title}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Newspaper className="w-3.5 h-3.5" />
                  <span className="text-xs">{article.source}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs">{article.readingTime} min read</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span className="text-xs">{article.category}</span>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Processing logs */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs tracking-widest uppercase text-gray-500">
                    {isDone ? 'Analysis Complete' : 'Analysing…'}
                  </span>
                </div>
                <AIProcessingLogs logs={logs} isDone={isDone} />
              </div>

              {/* Results */}
              <AnimatePresence>
                {isDone && result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    {/* Summary */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                          <MessageSquare className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs tracking-widest uppercase text-blue-700">Summary</span>
                      </div>
                      <p
                        className="text-gray-800 text-sm leading-relaxed"
                        style={{ fontFamily: "'Source Serif 4', serif" }}
                      >
                        {result.summary}
                      </p>
                    </div>

                    {/* Why it matters */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-amber-500 rounded flex items-center justify-center">
                          <TrendingUp className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs tracking-widest uppercase text-amber-700">Why It Matters</span>
                      </div>
                      <p
                        className="text-gray-800 text-sm leading-relaxed"
                        style={{ fontFamily: "'Source Serif 4', serif" }}
                      >
                        {result.whyItMatters}
                      </p>
                    </div>

                    {/* Key points */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs tracking-widest uppercase text-gray-500">Key Points</span>
                      </div>
                      <ul className="space-y-2">
                        {result.keyPoints.map((pt, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="flex items-start gap-2.5 text-sm text-gray-700"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-[#c0392b] mt-1.5 shrink-0" />
                            <span style={{ fontFamily: "'Source Serif 4', serif" }}>{pt}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Related trends */}
                    <div>
                      <span className="text-xs tracking-widest uppercase text-gray-500 block mb-2">
                        Related Trends
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {result.relatedTrends.map((trend, i) => (
                          <motion.span
                            key={i}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.06 }}
                            className="px-3 py-1 bg-[#1a1a2e] text-white text-xs rounded-full cursor-pointer hover:bg-[#c0392b] transition-colors"
                          >
                            # {trend}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Explore more */}
                    <div>
                      <span className="text-xs tracking-widest uppercase text-gray-500 block mb-2">
                        Explore More
                      </span>
                      <div className="space-y-2">
                        {result.exploreMore.map((q, i) => (
                          <button
                            key={i}
                            className="w-full text-left flex items-center justify-between gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 transition-colors group"
                          >
                            <span>{q}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 shrink-0 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Related coverage */}
                    <div>
                      <span className="text-xs tracking-widest uppercase text-gray-500 block mb-2">
                        Related Coverage
                      </span>
                      <div className="space-y-2">
                        {result.relatedCoverage.map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer group"
                          >
                            <div className="w-1 h-full bg-gray-200 group-hover:bg-[#c0392b] rounded-full transition-colors self-stretch" />
                            <div>
                              <p
                                className="text-sm text-gray-800 group-hover:text-[#c0392b] transition-colors leading-snug"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                              >
                                {item.title}
                              </p>
                              <span className="text-xs text-gray-400 mt-0.5 block">{item.source}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer CTA */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 shrink-0">
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#c0392b] hover:bg-[#a93226] text-white rounded-xl transition-colors font-medium text-sm">
                <ExternalLink className="w-4 h-4" />
                Read Full Article on ET
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
