import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Clock, Bookmark, BookmarkCheck, ArrowRight } from 'lucide-react';
import type { Article } from '../../services/api';
import { getCategoryColor, getCategoryBg } from '../../utils/formatters';
import { SkeletonCategoryCard } from './SkeletonCard';

interface CategorySectionProps {
  title: string;
  articles: Article[];
  onReadMore: (article: Article) => void;
  onBookmark: (id: string) => void;
  accentColor?: string;
  isLoading?: boolean;
}

// Compute the right grid cols class based on article count
function getGridColsClass(count: number): string {
  if (count >= 4) return 'grid-cols-2 md:grid-cols-4';
  if (count === 3) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
  return 'grid-cols-1';
}

interface CardProps {
  article: Article;
  onReadMore: (article: Article) => void;
  onBookmark: (id: string) => void;
  index: number;
  fullWidth?: boolean;
}

function CategoryCard({ article, onReadMore, onBookmark, index, fullWidth }: CardProps) {
  return (
    <motion.div
      key={article.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ y: -3, boxShadow: '0 10px 30px rgba(0,0,0,0.09)' }}
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-shadow cursor-pointer flex flex-col h-full ${
        fullWidth ? 'min-w-[248px] sm:min-w-[272px] snap-start shrink-0' : ''
      }`}
      onClick={() => onReadMore(article)}
    >
      {article.imageUrl && (
        <div className="relative h-36 overflow-hidden shrink-0">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          <span
            className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: getCategoryBg(article.category),
              color: getCategoryColor(article.category),
            }}
          >
            {article.category}
          </span>
        </div>
      )}
      <div className="p-3.5 flex flex-col flex-1">
        <h4
          className="text-gray-900 leading-snug line-clamp-2 mb-2 hover:text-[#c0392b] transition-colors flex-1"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.9rem' }}
        >
          {article.title}
        </h4>
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
          {article.preview}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{article.source}</span>
            <div className="flex items-center gap-0.5 text-gray-400">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{article.readingTime}m</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark(article.id);
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            {article.isBookmarked ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-[#c0392b] fill-[#c0392b]" />
            ) : (
              <Bookmark className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function CategorySection({
  title,
  articles,
  onReadMore,
  onBookmark,
  accentColor = '#c0392b',
  isLoading = false,
}: CategorySectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' });
  };

  const gridColsClass = getGridColsClass(articles.length);

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full" style={{ backgroundColor: accentColor }} />
          <h2
            className="tracking-tight text-gray-900"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem' }}
          >
            {title}
          </h2>
          {articles.length > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {articles.length} stories
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Carousel arrows — mobile/tablet only */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <button
            className="hidden md:flex items-center gap-1 text-xs text-gray-500 hover:text-[#c0392b] transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Mobile / tablet: horizontal scroll carousel ── */}
      <div
        ref={scrollRef}
        className="md:hidden flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
      >
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="min-w-[248px] snap-start">
                <SkeletonCategoryCard />
              </div>
            ))
          : articles.map((article, i) => (
              <CategoryCard
                key={article.id}
                article={article}
                onReadMore={onReadMore}
                onBookmark={onBookmark}
                index={i}
                fullWidth
              />
            ))}
      </div>

      {/* ── Desktop: responsive grid — no empty gaps ── */}
      <div className={`hidden md:grid ${gridColsClass} gap-4`}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCategoryCard key={i} />)
          : articles.map((article, i) => (
              <CategoryCard
                key={article.id}
                article={article}
                onReadMore={onReadMore}
                onBookmark={onBookmark}
                index={i}
              />
            ))}
      </div>
    </section>
  );
}
