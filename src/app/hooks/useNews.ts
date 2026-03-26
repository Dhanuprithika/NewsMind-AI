import { useState, useEffect } from 'react';
import { getNews, type DashboardData } from '../services/api';

export function useNews() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getNews()
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch(() => setError('Failed to load news'))
      .finally(() => setIsLoading(false));
  }, []);

  const toggleBookmark = (articleId: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const toggle = (arr: typeof prev.articles) =>
        arr.map((a) => (a.id === articleId ? { ...a, isBookmarked: !a.isBookmarked } : a));
      return {
        ...prev,
        recommended: toggle(prev.recommended),
        categories: {
          business: toggle(prev.categories.business),
          startups: toggle(prev.categories.startups),
          banking: toggle(prev.categories.banking),
        },
        articles: toggle(prev.articles),
      };
    });
  };

  return { data, isLoading, error, toggleBookmark };
}
