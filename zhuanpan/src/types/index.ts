// src/types/index.ts

export type ThemeId = 'morandi' | 'minimal' | 'pastel' | 'warm';

export interface Option {
  id: string;
  name: string;
  weight: number;
  color: string;
}

export interface AppState {
  title: string;
  theme: ThemeId;
  options: Option[];
  viewMode: 'edit' | 'play';
  isSpinning: boolean;
  lastResult: string | null;
  soundEnabled: boolean;
}

export interface Theme {
  id: ThemeId;
  name: string;
  colors: string[];
  bg: string;
  text: string;
  pointer: string;
}

export interface Segment {
  id: string;
  name: string;
  color: string;
  startAngle: number;
  endAngle: number;
  midAngle: number;
}
