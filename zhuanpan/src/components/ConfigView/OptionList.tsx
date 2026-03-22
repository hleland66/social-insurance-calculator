// src/components/ConfigView/OptionList.tsx
import React from 'react';
import { Option } from '@/types';
import { OptionItem } from './OptionItem';

interface OptionListProps {
  options: Option[];
  onChange: (options: Option[]) => void;
}

export function OptionList({ options, onChange }: OptionListProps) {
  const updateOption = (index: number, option: Option) => {
    const newOptions = [...options];
    newOptions[index] = option;
    onChange(newOptions);
  };

  const deleteOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const addOption = () => {
    if (options.length >= 20) return;
    onChange([...options, {
      id: Date.now().toString(),
      name: '',
      weight: 1,
      color: options[options.length - 1]?.color || '#ccc'
    }]);
  };

  const clearAll = () => {
    if (confirm('确定要清空所有选项吗？')) {
      onChange([]);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '15px' }}>选项列表</h3>
      {options.map((opt, i) => (
        <OptionItem
          key={opt.id}
          option={opt}
          onUpdate={(o) => updateOption(i, o)}
          onDelete={() => deleteOption(i)}
          canDelete={options.length > 2}
        />
      ))}
      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button
          onClick={addOption}
          disabled={options.length >= 20}
          style={{
            flex: 1,
            padding: '12px',
            background: options.length >= 20 ? '#ccc' : '#6c5ce7',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: options.length >= 20 ? 'not-allowed' : 'pointer',
          }}
        >
          添加选项
        </button>
        <button
          onClick={clearAll}
          style={{
            padding: '12px 20px',
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          清空
        </button>
      </div>
      {options.length < 2 && (
        <p style={{ color: '#ff6b6b', marginTop: '10px' }}>
          至少需要 2 个选项才能开始
        </p>
      )}
    </div>
  );
}
