// src/components/ConfigView/OptionItem.tsx
import React from 'react';
import { Option } from '@/types';

interface OptionItemProps {
  option: Option;
  onUpdate: (option: Option) => void;
  onDelete: () => void;
  canDelete: boolean;
}

export function OptionItem({ option, onUpdate, onDelete, canDelete }: OptionItemProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      marginBottom: '10px',
      alignItems: 'center',
    }}>
      <div
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: option.color,
          flexShrink: 0,
        }}
      />
      <input
        type="text"
        value={option.name}
        onChange={(e) => onUpdate({ ...option, name: e.target.value.slice(0, 15) })}
        placeholder="选项名称"
        maxLength={15}
        style={{
          flex: 1,
          padding: '10px',
          border: option.name.trim() === '' ? '2px solid #ff6b6b' : '2px solid #ddd',
          borderRadius: '8px',
          outline: 'none',
        }}
      />
      <input
        type="number"
        value={option.weight}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          onUpdate({ ...option, weight: val > 0 ? val : 1 });
        }}
        min="0.1"
        step="0.1"
        style={{
          width: '70px',
          padding: '10px',
          border: option.weight <= 0 ? '2px solid #ff6b6b' : '2px solid #ddd',
          borderRadius: '8px',
          textAlign: 'center',
          outline: 'none',
        }}
      />
      <button
        onClick={onDelete}
        disabled={!canDelete}
        style={{
          padding: '10px 15px',
          background: canDelete ? '#ff6b6b' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: canDelete ? 'pointer' : 'not-allowed',
        }}
      >
        删除
      </button>
    </div>
  );
}
