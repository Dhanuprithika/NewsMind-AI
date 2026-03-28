const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export interface VideoScene {
  scene_number: number;
  duration_seconds: number;
  scene_goal: string;
  caption_text: string;
  emotional_tone: string;
  voiceover_line: string;
  visual_type: string;
  visual_concept: string;
  visual_search_prompt: string;
  on_screen_layout: string;
  transition_style: string;
  visual_url?: string; // Enriched by backend
}

export interface VideoScript {
  video_type: string;
  target_duration_seconds: number;
  audience_profile: {
    persona: string;
    interests: string[];
    tone_preference: string;
  };
  hook_line: string;
  video_summary: string;
  full_voiceover_script: string;
  scenes: VideoScene[];
}

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

// POST /api/news/ask
export async function askIntelligence(question: string, articleId?: string, userType: string = 'general'): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/news/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, article_id: articleId, user_type: userType }),
  });
  if (!res.ok) throw new Error('AI Assistant is offline');
  const result = await res.json();
  return result.answer;
}

// SSE streaming hook logic helper
export function getAgentStreamUrl(userType: string, field: string): string {
  return `${BASE_URL}/api/news/stream?user_type=${userType}&field=${field}`;
}

// GET /api/news/video-script/reel/{article_id}
export async function getReelScript(articleId: string, userType: string = 'general'): Promise<VideoScript> {
  const res = await fetch(`${BASE_URL}/api/news/video-script/reel/${encodeURIComponent(articleId)}?user_type=${userType}`);
  if (!res.ok) throw new Error('Failed to generate reel script');
  const result = await res.json();
  return result.script;
}

// GET /api/news/video-script/briefing/{field}
export async function getBriefingScript(field: string, userType: string = 'general'): Promise<VideoScript> {
  const res = await fetch(`${BASE_URL}/api/news/video-script/briefing/${field}?user_type=${userType}`);
  if (!res.ok) throw new Error('Failed to generate briefing script');
  const result = await res.json();
  return result.script;
}
