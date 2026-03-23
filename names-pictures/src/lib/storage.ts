import type { HistoryItem } from '@/types';
import { CONFIG } from './config';

const STORAGE_KEY = CONFIG.STORAGE_KEY;
const STORAGE_KEY_API = CONFIG.STORAGE_KEY_API;

// API Key 管理
export function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_API) || '';
}

export function setApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_API, key);
}

export function hasApiKey(): boolean {
  return getApiKey().length > 0;
}

export function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

export function addHistoryItem(item: HistoryItem): void {
  const history = loadHistory();

  // 添加新项到开头
  history.unshift(item);

  // 限制历史记录数量
  if (history.length > CONFIG.MAX_HISTORY) {
    history.splice(CONFIG.MAX_HISTORY);
  }

  saveHistory(history);
}

export function deleteHistoryItem(id: string): void {
  const history = loadHistory();
  const filtered = history.filter(item => item.id !== id);
  saveHistory(filtered);
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
