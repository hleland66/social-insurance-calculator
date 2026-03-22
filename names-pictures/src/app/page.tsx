'use client';

import { useState, useEffect } from 'react';
import type { AppStep, HistoryItem } from '@/types';
import { getVocabulary } from '@/lib/vocabulary';
import { generatePrompt } from '@/lib/prompt';
import { addHistoryItem, deleteHistoryItem, clearHistory, loadHistory } from '@/lib/storage';
import Header from '@/components/Header';
import InputStep from '@/components/InputStep';
import PreviewStep from '@/components/PreviewStep';
import GeneratingStep from '@/components/GeneratingStep';
import ResultStep from '@/components/ResultStep';
import HistoryModal from '@/components/HistoryModal';

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<AppStep>('input');
  const [theme, setTheme] = useState('');
  const [title, setTitle] = useState('');
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [prompt, setPrompt] = useState('');
  const [taskId, setTaskId] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 加载历史记录
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // 处理输入提交
  const handleInputSubmit = (selectedTheme: string, selectedTitle: string) => {
    setTheme(selectedTheme);
    setTitle(selectedTitle);
    const vocab = getVocabulary(selectedTheme);
    setVocabulary(vocab);
    const generatedPrompt = generatePrompt(selectedTheme, selectedTitle, vocab);
    setPrompt(generatedPrompt);
    setCurrentStep('preview');
  };

  // 确认生成
  const handleConfirmGenerate = async () => {
    setCurrentStep('generating');
    setProgress(0);
    setError('');

    try {
      // 调用 API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.code !== 200) {
        throw new Error(data.error || '创建任务失败');
      }

      const newTaskId = data.data.taskId;
      setTaskId(newTaskId);

      // 轮询结果
      pollForResult(newTaskId);

    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
      setCurrentStep('input');
    }
  };

  // 轮询任务结果
  const pollForResult = async (id: string) => {
    let currentProgress = 10;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/poll?taskId=${id}`);
        const data = await response.json();

        if (data.code === 200) {
          const { status, result } = data.data;

          // 更新进度
          if (status === 'pending') {
            setProgress(Math.min(currentProgress + 5, 30));
          } else if (status === 'processing') {
            setProgress(Math.min(currentProgress + 10, 80));
            currentProgress = Math.min(currentProgress + 10, 80);
          }

          if (status === 'completed' && result?.imageUrl) {
            clearInterval(interval);
            setResultUrl(result.imageUrl);
            setCurrentStep('result');
            setProgress(100);
          }

          if (status === 'failed') {
            clearInterval(interval);
            setError('图片生成失败，请重试');
            setCurrentStep('input');
          }
        }
      } catch (err) {
        clearInterval(interval);
        setError('获取结果失败，请重试');
        setCurrentStep('input');
      }
    }, 2000);
  };

  // 保存到历史
  const handleSaveToHistory = (item: HistoryItem) => {
    addHistoryItem(item);
    setHistory(prev => [item, ...prev].slice(0, 50));
  };

  // 删除历史记录
  const handleDeleteHistory = (id: string) => {
    deleteHistoryItem(id);
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  // 清空历史
  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  // 选择历史记录
  const handleSelectHistory = (item: HistoryItem) => {
    setResultUrl(item.imageUrl);
    setTheme(item.theme);
    setTitle(item.title);
    setPrompt(item.prompt);
    setShowHistory(false);
    setCurrentStep('result');
  };

  // 重置
  const handleReset = () => {
    setCurrentStep('input');
    setTheme('');
    setTitle('');
    setVocabulary([]);
    setPrompt('');
    setTaskId('');
    setResultUrl('');
    setProgress(0);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onOpenHistory={() => setShowHistory(true)}
        historyCount={history.length}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {currentStep === 'input' && (
          <InputStep onSubmit={handleInputSubmit} />
        )}

        {currentStep === 'preview' && (
          <PreviewStep
            theme={theme}
            title={title}
            vocabulary={vocabulary}
            prompt={prompt}
            onConfirm={handleConfirmGenerate}
            onBack={handleReset}
          />
        )}

        {currentStep === 'generating' && (
          <GeneratingStep progress={progress} />
        )}

        {currentStep === 'result' && resultUrl && (
          <ResultStep
            theme={theme}
            title={title}
            prompt={prompt}
            imageUrl={resultUrl}
            onSave={handleSaveToHistory}
            onReset={handleReset}
          />
        )}
      </main>

      <HistoryModal
        isOpen={showHistory}
        items={history}
        onClose={() => setShowHistory(false)}
        onDelete={handleDeleteHistory}
        onClear={handleClearHistory}
        onSelect={handleSelectHistory}
      />
    </div>
  );
}
