import { useState, useEffect, useRef } from 'react';
import { getMockAIResult, type AIResult } from '../services/api';

const SSE_STEP_MAP: Record<string, string> = {
  fetching_article: 'Understanding the article...',
  extracting_entities: 'Identifying key details...',
  analyzing_context: 'Connecting related news...',
  generating_summary: 'Preparing summary...',
};

const MOCK_STEPS = [
  'fetching_article',
  'extracting_entities',
  'analyzing_context',
  'generating_summary',
];

export function useSSE(articleId: string | null) {
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<AIResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!articleId) {
      setLogs([]);
      setResult(null);
      setIsLoading(false);
      setIsDone(false);
      return;
    }

    setLogs([]);
    setResult(null);
    setIsLoading(true);
    setIsDone(false);

    const BASE_URL = import.meta.env.VITE_API_URL || '';

    if (BASE_URL) {
      try {
        const es = new EventSource(`${BASE_URL}/stream/${articleId}`);

        es.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.step && SSE_STEP_MAP[data.step]) {
              setLogs((prev) => [...prev, SSE_STEP_MAP[data.step]]);
            }
            if (data.result) {
              setResult(data.result);
              setIsLoading(false);
              setIsDone(true);
              es.close();
            }
          } catch {
            // ignore parse errors
          }
        };

        es.onerror = () => {
          es.close();
          const cleanup = runMockSSE(articleId);
          cleanupRef.current = cleanup;
        };

        return () => {
          es.close();
        };
      } catch {
        const cleanup = runMockSSE(articleId);
        return cleanup;
      }
    } else {
      const cleanup = runMockSSE(articleId);
      return cleanup;
    }

    function runMockSSE(id: string) {
      let stepIndex = 0;
      let timeoutId: ReturnType<typeof setTimeout>;

      const interval = setInterval(() => {
        if (stepIndex < MOCK_STEPS.length) {
          const step = MOCK_STEPS[stepIndex];
          setLogs((prev) => [...prev, SSE_STEP_MAP[step]]);
          stepIndex++;
        } else {
          clearInterval(interval);
          timeoutId = setTimeout(() => {
            setResult(getMockAIResult(id));
            setIsLoading(false);
            setIsDone(true);
          }, 400);
        }
      }, 900);

      return () => {
        clearInterval(interval);
        clearTimeout(timeoutId);
      };
    }
  }, [articleId]);

  return { logs, result, isLoading, isDone };
}