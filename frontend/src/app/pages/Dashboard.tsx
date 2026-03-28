import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Container } from '../components/layout/Container';
import { DailyBriefing } from '../components/dashboard/DailyBriefing';
import { KeyInsight } from '../components/dashboard/KeyInsight';
import { ExploreMore } from '../components/dashboard/ExploreMore';
import { NewsCard } from '../components/dashboard/NewsCard';
import { CategorySection } from '../components/dashboard/CategorySection';
import { NewsFeed } from '../components/dashboard/NewsFeed';
import { AIBriefPanel } from '../components/ai/AIBriefPanel';
import { AIProcessingLogs } from '../components/ai/AIProcessingLogs';
import { TimeFilterBar, type TimeFrame } from '../components/dashboard/TimeFilterBar';
import { TrendingWidget } from '../components/dashboard/TrendingWidget';
import { SkeletonCard } from '../components/dashboard/SkeletonCard';
import { useNews } from '../hooks/useNews';
import { useSSE } from '../hooks/useSSE';
import { useUser } from '../hooks/UserContext';
import { Article } from '../services/api';
import { Loader2, ArrowLeft } from 'lucide-react';

import { useParams, useNavigate } from 'react-router';

export function Dashboard() {
  const { userType, selectedField, setSelectedField } = useUser();
  const [timeframe, setTimeframe] = useState<TimeFrame>('all');
  const navigate = useNavigate();
  
  const { data, isLoading, toggleBookmark } = useNews(selectedField, userType, timeframe);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const { logs, isLoading: aiLoading, isDone } = useSSE(selectedField, userType);

  const handleReadMore = (article: Article) => navigate(`/article/${encodeURIComponent(article.id)}`);
  const handleClose = () => setSelectedArticle(null);

  const sectors = ['General', 'Business', 'Startups', 'Banking', 'Technology', 'Markets'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f4]">
        <ReadingProgress />
        <Container className="py-6">
          {/* Date bar skeleton */}
          <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-300">
            <div className="flex-1 h-px bg-gray-300" />
            <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main loading skeleton */}
            <div className="lg:col-span-8 space-y-6">
              <div className="h-36 bg-gray-200 rounded-2xl animate-pulse" />
              <section>
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              </section>
              <section>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar loading skeleton */}
            <div className="lg:col-span-4 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </Container>
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <Loader2 className="w-7 h-7 text-[#c0392b] animate-spin" />
          <p
            className="text-gray-500 text-xs"
            style={{ fontFamily: "'Source Serif 4', serif" }}
          >
            Personalising your newsroom…
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      {/* Reading progress bar */}
      <ReadingProgress />

      <Container className="py-4 sm:py-6">
        {/* Masthead date line */}
        <div className="flex items-center gap-4 mb-4 sm:mb-5 pb-4 border-b border-gray-300">
          <div className="flex-1 h-px bg-gray-300" />
          <span
            className="text-xs tracking-widest uppercase text-gray-500 shrink-0"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {timeframe === 'all' 
              ? new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              : `Focus Intelligence: ${timeframe.toUpperCase()}`
            }
          </span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* ── HISTORICAL FILTER BAR ── */}
        <TimeFilterBar activeTimeframe={timeframe} onChange={setTimeframe} />

        {/* ── 12-column responsive grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">

          {/* ── MAIN CONTENT ── */}
          <div className="lg:col-span-8 space-y-8 min-w-0">

            {selectedField === 'General' && (
              <>
                {/* NEW LEAD: Top Stories with Inline Navigation */}
                <TopStoriesHero
                  articles={data.articles.slice(0, 2)}
                  onReadMore={handleReadMore}
                  onBookmark={toggleBookmark}
                />

                {/* Daily Briefing Summary (Agents run in the background silently) */}
                <DailyBriefing text={data.briefing} />
              </>
            )}

            {timeframe === 'all' && selectedField === 'General' ? (
              <>
                {/* Business */}
                <CategorySection
                  title="Business"
                  articles={data.categories.business}
                  onReadMore={handleReadMore}
                  onBookmark={toggleBookmark}
                  onViewAll={() => setSelectedField('Business')}
                  accentColor="#7c3aed"
                />

                {/* World Intelligence */}
                <CategorySection
                  title="World Intelligence"
                  articles={data.categories.world}
                  onReadMore={handleReadMore}
                  onBookmark={toggleBookmark}
                  onViewAll={() => setSelectedField('World')}
                  accentColor="#059669"
                />

                {/* Startups & VC */}
                <CategorySection
                  title="Startups & VC"
                  articles={data.categories.startups}
                  onReadMore={handleReadMore}
                  onBookmark={toggleBookmark}
                  onViewAll={() => setSelectedField('Startups')}
                  accentColor="#ea580c"
                />

                {/* Economy & Policy */}
                <CategorySection
                  title="Economy & Policy"
                  articles={data.categories.economy}
                  onReadMore={handleReadMore}
                  onBookmark={toggleBookmark}
                  onViewAll={() => setSelectedField('Economy')}
                  accentColor="#2563eb"
                />

                {/* Banking & Finance */}
                <CategorySection
                  title="Banking & Finance"
                  articles={data.categories.banking}
                  onReadMore={handleReadMore}
                  onBookmark={toggleBookmark}
                  onViewAll={() => setSelectedField('Banking')}
                  accentColor="#1e40af"
                />
              </>
            ) : (
              <div className="flex flex-col gap-4 mb-6">
                <button 
                  onClick={() => setSelectedField('General')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all group w-fit rounded-full shadow-sm hover:shadow-md"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.1em]">Return to General Terminal</span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 rounded-full bg-[#c0392b]" />
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {selectedField} Intelligence Archive
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#c0392b] font-black uppercase tracking-widest bg-[#c0392b]/5 px-3 py-1 rounded-full border border-[#c0392b]/10">
                      Archive: {timeframe.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                      {data.articles.length} Records
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* News Feed — Main Archive List */}
            <NewsFeed
              articles={data.articles}
              onReadMore={handleReadMore}
              onBookmark={toggleBookmark}
              variant={selectedField === 'General' ? 'list' : 'grid'}
            />
          </div>

          {/* ── SIDEBAR ── Desktop only: sticky scroll */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-[132px] space-y-5 max-h-[calc(100vh-148px)] overflow-y-auto scrollbar-hide pb-6">
              <KeyInsight 
                text={timeframe === 'all' ? data.insight : `Historical Intelligence Snapshot for ${timeframe}. Filtered analysis focused on ${selectedField}.`} 
              />
              <ExploreMore />
              {timeframe === 'all' && <MarketsSnapshot />}
              <TrendingWidget />
              <ETPicksSidebar 
                 onReadMore={handleReadMore} 
                 articles={data.articles.slice(0, 4)} 
                 title={timeframe === 'all' ? "Editor's Picks" : `Top From ${timeframe}`}
              />
            </div>
          </div>
        </div>

        {/* Mobile: full-width sidebar content below main */}
        <div className="lg:hidden mt-6 space-y-5">
          <TrendingWidget />
          <ETPicksSidebar onReadMore={handleReadMore} articles={data.articles.slice(0, 4)} />
        </div>
      </Container>

      {/* AI Brief Panel */}
      <AIBriefPanel
        article={selectedArticle}
        logs={logs}
        result={null}
        isLoading={aiLoading}
        isDone={isDone}
        onClose={handleClose}
      />
    </div>
  );
}

// ─── Reading progress bar ─────────────────────────────────
function ReadingProgress() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 z-[100] bg-gray-200">
      <motion.div
        className="h-full bg-[#c0392b] origin-left"
        style={{ scaleX: progress / 100 }}
      />
    </div>
  );
}

// ─── Top Stories Hero ─────────────────────────────────────
interface TopStoriesHeroProps {
  articles: Article[];
  onReadMore: (a: Article) => void;
  onBookmark: (id: string) => void;
}

function TopStoriesHero({ articles, onReadMore, onBookmark }: TopStoriesHeroProps) {
  if (!articles.length) return null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-[#c0392b]" />
          <h2
            className="tracking-tight text-gray-900"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem' }}
          >
            Top Stories
          </h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {articles.length} picks
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {articles.map((article, i) => (
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
    </section>
  );
}

// ─── Markets Snapshot sidebar widget ─────────────────────
const MARKET_DATA = [
  { name: 'Sensex', value: '73,847', change: '+312', pct: '+0.82%', up: true },
  { name: 'Nifty 50', value: '22,831', change: '+96', pct: '+0.43%', up: true },
  { name: 'USD/INR', value: '₹82.34', change: '-0.10', pct: '-0.12%', up: false },
  { name: 'Gold', value: '₹65,420', change: '+202', pct: '+0.31%', up: true },
];

function MarketsSnapshot() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-green-500" />
          <span
            className="text-xs tracking-widest uppercase text-gray-700"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.9rem' }}
          >
            Markets
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-green-600">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live
        </div>
      </div>

      <div className="space-y-0 divide-y divide-gray-50">
        {MARKET_DATA.map((m) => (
          <div key={m.name} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-sm text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                {m.name}
              </p>
              <p className="text-xs text-gray-500">{m.value}</p>
            </div>
            <div className={`text-right ${m.up ? 'text-green-600' : 'text-red-500'}`}>
              <p className="text-sm">{m.change}</p>
              <p className="text-xs">{m.pct}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <button className="w-full text-xs text-center text-gray-400 hover:text-[#c0392b] transition-colors">
          View full market data →
        </button>
      </div>
    </motion.div>
  );
}

// ─── ET Picks sidebar ─────────────────────────────────────
interface ETPicksProps {
  articles: Article[];
  onReadMore: (a: Article) => void | Promise<void>;
  title?: string;
}

function ETPicksSidebar({ articles, onReadMore, title = "Editor's Picks" }: ETPicksProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 rounded-full bg-amber-500" />
        <span
          className="text-xs tracking-widest uppercase text-gray-700"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.9rem' }}
        >
          {title}
        </span>
      </div>
      <div className="space-y-0 divide-y divide-gray-50">
        {articles.map((a, i) => (
          <button
            key={a.id}
            onClick={() => onReadMore(a)}
            className="w-full text-left group py-3 first:pt-0"
          >
            <div className="flex items-start gap-2.5">
              <span
                className="text-xl leading-none shrink-0 mt-0.5"
                style={{ fontFamily: "'Playfair Display', serif", color: '#e5e7eb' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p
                  className="text-sm text-gray-800 leading-snug group-hover:text-[#c0392b] transition-colors line-clamp-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {a.title}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {a.source} · {a.publishedAt}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}