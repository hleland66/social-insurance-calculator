'use client';

import { useState, useEffect } from 'react';
import type { AppStep, HistoryItem, VocabularyEntry } from '@/types';
import { getVocabulary } from '@/lib/vocabulary';
import { generatePrompt } from '@/lib/prompt';
import { addHistoryItem, deleteHistoryItem, clearHistory, loadHistory, getApiKey } from '@/lib/storage';
import Header from '@/components/Header';
import InputStep from '@/components/InputStep';
import PreviewStep from '@/components/PreviewStep';
import GeneratingStep from '@/components/GeneratingStep';
import ResultStep from '@/components/ResultStep';
import HistoryModal from '@/components/HistoryModal';
import SettingsModal from '@/components/SettingsModal';

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<AppStep>('input');
  const [theme, setTheme] = useState('');
  const [title, setTitle] = useState('');
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
  const [prompt, setPrompt] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
    const apiKey = getApiKey();

    if (!apiKey) {
      setError('请先在设置中配置 API Key');
      setShowSettings(true);
      return;
    }

    setCurrentStep('generating');
    setProgress(0);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, apiKey }),
      });

      const data = await response.json();

      if (data.code !== 200) {
        let errorMessage = data.error || '创建任务失败';

        // 翻译常见错误码为用户友好提示
        if (errorMessage.includes('401') || errorMessage.includes('403')) {
          errorMessage = 'API Key 无效或权限不足，请检查配置';
        } else if (errorMessage.includes('429')) {
          errorMessage = '请求过于频繁，请稍后重试';
        } else if (errorMessage.includes('balance') || errorMessage.includes('credit')) {
          errorMessage = '账户余额不足，请充值';
        }

        throw new Error(errorMessage);
      }

      // V-API 直接返回图片 URL
      const imageUrl = data.data.imageUrl;
      setResultUrl(imageUrl);
      setCurrentStep('result');
      setProgress(100);

    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
      setCurrentStep('input');
    }
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
    setResultUrl('');
    setProgress(0);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onOpenHistory={() => setShowHistory(true)}
        onOpenSettings={() => setShowSettings(true)}
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

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

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
