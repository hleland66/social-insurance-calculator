'use client';

import { useState, useEffect } from 'react';
import { getApiKey, setApiKey } from '@/lib/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKeyInput] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Load API key when modal opens
  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(getApiKey());
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(apiKey);
    onClose();
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">⚙️ 设置</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            V-API Key
          </label>
          <div className="relative">
            <input
              type={isVisible ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="请输入你的 V-API Key"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-24"
            />
            <button
              type="button"
              onClick={toggleVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
            >
              {isVisible ? '隐藏' : '显示'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            API Key 仅保存在浏览器本地，不会上传到服务器
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>获取 API Key：</strong>
          </p>
          <ol className="text-sm text-blue-700 mt-2 list-decimal list-inside space-y-1">
            <li>访问 <a href="https://api.gpt.ge" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">api.gpt.ge</a></li>
            <li>注册/登录账号</li>
            <li>在控制台获取 API Key</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
