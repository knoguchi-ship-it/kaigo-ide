import { useState, useCallback } from 'react';
import { api, API_BASE } from '../lib/api-client';
import type { AiGenerateRequest, AiGenerateResponse } from '@kaigo-ide/types';

interface UseAiGenerateReturn {
  generate: (request: AiGenerateRequest) => Promise<string>;
  streamGenerate: (
    request: AiGenerateRequest,
    onChunk: (text: string) => void,
  ) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

export function useAiGenerate(): UseAiGenerateReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (request: AiGenerateRequest): Promise<string> => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await api.post<AiGenerateResponse>('/ai/generate', request);
      return result.text;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI生成に失敗しました';
      setError(msg);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const streamGenerate = useCallback(
    async (request: AiGenerateRequest, onChunk: (text: string) => void): Promise<void> => {
      setIsGenerating(true);
      setError(null);

      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE}/ai/generate/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(request),
        });

        if (!response.ok || !response.body) {
          throw new Error(`AI生成に失敗しました (${response.status})`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const jsonStr = trimmed.slice(6);
            if (jsonStr === '[DONE]') return;

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) onChunk(parsed.text);
            } catch (e) {
              if (e instanceof Error && e.message !== jsonStr) throw e;
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'AI生成に失敗しました';
        setError(msg);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  return { generate, streamGenerate, isGenerating, error };
}
