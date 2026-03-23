'use client';

import { useState, useEffect } from 'react';
import { getAvailableThemes } from '@/lib/vocabulary';

interface InputStepProps {
  onSubmit: (theme: string, title: string) => void;
}

// 主题对应的默认标题
const getDefaultTitle = (theme: string): string => {
  const titleMap: Record<string, string> = {
    '超市': '走进超市',
    '医院': '探秘医院',
    '公园': '游逛公园',
    '学校': '我的学校',
    '动物园': '动物园之旅',
    '消防站': '小小消防员',
  };
  return titleMap[theme] || `走进${theme}`;
};

export default function InputStep({ onSubmit }: InputStepProps) {
  const [theme, setTheme] = useState('超市');
  const [customTheme, setCustomTheme] = useState('');
  const [title, setTitle] = useState('走进超市');
  const [isTitleManuallyEdited, setIsTitleManuallyEdited] = useState(false);

  const availableThemes = getAvailableThemes();
  const isCustomTheme = theme === 'custom';

  // 当主题改变且用户未手动修改过标题时，自动更新标题
  useEffect(() => {
    if (!isCustomTheme && !isTitleManuallyEdited) {
      setTitle(getDefaultTitle(theme));
    }
  }, [theme, isCustomTheme, isTitleManuallyEdited]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTheme = isCustomTheme ? customTheme.trim() : theme;
    const finalTitle = title.trim() || finalTheme;

    if (!finalTheme) return;

    onSubmit(finalTheme, finalTitle);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    // 切换主题时重置手动编辑标志
    setIsTitleManuallyEdited(false);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // 用户手动编辑标题时，标记为已编辑
    setIsTitleManuallyEdited(true);
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label htmlFor="theme-select" className="block text-lg font-semibold mb-3 text-gray-700">
            选择主题/场景 🎯
          </label>
          <select
            id="theme-select"
            name="theme"
            value={theme}
            onChange={(e) => handleThemeChange(e.target.value)}
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
            <label htmlFor="custom-theme-input" className="block text-lg font-semibold mb-3 text-gray-700">
              自定义主题 ✏️
            </label>
            <input
              id="custom-theme-input"
              name="custom-theme"
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
          <label htmlFor="title-input" className="block text-lg font-semibold mb-3 text-gray-700">
            小报标题 📝
          </label>
          <input
            id="title-input"
            name="title"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
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
