// src/lib/defaults.ts
import type { AppState, Option } from '@/types';
import { assignOptionColors } from './themes';

const defaultOptions: Option[] = [
  { id: '1', name: '火锅', weight: 1, color: '' },
  { id: '2', name: '烧烤', weight: 1, color: '' },
  { id: '3', name: '披萨', weight: 1, color: '' },
  { id: '4', name: '寿司', weight: 1, color: '' },
];

export const DEFAULT_STATE: AppState = {
  title: '今天决定点什么？',
  theme: 'morandi',
  options: assignOptionColors(defaultOptions, 'morandi'),
  viewMode: 'edit',
  isSpinning: false,
  lastResult: null,
  soundEnabled: true,
};
