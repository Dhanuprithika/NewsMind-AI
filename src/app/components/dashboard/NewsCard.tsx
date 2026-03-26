import React from 'react';
import { motion } from 'motion/react';
import { Clock, Bookmark, BookmarkCheck, ArrowUpRight } from 'lucide-react';
import type { Article } from '../../services/api';
import { getCategoryColor, getCategoryBg } from '../../utils/formatters';

interface NewsCardProps {
  article: Article;
  onReadMore: (article: Article) => void;
  onBookmark: (id: string) => void;
  index?: number;
  showLabel?: boolean;
  compact?: boolean;
}

export function NewsCard({
  article,
  onReadMore,
  onBookmark,
  index = 0,
  showLabel = true,
  compact = false,
}: NewsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden group cursor-pointer flex flex-col h-full shadow-sm transition-shadow"
      onClick={() => onReadMore(article)}
    >
      {/* Image */}
      {article.imageUrl && (
        <div className={`relative overflow-hidden shrink-0 ${compact ? 'h-36' : 'h-44'}`}>
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <span
            className="absolute top-3 left-3 text-xs px-2.5 py-0.5 rounded-full tracking-wide"
            style={{
              backgroundColor: getCategoryBg(article.category),
              color: getCategoryColor(article.category),
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {article.category}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark(article.id);
            }}
            className="absolute top-3 right-3 w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            <motion.div whileTap={{ scale: 0.8 }}>
              {article.isBookmarked ? (
                <BookmarkCheck className="w-3.5 h-3.5 text-[#c0392b] fill-[#c0392b]" />
              ) : (
                <Bookmark className="w-3.5 h-3.5 text-gray-600" />
              )}
            </motion.div>
          </button>
        </div>
      )}

      <div className="flex flex-col flex-1 p-4">
        {/* Label */}
        {showLabel && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#c0392b]" />
            <span className="text-xs text-[#c0392b] tracking-wide">Based on your reading</span>
          </div>
        )}

        {/* Title */}
        <h3
          className="text-gray-900 leading-snug mb-2 flex-1 group-hover:text-[#c0392b] transition-colors line-clamp-3"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: compact ? '0.9rem' : '1rem' }}
        >
          {article.title}
        </h3>

        {/* Preview */}
        {!compact && (
          <p
            className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3"
            style={{ fontFamily: "'Source Serif 4', serif" }}
          >
            {article.preview}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{article.source}</span>
            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{article.readingTime} min</span>
            </div>
          </div>
          <span className="text-xs text-gray-400">{article.publishedAt}</span>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReadMore(article);
          }}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 bg-[#1a1a2e] hover:bg-[#c0392b] text-white text-xs tracking-wide rounded-xl transition-colors duration-200 group/btn"
        >
          Read More
          <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
