// app/results/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ResultTable } from '@/components/ResultTable';
import type { Result } from '@/types';

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/results');
      const data = await res.json();

      if (data.success) {
        setResults(data.data.results);
      } else {
        setError(data.error || '获取数据失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-blue-900">计算结果</h1>
          <button
            onClick={fetchResults}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            刷新
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <ResultTable results={results} loading={loading} />

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {!loading && results.length > 0 && (
          <div className="mt-4 text-right text-sm text-gray-500">
            共 {results.length} 条记录
          </div>
        )}
      </div>
    </main>
  );
}
