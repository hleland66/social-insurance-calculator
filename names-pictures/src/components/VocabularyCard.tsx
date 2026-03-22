'use client';

import type { VocabularyEntry } from '@/types';

interface VocabularyCardProps {
  entry: VocabularyEntry;
}

const categoryNames = {
  core: '核心角色',
  items: '常见物品',
  env: '环境装饰',
};

const categoryColors = {
  core: 'bg-pink-100 text-pink-700 border-pink-200',
  items: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  env: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

export default function VocabularyCard({ entry }: VocabularyCardProps) {
  return (
    <div className="inline-flex flex-col items-center p-3 m-2 rounded-xl border-2 bg-white shadow-sm hover:shadow-md transition-shadow">
      <span className={`text-xs px-2 py-1 rounded-full mb-2 ${categoryColors[entry.category]}`}>
        {categoryNames[entry.category]}
      </span>
      <span className="text-lg font-bold text-gray-800">{entry.pinyin}</span>
      <span className="text-2xl font-bold text-primary mt-1">{entry.hanzi}</span>
    </div>
  );
}
