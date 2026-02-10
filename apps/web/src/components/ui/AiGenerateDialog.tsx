import { useState, useRef } from 'react';
import { Sparkles, Loader2, X, RefreshCw, Check } from 'lucide-react';
import { useAiGenerate } from '../../hooks/use-ai-generate';
import type { AiGenerateRequest } from '@kaigo-ide/types';

interface AiGenerateDialogProps {
  request: Omit<AiGenerateRequest, 'keywords'>;
  onAccept: (text: string) => void;
  onClose: () => void;
}

export function AiGenerateDialog({ request, onAccept, onClose }: AiGenerateDialogProps) {
  const [keywords, setKeywords] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const { streamGenerate, isGenerating, error } = useAiGenerate();
  const textRef = useRef('');

  const handleGenerate = async () => {
    setGeneratedText('');
    textRef.current = '';

    try {
      await streamGenerate(
        { ...request, keywords },
        (chunk) => {
          textRef.current += chunk;
          setGeneratedText(textRef.current);
        },
      );
    } catch {
      // error is handled by the hook
    }
  };

  return (
    <div className="border border-purple-200 bg-purple-50 rounded-xl p-4 mt-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-purple-700 font-medium text-sm">
          <Sparkles className="w-4 h-4" />
          AI文章生成
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-3">
        <label className="block text-xs text-gray-600 mb-1">
          キーワード・メモ（任意）
        </label>
        <textarea
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          rows={2}
          placeholder="例: 訪問、体調良好、血圧130/85、食事OK"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y bg-white"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 mb-3"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {isGenerating ? '生成中...' : '文章を生成'}
      </button>

      {error && (
        <p className="text-red-600 text-xs mb-2">{error}</p>
      )}

      {generatedText && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {generatedText}
          </p>
        </div>
      )}

      {generatedText && !isGenerating && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAccept(generatedText)}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            採用
          </button>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            再生成
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-gray-500 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
        </div>
      )}
    </div>
  );
}
