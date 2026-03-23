# Switch to V-API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace KIE.AI async API with V-API sync API for image generation, with user-configurable API key stored in localStorage

**Architecture:**
- V-API uses OpenAI-compatible `/v1/images/generations` endpoint with synchronous response
- No polling needed - images returned directly in response
- Response format: `{ created, data: [{ b64_json or url }], usage }`
- API Key stored in localStorage, passed to backend with each request

**Tech Stack:** Next.js 15, TypeScript, V-API (api.gpt.ge)

---

## File Structure Changes

**Files to modify:**
1. `src/lib/config.ts` - Update API configuration (remove apiKey)
2. `src/lib/storage.ts` - Add API key localStorage functions
3. `src/types/index.ts` - Update response types
4. `src/lib/nanoBananaApi.ts` - Rewrite for V-API sync format with apiKey parameter
5. `src/app/api/generate/route.ts` - Update to receive apiKey from request
6. `src/components/SettingsModal.tsx` - NEW: Settings UI for API key
7. `src/components/Header.tsx` - Update to add settings button
8. `src/app/page.tsx` - Remove polling, use direct response, manage settings modal
9. `src/app/api/poll/route.ts` - DELETE (no longer needed)

---

## Task 1: Update Configuration

**Files:**
- Modify: `src/lib/config.ts`

- [ ] **Step 1: Update config to use V-API (without apiKey)**

```typescript
export const CONFIG = {
  // V-API 配置
  model: 'nano-banana-pro-4k',  // gemini-3-pro-image-preview, 4K resolution
  size: '4K',                    // gemini-3+ uses K values
  aspectRatio: '3:4',            // A4 竖版比例
  responseFormat: 'url',         // url or b64_json

  // 本地存储 key
  STORAGE_KEY: 'literacy_news_history',
  STORAGE_KEY_API: 'literacy_news_api_key',

  // 历史记录限制
  MAX_HISTORY: 50,

  // API 配置
  apiUrl: process.env.V_API_URL || 'https://api.gpt.ge',
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/config.ts
git commit -m "refactor: update config for V-API without apiKey"
```

---

## Task 2: Add API Key Storage

**Files:**
- Modify: `src/lib/storage.ts`

- [ ] **Step 1: Add API key storage functions**

```typescript
import { CONFIG } from './config';

// API Key 管理
export function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(CONFIG.STORAGE_KEY_API) || '';
}

export function setApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONFIG.STORAGE_KEY_API, key);
}

export function hasApiKey(): boolean {
  return getApiKey().length > 0;
}

// ... 保留现有的历史记录函数
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/storage.ts
git commit -m "feat: add API key storage functions"
```

---

## Task 3: Update Types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Replace API response types**

```typescript
// V-API 请求
export interface ImageGenerationRequest {
  model: string;
  prompt: string;
  size: string;
  aspect_ratio?: string;
  response_format?: 'url' | 'b64_json';
}

// V-API 响应
export interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

// 删除旧的 CreateTaskRequest, CreateTaskResponse, TaskDetailResponse
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "refactor: update types for V-API format"
```

---

## Task 4: Rewrite API Functions

**Files:**
- Modify: `src/lib/nanoBananaApi.ts`

- [ ] **Step 1: Replace entire file content**

```typescript
import type { ImageGenerationRequest, ImageGenerationResponse } from '@/types';
import { CONFIG } from './config';

const API_BASE = CONFIG.apiUrl;

async function apiRequest<T>(endpoint: string, apiKey: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function generateImage(prompt: string, apiKey: string): Promise<string> {
  const payload: ImageGenerationRequest = {
    model: CONFIG.model,
    prompt,
    size: CONFIG.size,
    aspect_ratio: CONFIG.aspectRatio,
    response_format: CONFIG.responseFormat as 'url' | 'b64_json',
  };

  const response = await apiRequest<ImageGenerationResponse>(
    '/v1/images/generations',
    apiKey,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  // V-API 直接返回图片 URL
  if (!response.data?.[0]?.url) {
    throw new Error('No image URL returned');
  }

  return response.data[0].url;
}

// 删除 createGenerationTask, getTaskDetail, pollTaskCompletion
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/nanoBananaApi.ts
git commit -m "refactor: rewrite API functions for V-API with apiKey parameter"
```

---

## Task 5: Update Generate Route

**Files:**
- Modify: `src/app/api/generate/route.ts`

- [ ] **Step 1: Replace route handler to receive apiKey**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/nanoBananaApi';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { prompt, apiKey } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt' },
        { status: 400 }
      );
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API Key is required. Please configure it in settings.' },
        { status: 400 }
      );
    }

    if (prompt.length > 32768) {
      return NextResponse.json(
        { error: 'Prompt too long (max 32768 tokens)' },
        { status: 400 }
      );
    }

    // V-API 直接返回图片 URL
    const imageUrl = await generateImage(prompt, apiKey);

    return NextResponse.json({
      code: 200,
      data: { imageUrl }
    });

  } catch (error) {
    console.error('Generate API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { code: 500, error: errorMessage },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/generate/route.ts
git commit -m "refactor: update generate route to receive apiKey from request"
```

---

## Task 6: Create Settings Modal

**Files:**
- Create: `src/components/SettingsModal.tsx`

- [ ] **Step 1: Create SettingsModal component**

```typescript
'use client';

import { useState } from 'react';
import { getApiKey, setApiKey } from '@/lib/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKeyInput] = useState(getApiKey());
  const [isVisible, setIsVisible] = useState(false);

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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SettingsModal.tsx
git commit -m "feat: add SettingsModal component for API key configuration"
```

---

## Task 7: Update Header Component

**Files:**
- Modify: `src/components/Header.tsx`

- [ ] **Step 1: Add settings button to Header**

```typescript
'use client';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  historyCount: number;
}

export default function Header({ onOpenHistory, onOpenSettings, historyCount }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎨</span>
          <h1 className="text-2xl font-bold text-white">儿童识字小报生成器</h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onOpenSettings}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium hover:bg-white/30 transition-all"
            aria-label="打开设置"
          >
            ⚙️ 设置
          </button>

          <button
            onClick={onOpenHistory}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium hover:bg-white/30 transition-all flex items-center gap-2"
          >
            📚 历史记录
            {historyCount > 0 && (
              <span className="bg-white/30 px-2 py-0.5 rounded-full text-sm">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat: add settings button to Header"
```

---

## Task 8: Delete Poll Route

**Files:**
- Delete: `src/app/api/poll/route.ts`

- [ ] **Step 1: Delete poll route file**

```bash
rm src/app/api/poll/route.ts
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/poll/route.ts
git commit -m "refactor: remove poll route (no longer needed)"
```

---

## Task 9: Update Frontend Flow

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add imports and state for settings**

Add imports:
```typescript
import { getApiKey } from '@/lib/storage';
import SettingsModal from '@/components/SettingsModal';
```

Add state:
```typescript
const [showSettings, setShowSettings] = useState(false);
```

- [ ] **Step 2: Update handleConfirmGenerate to pass apiKey**

```typescript
const handleConfirmGenerate = async () => {
  const apiKey = getApiKey();

  if (!apiKey) {
    setError('请先在设置中配置 API Key');
    setShowSettings(true);
    return;
  }

  setCurrentStep('generating');
  setProgress(0);
  setError('');

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, apiKey }),
    });

    const data = await response.json();

    if (data.code !== 200) {
      let errorMessage = data.error || '创建任务失败';

      if (errorMessage.includes('401') || errorMessage.includes('403')) {
        errorMessage = 'API Key 无效或权限不足，请检查配置';
      } else if (errorMessage.includes('429')) {
        errorMessage = '请求过于频繁，请稍后重试';
      } else if (errorMessage.includes('balance') || errorMessage.includes('credit')) {
        errorMessage = '账户余额不足，请充值';
      }

      throw new Error(errorMessage);
    }

    const imageUrl = data.data.imageUrl;
    setResultUrl(imageUrl);
    setCurrentStep('result');
    setProgress(100);

  } catch (err) {
    setError(err instanceof Error ? err.message : '生成失败');
    setCurrentStep('input');
  }
};
```

- [ ] **Step 3: Delete pollForResult function and taskId state**

Remove:
```typescript
const [taskId, setTaskId] = useState('');
const pollForResult = async (id: string) => { ... }
```

Remove from handleReset:
```typescript
setTaskId('');
```

- [ ] **Step 4: Update Header props and add SettingsModal**

Update Header:
```typescript
<Header
  onOpenHistory={() => setShowHistory(true)}
  onOpenSettings={() => setShowSettings(true)}
  historyCount={history.length}
/>
```

Add SettingsModal before HistoryModal:
```typescript
<SettingsModal
  isOpen={showSettings}
  onClose={() => setShowSettings(false)}
/>
```

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "refactor: update frontend for V-API with settings modal"
```

---

## Task 10: Clean Up .env.local

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Remove old KIE.AI config**

```bash
# 删除或注释掉 KIE.AI 配置
# KIE_AI_API_KEY=e377d6225182da13fb13dd221c2809e3
# KIE_AI_API_URL=https://api.kie.ai
```

- [ ] **Step 2: Commit**

```bash
git add .env.local
git commit -m "chore: remove old KIE.AI config from .env.local"
```

---

## Task 11: Update .env.local.example

**Files:**
- Create or Modify: `.env.local.example`

- [ ] **Step 1: Update with note about API key**

```bash
# V-API Configuration (optional - users can set in UI)
V_API_URL=https://api.gpt.ge
# API_KEY should be set in the app UI, not here
```

- [ ] **Step 2: Commit**

```bash
git add .env.local.example
git commit -m "docs: update env example with note about UI configuration"
```

---

## Task 12: Final Testing

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test settings flow**

1. Open http://localhost:3000
2. Click "⚙️ 设置" → verify settings modal opens
3. Enter API key → verify it saves
4. Refresh page → verify API key persists

- [ ] **Step 3: Test complete generation flow**

1. Select theme (e.g., "超市")
2. Enter title (e.g., "走进超市")
3. Click "下一步" → verify preview shows vocabulary
4. Click "开始生成" → verify loading state
5. Verify image appears in result step
6. Click "保存到历史" → verify history saves

- [ ] **Step 4: Test error handling**

1. Set invalid API key in settings
2. Try generating → verify error message "API Key 无效或权限不足"
3. Set valid API key
4. Verify generation works

---

## Summary of Changes

| Component | Before (KIE.AI) | After (V-API) |
|-----------|-----------------|---------------|
| Endpoint | `/api/v1/jobs/createTask` | `/v1/images/generations` |
| Response | Async taskId | Direct image URL |
| Polling | Required (2-60 seconds) | Not needed |
| API Key | In .env.local (server) | In localStorage (client) |
| Configuration | Developer only | User-configurable via UI |

---

## User Flow

1. **First time setup:**
   - User clicks "⚙️ 设置"
   - Enters V-API Key
   - Clicks "保存"

2. **Daily usage:**
   - Select theme → Enter title → Generate
   - No need to re-enter API key

3. **Change API key:**
   - Open settings anytime to update
