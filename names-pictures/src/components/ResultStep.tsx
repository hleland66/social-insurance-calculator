'use client';

import { useState } from 'react';
import type { HistoryItem } from '@/types';

interface ResultStepProps {
  theme: string;
  title: string;
  prompt: string;
  imageUrl: string;
  onSave: (item: HistoryItem) => void;
  onReset: () => void;
}

export default function ResultStep({
  theme,
  title,
  prompt,
  imageUrl,
  onSave,
  onReset,
}: ResultStepProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}_${theme}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    const item: HistoryItem = {
      id: Date.now().toString(),
      theme,
      title,
      prompt,
      imageUrl,
      createdAt: new Date().toISOString(),
    };
    onSave(item);
    setTimeout(() => setIsSaving(false), 500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">
          🎉 生成完成！
        </h2>

        <div className="flex justify-center mb-6">
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full h-auto rounded-xl shadow-lg"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={handleDownload} className="btn-primary">
            下载图片 ⬇️
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-secondary"
          >
            {isSaving ? '已保存 ✓' : '保存到历史 📚'}
          </button>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button onClick={onReset} className="text-gray-500 hover:text-primary transition-colors">
          再生成一张 →
        </button>
      </div>
    </div>
  );
}
