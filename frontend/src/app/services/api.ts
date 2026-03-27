const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export interface Article {
  id: string;
  title: string;
  text?: string;
  preview?: string;
  source: string;
  readingTime?: number;
  category?: string;
  sector?: string;
  topic?: string;
  sentiment?: string;
  imageUrl?: string;
  publishedAt?: string;
  timestamp?: string;
  isBookmarked?: boolean;
  link?: string;
  analysis?: any;
  rank_score?: number;
  summary?: string;
  is_processed?: number;
}

export interface DashboardData {
  briefing: string;
  insight: string;
  recommended: Article[];
  categories: {
    business: Article[];
    startups: Article[];
    banking: Article[];
    tech: Article[];
    [key: string]: Article[];
  };
  articles: Article[];
}

// GET /api/news?field={field}&user_type={type}&timeframe={tf}
export async function getNews(field: string = 'General', userType: string = 'general', timeframe: string = 'all'): Promise<DashboardData> {
  const res = await fetch(`${BASE_URL}/api/news?field=${field}&user_type=${userType}&timeframe=${timeframe}`);
  if (!res.ok) throw new Error('API error');
  const result = await res.json();
  return result.data;
}

// GET /api/news/{id}
export async function getArticle(articleId: string): Promise<Article> {
  const res = await fetch(`${BASE_URL}/api/news/${articleId}`);
  if (!res.ok) throw new Error('Article not found');
  const result = await res.json();
  return result.article;
}

// POST /api/news/save
export async function saveArticle(articleId: string, userId: string = 'default_user'): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/news/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ article_id: articleId, user_id: userId }),
  });
  if (!res.ok) throw new Error('Failed to save article');
}

// GET /api/news/saved
export async function getSavedArticles(userId: string = 'default_user'): Promise<Article[]> {
  const res = await fetch(`${BASE_URL}/api/news/saved?user_id=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch saved articles');
  const result = await res.json();
  return result.articles;
}

// POST /api/user/preferences
export async function updatePreferences(preferences: any): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/user/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
  if (!res.ok) throw new Error('Failed to update preferences');
}

// GET /api/news/history?timeframe={timeframe}&sector={sector}
export async function getHistory(timeframe: string = 'all', sector: string = 'General'): Promise<Article[]> {
  const res = await fetch(`${BASE_URL}/api/news/history?timeframe=${timeframe}&sector=${sector}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  const result = await res.json();
  return result.history;
}

// SSE streaming hook logic helper
export function getAgentStreamUrl(userType: string, field: string): string {
  return `${BASE_URL}/api/news/stream?user_type=${userType}&field=${field}`;
}
