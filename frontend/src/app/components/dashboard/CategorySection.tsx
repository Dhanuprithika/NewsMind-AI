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
  onViewAll?: () => void;
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
  // Premium gradient fallbacks for missing images
  const gradients = [
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
    'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'
  ];
  const fallbackGradient = gradients[index % gradients.length];

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
      <div className="relative h-36 overflow-hidden shrink-0">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full" style={{ background: fallbackGradient }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span
          className="absolute bottom-2 left-2 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-white border border-white/30"
        >
          {article.category}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h4
          className="text-gray-900 leading-snug font-bold mb-2 hover:text-[#c0392b] transition-colors line-clamp-2"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.95rem' }}
        >
          {article.title}
        </h4>
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 mb-4 flex-1">
          {article.summary || article.preview || "Intelligence analysis in progress..."}
        </p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-semibold text-gray-400">{article.source}</span>
            <div className="flex items-center gap-1.5 text-[#c0392b]">
              <div className="w-1 h-1 rounded-full bg-[#c0392b]" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                Released: {article.timestamp ? new Date(article.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
              </span>
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
  onViewAll,
  accentColor = '#c0392b',
  isLoading = false,
}: CategorySectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' });
  };

  const gridColsClass = getGridColsClass(articles?.length || 0);

  // If we have no articles and are NOT loading, don't show the section at all to keep UI clean
  if (!isLoading && (!articles || articles.length === 0)) {
    return null;
  }

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
          {articles && articles.length > 0 && (
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
            onClick={onViewAll}
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
