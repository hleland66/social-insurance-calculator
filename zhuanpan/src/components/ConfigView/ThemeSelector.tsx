// src/components/ConfigView/ThemeSelector.tsx
import React from 'react';
import { ThemeId } from '@/types';
import { THEMES } from '@/lib/themes';

interface ThemeSelectorProps {
  currentTheme: ThemeId;
  onChange: (theme: ThemeId) => void;
}

export function ThemeSelector({ currentTheme, onChange }: ThemeSelectorProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '15px' }}>选择主题</h3>
      <div style={{
        display: 'flex',
        gap: '15px',
        overflowX: 'auto',
        paddingBottom: '10px',
      }}>
        {(Object.keys(THEMES) as ThemeId[]).map((themeId) => {
          const theme = THEMES[themeId];
          const isSelected = currentTheme === themeId;
          return (
            <button
              key={themeId}
              onClick={() => onChange(themeId)}
              style={{
                flexShrink: 0,
                padding: '15px 20px',
                background: isSelected ? theme.colors[0] : 'white',
                border: isSelected ? '3px solid #2d3436' : '2px solid #ddd',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '100px',
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`,
                margin: '0 auto 8px',
              }} />
              <div style={{
                fontSize: '0.9rem',
                fontWeight: isSelected ? '600' : '400',
              }}>
                {theme.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
