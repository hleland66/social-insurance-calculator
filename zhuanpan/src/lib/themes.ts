// src/lib/themes.ts
import type { Theme, ThemeId, Option } from '@/types';

export const THEMES: Record<ThemeId, Theme> = {
  morandi: {
    id: 'morandi',
    name: '莫兰迪',
    colors: [
      '#A8B5C4', '#B8C5D4', '#C8D5E4', '#D8E5F4',
      '#C4B5A8', '#D4C5B8', '#E4D5C8', '#F4E5D8',
      '#B5C4B8', '#C5D4C8', '#D5E4D8', '#E5F4E8'
    ],
    bg: '#E8ECEF',
    text: '#495057',
    pointer: '#2D3436'
  },
  minimal: {
    id: 'minimal',
    name: '极简',
    colors: [
      '#2D3436', '#636E72', '#B2BEC3', '#DFE6E9',
      '#2D3436', '#636E72', '#B2BEC3', '#DFE6E9',
      '#2D3436', '#636E72', '#B2BEC3', '#DFE6E9'
    ],
    bg: '#F8F9FA',
    text: '#2D3436',
    pointer: '#2D3436'
  },
  pastel: {
    id: 'pastel',
    name: '马卡龙',
    colors: [
      '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7',
      '#C7CEEA', '#FFB7B2', '#FFDAC1', '#E2F0CB',
      '#B5EAD7', '#C7CEEA', '#FFB7B2', '#FFDAC1'
    ],
    bg: '#FFF5F7',
    text: '#4A4A4A',
    pointer: '#FFB7B2'
  },
  warm: {
    id: 'warm',
    name: '暖色调',
    colors: [
      '#FF6B6B', '#FFA07A', '#FFD93D', '#6BCB77',
      '#4D96FF', '#9D4EDD', '#FF6B6B', '#FFA07A',
      '#FFD93D', '#6BCB77', '#4D96FF', '#9D4EDD'
    ],
    bg: '#FFF9F0',
    text: '#2D3436',
    pointer: '#FF6B6B'
  }
};

export function getTheme(id: ThemeId): Theme {
  return THEMES[id];
}

export function assignOptionColors(options: Option[], theme: ThemeId): Option[] {
  const palette = THEMES[theme].colors;
  return options.map((opt, i) => ({
    ...opt,
    color: palette[i % palette.length]
  }));
}
