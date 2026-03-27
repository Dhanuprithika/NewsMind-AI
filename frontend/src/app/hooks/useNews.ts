import { useState, useEffect, useCallback } from 'react';
import { getNews, saveArticle, type DashboardData } from '../services/api';

export function useNews(field: string = 'General', userType: string = 'general', timeframe: string = 'all') {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const d = await getNews(field, userType, timeframe);
      setData(d);
      setError(null);
    } catch (err) {
      setError('Failed to load news');
    } finally {
      setIsLoading(false);
    }
  }, [field, userType]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const toggleBookmark = async (articleId: string) => {
    // Optimistic UI update
    setData((prev) => {
      if (!prev) return prev;
      const toggle = (arr: any[]) =>
        arr.map((a) => (a.id === articleId ? { ...a, isBookmarked: !a.isBookmarked } : a));
      
      const newCategories: any = {};
      Object.keys(prev.categories).forEach(cat => {
        newCategories[cat] = toggle(prev.categories[cat]);
      });

      return {
        ...prev,
        recommended: toggle(prev.recommended),
        categories: newCategories,
        articles: toggle(prev.articles),
      };
    });

    try {
      await saveArticle(articleId);
    } catch (err) {
      console.error("Failed to save bookmark", err);
      // Optional: rollback on error
    }
  };

  return { data, isLoading, error, toggleBookmark, refetch: fetchNews };
}
