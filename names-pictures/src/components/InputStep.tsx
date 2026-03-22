'use client';

import { useState } from 'react';
import { getAvailableThemes } from '@/lib/vocabulary';

interface InputStepProps {
  onSubmit: (theme: string, title: string) => void;
}

export default function InputStep({ onSubmit }: InputStepProps) {
  const [theme, setTheme] = useState('超市');
  const [customTheme, setCustomTheme] = useState('');
  const [title, setTitle] = useState('走进超市');

  const availableThemes = getAvailableThemes();
  const isCustomTheme = theme === 'custom';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTheme = isCustomTheme ? customTheme.trim() : theme;
    const finalTitle = title.trim() || finalTheme;

    if (!finalTheme) return;

    onSubmit(finalTheme, finalTitle);
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-lg font-semibold mb-3 text-gray-700">
            选择主题/场景 🎯
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="input-field"
          >
            {availableThemes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
            <option value="custom">自定义...</option>
          </select>
        </div>

        {isCustomTheme && (
          <div>
            <label className="block text-lg font-semibold mb-3 text-gray-700">
              自定义主题 ✏️
            </label>
            <input
              type="text"
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
              placeholder="例如：图书馆、博物馆..."
              className="input-field"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-lg font-semibold mb-3 text-gray-700">
            小报标题 📝
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="为小报起个名字..."
            className="input-field"
          />
        </div>

        <button type="submit" className="btn-primary w-full text-lg">
          下一步 →
        </button>
      </form>
    </div>
  );
}
