import { useState, useEffect, useCallback } from 'react';
import { getAgentStreamUrl } from '../services/api';

const AGENT_MESSAGES: Record<string, string> = {
  ingestion: '🚀 Scanning global business feeds...',
  entity_analysis: '🔍 Extracting key entities and sentiment...',
  memory: '🧠 Cross-referencing with user intelligence...',
  ranking: '📊 Ranking articles by relevance...',
  synthesis: '✍️ Synthesizing daily brief...',
  output: '✅ Intelligence report ready.',
};

export function useSSE(field: string = 'General', userType: string = 'general', articleId?: string) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const startStream = useCallback(() => {
    setLogs([]);
    setIsDone(false);
    setIsLoading(true);

    // If articleId is provided, use the single article endpoint
    const url = articleId 
      ? `http://localhost:8000/api/news/stream/${encodeURIComponent(articleId)}`
      : getAgentStreamUrl(userType, field);
      
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.agent) {
          const message = data.message || AGENT_MESSAGES[data.agent] || `Agent ${data.agent} completed.`;
          setLogs((prev) => [...prev, message]);
        }

        if (data.status === 'finished' || data.agent === 'cache') {
          if (data.status === 'finished') setIsDone(true);
          setIsLoading(false);
          if (data.status === 'finished') eventSource.close();
        }

        if (data.status === 'error') {
          setLogs((prev) => [...prev, `❌ Error: ${data.message}`]);
          setIsLoading(false);
          eventSource.close();
        }
      } catch (err) {
        console.error('SSE Parse Error:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Connection Error:', err);
      eventSource.close();
      setIsLoading(false);
    };

    return () => {
      eventSource.close();
    };
  }, [field, userType, articleId]);

  useEffect(() => {
    const cleanup = startStream();
    return cleanup;
  }, [startStream]);

  return { logs, isLoading, isDone, refetch: startStream };
}