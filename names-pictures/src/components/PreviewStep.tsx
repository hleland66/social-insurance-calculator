'use client';

import { useState } from 'react';
import VocabularyCard from './VocabularyCard';
import type { VocabularyEntry } from '@/types';

interface PreviewStepProps {
  theme: string;
  title: string;
  vocabulary: VocabularyEntry[];
  prompt: string;
  onConfirm: () => void;
  onBack: () => void;
}

export default function PreviewStep({
  theme,
  title,
  vocabulary,
  prompt,
  onConfirm,
  onBack,
}: PreviewStepProps) {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-center">
          《{title}》- {theme}
        </h2>

        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          将包含 {vocabulary.length} 个词汇 📚
        </h3>

        <div className="flex flex-wrap justify-center gap-2">
          {vocabulary.map((item, index) => (
            <VocabularyCard key={index} entry={item} />
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="text-sm text-gray-500 hover:text-primary transition-colors"
          >
            {showPrompt ? '隐藏' : '查看'}完整 Prompt ▼
          </button>

          {showPrompt && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {prompt}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="btn-secondary flex-1">
          ← 返回修改
        </button>
        <button onClick={onConfirm} className="btn-primary flex-1">
          开始生成 ✨
        </button>
      </div>
    </div>
  );
}
