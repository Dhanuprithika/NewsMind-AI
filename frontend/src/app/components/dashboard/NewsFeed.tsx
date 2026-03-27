import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, BookmarkCheck, ArrowUpRight, Loader2, ChevronDown } from 'lucide-react';
import type { Article } from '../../services/api';
import { getCategoryColor, getCategoryBg } from '../../utils/formatters';
import { SkeletonNewsRow } from './SkeletonCard';
import { NewsCard } from './NewsCard';

interface NewsFeedProps {
  articles: Article[];
  onReadMore: (article: Article) => void;
  onBookmark: (id: string) => void;
  variant?: 'list' | 'grid';
}

const INITIAL_COUNT = 8; // Increased for better archive density
const LOAD_MORE_COUNT = 4;

export function NewsFeed({ articles, onReadMore, onBookmark, variant = 'list' }: NewsFeedProps) {
  const [displayCount, setDisplayCount] = useState(variant === 'grid' ? articles.length : INITIAL_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const visibleArticles = articles.slice(0, displayCount);
  const hasMore = displayCount < articles.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + LOAD_MORE_COUNT, articles.length));
      setIsLoadingMore(false);
    }, 700);
  };

  if (variant === 'grid') {
    return (
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
          {visibleArticles.map((article, i) => (
            <NewsCard
              key={article.id}
              article={article}
              onReadMore={onReadMore}
              onBookmark={onBookmark}
              index={i}
              showLabel={false}
            />
          ))}
        </div>
        
        {hasMore && (
           <div className="flex justify-center mt-8 pb-10">
             <button onClick={handleLoadMore} className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
               Load More Results
             </button>
           </div>
        )}
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-gray-800" />
          <h2
            className="tracking-tight text-gray-900"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem' }}
          >
            Latest News
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live feed
          </div>
        </div>
        <span className="text-xs text-gray-400">
          {visibleArticles.length} / {articles.length}
        </span>
      </div>

      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <AnimatePresence initial={false}>
          {visibleArticles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className={`flex gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer group ${
                i < visibleArticles.length - 1 ? 'border-b border-gray-100' : ''
              }`}
              onClick={() => onReadMore(article)}
            >
              {/* Index */}
              <div className="shrink-0 w-6 text-center hidden sm:block">
                <span
                  className="text-2xl leading-none"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#e5e7eb' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: getCategoryBg(article.category),
                      color: getCategoryColor(article.category),
                    }}
                  >
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-400">{article.publishedAt}</span>
                </div>

                <h4
                  className="text-gray-900 leading-snug mb-1 group-hover:text-[#c0392b] transition-colors line-clamp-2"
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.95rem' }}
                >
                  {article.title}
                </h4>

                <p className="text-gray-500 text-xs leading-relaxed line-clamp-1 hidden sm:block">
                  {article.preview}
                </p>

                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-gray-400">{article.source}</span>
                  <div className="flex items-center gap-1.5 text-[#c0392b]">
                    <div className="w-1 h-1 rounded-full bg-[#c0392b]" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">
                      Released: {article.timestamp ? new Date(article.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex flex-col items-end justify-between gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookmark(article.id);
                  }}
                  className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {article.isBookmarked ? (
                    <BookmarkCheck className="w-4 h-4 text-[#c0392b] fill-[#c0392b]" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-[#1a1a2e] flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-3 h-3 text-gray-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Skeleton rows while loading more */}
        <AnimatePresence>
          {isLoadingMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {Array.from({ length: 2 }).map((_, i) => (
                <SkeletonNewsRow key={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Load More / Load Less controls */}
      {(hasMore || displayCount > INITIAL_COUNT) && (
        <div className="flex items-center justify-center gap-3 mt-4">
          {displayCount > INITIAL_COUNT && (
            <button
              onClick={() => setDisplayCount(INITIAL_COUNT)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-3 py-1.5"
            >
              Show less
            </button>
          )}
          {hasMore && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-xs tracking-wide rounded-xl shadow-sm transition-all disabled:opacity-60"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading…
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Load More Stories
                </>
              )}
            </motion.button>
          )}
        </div>
      )}
    </section>
  );
}
