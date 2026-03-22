# 儿童识字小报生成器 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个 Next.js 全栈应用，允许用户输入主题和标题，调用 Nano Banana 2 API 生成儿童识字小报图片。

**Architecture:** 单页应用架构，使用 React state 管理步骤切换，Next.js API Routes 代理后端请求，localStorage 存储历史记录。

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Nano Banana 2 API

---

## 文件结构

```
names-pictures/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate/
│   │   │       └── route.ts        # API 代理端点
│   │   ├── layout.tsx               # 根布局
│   │   ├── page.tsx                 # 主页面（单页应用）
│   │   └── globals.css              # 全局样式
│   ├── components/
│   │   ├── InputStep.tsx            # 步骤1: 输入主题和标题
│   │   ├── PreviewStep.tsx          # 步骤2: 预览 prompt 和词汇
│   │   ├── GeneratingStep.tsx       # 步骤3: 生成进度
│   │   ├── ResultStep.tsx           # 步骤4: 结果展示
│   │   ├── Header.tsx               # 顶部导航栏
│   │   ├── HistoryModal.tsx         # 历史记录弹窗
│   │   └── VocabularyCard.tsx       # 词汇卡片组件
│   ├── lib/
│   │   ├── config.ts                # 应用配置
│   │   ├── vocabulary.ts            # 预置词库
│   │   ├── prompt.ts                # Prompt 模板生成
│   │   ├── nanoBananaApi.ts         # Nano Banana API 封装
│   │   └── storage.ts               # localStorage 封装
│   └── types/
│       └── index.ts                 # TypeScript 类型定义
├── .env.local                       # 环境变量（不提交）
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Task 1: 初始化 Next.js 项目

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "literacy-news-generator",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.1.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5",
    "tailwindcss": "^3.4.1",
    "postcss": "^8",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "15.1.3"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: 创建 next.config.js**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```

- [ ] **Step 4: 创建 tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B9D',
        secondary: '#4ECDC4',
        accent: '#FFE66D',
        background: '#FFF5F8',
        surface: '#FFFFFF',
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 5: 创建 postcss.config.js**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 6: 创建 .gitignore**

```
node_modules
.next
.env.local
dist
build
*.log
.DS_Store
```

- [ ] **Step 7: 创建 src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-background text-text;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95;
  }

  .btn-secondary {
    @apply bg-secondary text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95;
  }

  .card {
    @apply bg-surface rounded-2xl shadow-md p-6;
  }

  .input-field {
    @apply w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-lg;
  }
}
```

- [ ] **Step 8: 安装依赖**

Run: `npm install`

- [ ] **Step 9: 验证项目启动**

Run: `npm run dev`
Expected: Next.js 开发服务器在 http://localhost:3000 启动

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js project with TypeScript and Tailwind CSS"
```

---

## Task 2: 创建类型定义

- [ ] **Step 1: 创建 src/types/index.ts**

```ts
// 应用步骤
export type AppStep = 'input' | 'preview' | 'generating' | 'result';

// 词汇条目
export interface VocabularyEntry {
  category: 'core' | 'items' | 'env';
  pinyin: string;
  hanzi: string;
}

// 词汇主题
export interface VocabularyTheme {
  core: string[];
  items: string[];
  env: string[];
}

// 历史记录项
export interface HistoryItem {
  id: string;
  theme: string;
  title: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
}

// 应用状态
export interface AppState {
  currentStep: AppStep;
  theme: string;
  title: string;
  vocabulary: VocabularyEntry[];
  generatedPrompt: string;
  taskId: string | null;
  resultUrl: string | null;
  error: string | null;
}

// Nano Banana API 请求
export interface CreateTaskRequest {
  model: string;
  input: {
    prompt: string;
    aspect_ratio: string;
    resolution: string;
    output_format: string;
  };
}

// Nano Banana API 响应
export interface CreateTaskResponse {
  code: number;
  data: {
    taskId: string;
  };
}

export interface TaskDetailResponse {
  code: number;
  data: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: {
      imageUrl: string;
    };
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 3: 创建应用配置

- [ ] **Step 1: 创建 .env.local**

```bash
KIE_AI_API_KEY=e377d6225182da13fb13dd221c2809e3
KIE_AI_API_URL=https://api.kie.ai
```

- [ ] **Step 2: 创建 src/lib/config.ts**

```ts
export const CONFIG = {
  // Nano Banana 2 配置
  model: 'nano-banana-2',
  aspectRatio: '3:4',  // A4 竖版比例
  resolution: '4K',
  outputFormat: 'png',

  // 轮询配置
  pollInterval: 2000,  // 2秒轮询一次
  maxPollTime: 120000, // 最多等待2分钟

  // 本地存储 key
  STORAGE_KEY: 'literacy_news_history',

  // 历史记录限制
  MAX_HISTORY: 50,

  // API 配置
  apiUrl: process.env.KIE_AI_API_URL || 'https://api.kie.ai',
  apiKey: process.env.KIE_AI_API_KEY || '',
};
```

- [ ] **Step 3: 验证环境变量加载**

Run: `npm run dev`
Expected: 服务器启动，无环境变量相关错误

- [ ] **Step 4: Commit**

```bash
git add .env.local src/lib/config.ts
git commit -m "feat: add application configuration"
```

---

## Task 4: 创建词库

- [ ] **Step 1: 创建 src/lib/vocabulary.ts**

```ts
import type { VocabularyTheme, VocabularyEntry } from '@/types';

export const THEME_VOCABULARY: Record<string, VocabularyTheme> = {
  超市: {
    core: ['收银台 shōu yín tái', '货架 huò jià', '购物车 gòu wù chē', '收银员 shōu yín yuán'],
    items: ['苹果 píng guǒ', '牛奶 niú nǎi', '面包 miàn bāo', '鸡蛋 jī dàn', '香蕉 xiāng jiāo', '酸奶 suān nǎi', '果汁 guǒ zhī', '糖果 táng guǒ'],
    env: ['入口 rù kǒu', '出口 chū kǒu', '价签 jià qiān', '冰柜 bīng guì', '灯光 dēng guāng'],
  },
  医院: {
    core: ['医生 yī shēng', '护士 hù shi', '病床 bìng chuáng', '挂号处 guà hào chù'],
    items: ['听诊器 tīng zhěn qì', '体温表 tǐ wēn biǎo', '药丸 yào wán', '针头 zhēn tóu', '血压计 xuè yā jì'],
    env: ['药房 yào fáng', '候诊区 hòu zhěn qū', '输液室 shū yè shì', '走廊 zǒu láng'],
  },
  公园: {
    core: ['滑梯 huá tī', '秋千 qiū qiān', '跷跷板 qiāo qiāo bǎn', '沙坑 shā kēng'],
    items: ['花朵 huā duǒ', '大树 dà shù', '小鸟 xiǎo niǎo', '蝴蝶 hú dié', '气球 qì qiú'],
    env: ['长椅 cháng yǐ', '路灯 lù dēng', '草地 cǎo dì', '喷泉 pēn quán'],
  },
  学校: {
    core: ['老师 lǎo shī', '黑板 hēi bǎn', '课桌 kè zhuō', '讲台 jiǎng tái'],
    items: ['书本 shū běn', '铅笔 qiān bǐ', '橡皮 xiàng pí', '书包 shū bāo', '尺子 chǐ zi'],
    env: ['教室 jiào shì', '操场 cāo chǎng', '图书馆 tú shū guǎn', '校门 xiào mén'],
  },
  动物园: {
    core: ['长颈鹿 cháng jǐng lù', '大象 dà xiàng', '猴子 hóu zi', '老虎 lǎo hǔ'],
    items: ['笼子 lóng zi', '标牌 biāo pái', '围栏 wéi lán', '喂食器 wèi shí qì'],
    env: ['入口广场 rù kǒu guǎng chǎng', '步行道 bù xíng dào', '休息区 xiū xi qū'],
  },
  消防站: {
    core: ['消防员 xiāo fáng yuán', '消防车 xiāo fáng chē', '消防栓 xiāo fáng shuān'],
    items: ['水枪 shuǐ qiāng', '水带 shuǐ dài', '头盔 tóu kuī', '梯子 tī zi'],
    env: ['车库 chē kù', '瞭望塔 liào wàng tǎ', '报警器 bào jǐng qì'],
  },
};

// 默认通用词汇
export const DEFAULT_VOCABULARY: VocabularyTheme = {
  core: ['孩子 hái zi', '朋友 péng you', '家人 jiā rén'],
  items: ['房子 fáng zi', '树 shù', '花 huā', '太阳 tài yáng', '云朵 yún duǒ'],
  env: ['天空 tiān kōng', '草地 cǎo dì', '道路 dào lù'],
};

// 获取词汇列表
export function getVocabulary(theme: string): VocabularyEntry[] {
  const vocabTheme = THEME_VOCABULARY[theme] || DEFAULT_VOCABULARY;

  const entries: VocabularyEntry[] = [];

  // 解析词汇字符串 "拼音 汉字" 或 "汉字 pinyin"
  function parseVocabItem(item: string, category: 'core' | 'items' | 'env'): VocabularyEntry {
    // 匹配格式：可能是 "pinyin hanzi" 或 "hanzi pinyin"
    const parts = item.trim().split(/\s+/);
    if (parts.length === 2) {
      // 检测哪个是拼音（包含小写字母）和汉字
      const hasPinyin1 = /[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(parts[0]);
      const hasPinyin2 = /[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(parts[1]);

      if (hasPinyin1 && !hasPinyin2) {
        return { category, pinyin: parts[0], hanzi: parts[1] };
      } else if (!hasPinyin1 && hasPinyin2) {
        return { category, pinyin: parts[1], hanzi: parts[0] };
      }
    }
    // 默认格式
    return { category, pinyin: parts[0] || '', hanzi: parts[1] || parts[0] || '' };
  }

  vocabTheme.core.forEach(item => entries.push(parseVocabItem(item, 'core')));
  vocabTheme.items.forEach(item => entries.push(parseVocabItem(item, 'items')));
  vocabTheme.env.forEach(item => entries.push(parseVocabItem(item, 'env')));

  return entries;
}

// 获取所有可用主题
export function getAvailableThemes(): string[] {
  return Object.keys(THEME_VOCABULARY);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/vocabulary.ts
git commit -m "feat: add vocabulary library with preset themes"
```

---

## Task 5: 创建 Prompt 模板生成器

- [ ] **Step 1: 创建 src/lib/prompt.ts**

```ts
import type { VocabularyEntry } from '@/types';

const PROMPT_TEMPLATE = `请生成一张儿童识字小报《{{theme}}》，竖版 A4，学习小报版式，适合 5–9 岁孩子 认字与看图识物。

# 一、小报标题区（顶部）

**顶部居中大标题**：《{{title}}》
* **风格**：十字小报 / 儿童学习报感
* **文本要求**：大字、醒目、卡通手写体、彩色描边
* **装饰**：周围添加与 {{theme}} 相关的贴纸风装饰，颜色鲜艳

# 二、小报主体（中间主画面）

画面中心是一幅 **卡通插画风的「{{theme}}」场景**：
* **整体气氛**：明亮、温暖、积极
* **构图**：物体边界清晰，方便对应文字，不要过于拥挤。

**场景分区与核心内容**
1.  **核心区域 A（主要对象）**：表现 {{theme}} 的核心活动。
2.  **核心区域 B（配套设施）**：展示相关的工具或物品。
3.  **核心区域 C（环境背景）**：体现环境特征（如墙面、指示牌等）。

**主题人物**
* **角色**：1 位可爱卡通人物（职业/身份：与 {{theme}} 匹配）。
* **动作**：正在进行与场景相关的自然互动。

# 三、必画物体与识字清单

**请务必在画面中清晰绘制以下物体，并为其预留贴标签的位置：**

**1. 核心角色与设施：**
{{core_items}}

**2. 常见物品/工具：**
{{common_items}}

**3. 环境与装饰：**
{{env_items}}

*(注意：画面中的物体数量不限于此，但以上列表必须作为重点描绘对象)*

# 四、识字标注规则

对上述清单中的物体，贴上中文识字标签：
* **格式**：两行制（第一行拼音带声调，第二行简体汉字）。
* **样式**：彩色小贴纸风格，白底黑字或深色字，清晰可读。
* **排版**：标签靠近对应的物体，不遮挡主体。

# 五、画风参数
* **风格**：儿童绘本风 + 识字小报风
* **色彩**：高饱和、明快、温暖 (High Saturation, Warm Tone)
* **质量**：4k resolution, high detail, vector illustration style, clean lines.`;

export function generatePrompt(
  theme: string,
  title: string,
  vocabulary: VocabularyEntry[]
): string {
  const coreItems = vocabulary
    .filter(v => v.category === 'core')
    .map(v => `${v.pinyin} ${v.hanzi}`)
    .join(', ');

  const commonItems = vocabulary
    .filter(v => v.category === 'items')
    .map(v => `${v.pinyin} ${v.hanzi}`)
    .join(', ');

  const envItems = vocabulary
    .filter(v => v.category === 'env')
    .map(v => `${v.pinyin} ${v.hanzi}`)
    .join(', ');

  return PROMPT_TEMPLATE
    .replace(/\{\{theme\}\}/g, theme)
    .replace(/\{\{title\}\}/g, title)
    .replace(/\{\{core_items\}\}/g, coreItems)
    .replace(/\{\{common_items\}\}/g, commonItems)
    .replace(/\{\{env_items\}\}/g, envItems);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/prompt.ts
git commit -m "feat: add prompt template generator"
```

---

## Task 6: 创建 Nano Banana API 封装

- [ ] **Step 1: 创建 src/lib/nanoBananaApi.ts**

```ts
import type { CreateTaskRequest, CreateTaskResponse, TaskDetailResponse } from '@/types';
import { CONFIG } from './config';

const API_BASE = CONFIG.apiUrl;

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CONFIG.apiKey}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function createGenerationTask(prompt: string): Promise<string> {
  const payload: CreateTaskRequest = {
    model: CONFIG.model,
    input: {
      prompt,
      aspect_ratio: CONFIG.aspectRatio,
      resolution: CONFIG.resolution,
      output_format: CONFIG.outputFormat,
    },
  };

  const response = await apiRequest<CreateTaskResponse>(
    '/api/v1/jobs/createTask',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  if (response.code !== 200) {
    throw new Error(`Failed to create task: code ${response.code}`);
  }

  return response.data.taskId;
}

export async function getTaskDetail(taskId: string): Promise<TaskDetailResponse['data']> {
  const response = await apiRequest<TaskDetailResponse>(
    `/api/v1/jobs/getTaskDetail?taskId=${taskId}`
  );

  if (response.code !== 200) {
    throw new Error(`Failed to get task detail: code ${response.code}`);
  }

  return response.data;
}

export async function pollTaskCompletion(
  taskId: string,
  onProgress?: (status: string) => void
): Promise<string> {
  const startTime = Date.now();

  while (Date.now() - startTime < CONFIG.maxPollTime) {
    const detail = await getTaskDetail(taskId);

    if (onProgress) {
      onProgress(detail.status);
    }

    if (detail.status === 'completed') {
      if (!detail.result?.imageUrl) {
        throw new Error('Task completed but no image URL returned');
      }
      return detail.result.imageUrl;
    }

    if (detail.status === 'failed') {
      throw new Error('Task generation failed');
    }

    // 等待后重试
    await new Promise(resolve => setTimeout(resolve, CONFIG.pollInterval));
  }

  throw new Error('Task polling timeout');
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/nanoBananaApi.ts
git commit -m "feat: add Nano Banana API wrapper"
```

---

## Task 7: 创建 localStorage 封装

- [ ] **Step 1: 创建 src/lib/storage.ts**

```ts
import type { HistoryItem } from '@/types';
import { CONFIG } from './config';

const STORAGE_KEY = CONFIG.STORAGE_KEY;

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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/storage.ts
git commit -m "feat: add localStorage wrapper for history"
```

---

## Task 8: 创建 API 路由代理

- [ ] **Step 1: 创建 src/app/api/generate/route.ts**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createGenerationTask, pollTaskCompletion } from '@/lib/nanoBananaApi';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt' },
        { status: 400 }
      );
    }

    // 创建生成任务
    const taskId = await createGenerationTask(prompt);

    // 返回任务 ID，客户端将轮询结果
    return NextResponse.json({
      code: 200,
      data: { taskId }
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

- [ ] **Step 2: 创建 src/app/api/poll/route.ts**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getTaskDetail } from '@/lib/nanoBananaApi';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Missing taskId' },
        { status: 400 }
      );
    }

    const detail = await getTaskDetail(taskId);

    return NextResponse.json({
      code: 200,
      data: detail
    });

  } catch (error) {
    console.error('Poll API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { code: 500, error: errorMessage },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/generate/route.ts src/app/api/poll/route.ts
git commit -m "feat: add API routes for generate and poll"
```

---

## Task 9: 创建 Header 组件

- [ ] **Step 1: 创建 src/components/Header.tsx**

```tsx
'use client';

interface HeaderProps {
  onOpenHistory: () => void;
  historyCount: number;
}

export default function Header({ onOpenHistory, historyCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎨</span>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            儿童识字小报生成器
          </h1>
        </div>

        <button
          onClick={onOpenHistory}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
        >
          <span className="text-lg">📚</span>
          <span className="hidden sm:inline">历史记录</span>
          {historyCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-secondary text-white">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat: add Header component"
```

---

## Task 10: 创建 VocabularyCard 组件

- [ ] **Step 1: 创建 src/components/VocabularyCard.tsx**

```tsx
'use client';

import type { VocabularyEntry } from '@/types';

interface VocabularyCardProps {
  entry: VocabularyEntry;
}

const categoryNames = {
  core: '核心角色',
  items: '常见物品',
  env: '环境装饰',
};

const categoryColors = {
  core: 'bg-pink-100 text-pink-700 border-pink-200',
  items: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  env: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

export default function VocabularyCard({ entry }: VocabularyCardProps) {
  return (
    <div className="inline-flex flex-col items-center p-3 m-2 rounded-xl border-2 bg-white shadow-sm hover:shadow-md transition-shadow">
      <span className={`text-xs px-2 py-1 rounded-full mb-2 ${categoryColors[entry.category]}`}>
        {categoryNames[entry.category]}
      </span>
      <span className="text-lg font-bold text-gray-800">{entry.pinyin}</span>
      <span className="text-2xl font-bold text-primary mt-1">{entry.hanzi}</span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/VocabularyCard.tsx
git commit -m "feat: add VocabularyCard component"
```

---

## Task 11: 创建 InputStep 组件

- [ ] **Step 1: 创建 src/components/InputStep.tsx**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/InputStep.tsx
git commit -m "feat: add InputStep component"
```

---

## Task 12: 创建 PreviewStep 组件

- [ ] **Step 1: 创建 src/components/PreviewStep.tsx**

```tsx
'use client';

import { useState } from 'react';
import VocabularyCard from './VocabularyCard';
import type { VocabularyEntry } from '@/types';

interface PreviewStepProps {
  theme: string;
  title: string;
  vocabulary: VocabularyEntry[];
  prompt: string;
  onConfirm: () => void;
  onBack: () => void;
}

export default function PreviewStep({
  theme,
  title,
  vocabulary,
  prompt,
  onConfirm,
  onBack,
}: PreviewStepProps) {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-center">
          《{title}》- {theme}
        </h2>

        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          将包含 {vocabulary.length} 个词汇 📚
        </h3>

        <div className="flex flex-wrap justify-center gap-2">
          {vocabulary.map((item, index) => (
            <VocabularyCard key={index} entry={item} />
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="text-sm text-gray-500 hover:text-primary transition-colors"
          >
            {showPrompt ? '隐藏' : '查看'}完整 Prompt ▼
          </button>

          {showPrompt && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {prompt}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="btn-secondary flex-1">
          ← 返回修改
        </button>
        <button onClick={onConfirm} className="btn-primary flex-1">
          开始生成 ✨
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PreviewStep.tsx
git commit -m "feat: add PreviewStep component"
```

---

## Task 13: 创建 GeneratingStep 组件

- [ ] **Step 1: 创建 src/components/GeneratingStep.tsx**

```tsx
'use client';

interface GeneratingStepProps {
  progress: number;
}

export default function GeneratingStep({ progress }: GeneratingStepProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-32 h-32 mb-8">
        {/* 跳动的太阳动画 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-7xl"
            style={{
              animation: 'bounce 1s ease-in-out infinite',
            }}
          >
            ☀️
          </span>
        </div>
        {/* 光芒旋转 */}
        <div
          className="absolute inset-0 border-4 border-dashed border-yellow-300 rounded-full"
          style={{
            animation: 'spin 3s linear infinite',
          }}
        />
      </div>

      <h2 className="text-2xl font-bold text-gray-700 mb-2">
        正在绘制中...
      </h2>
      <p className="text-gray-500 mb-6">
        AI 正在精心创作，请稍候
      </p>

      {/* 进度条 */}
      <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-sm text-gray-400 mt-3">
        预计等待 30-60 秒
      </p>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GeneratingStep.tsx
git commit -m "feat: add GeneratingStep component"
```

---

## Task 14: 创建 ResultStep 组件

- [ ] **Step 1: 创建 src/components/ResultStep.tsx**

```tsx
'use client';

import { useState } from 'react';
import type { HistoryItem } from '@/types';

interface ResultStepProps {
  theme: string;
  title: string;
  prompt: string;
  imageUrl: string;
  onSave: (item: HistoryItem) => void;
  onReset: () => void;
}

export default function ResultStep({
  theme,
  title,
  prompt,
  imageUrl,
  onSave,
  onReset,
}: ResultStepProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}_${theme}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    const item: HistoryItem = {
      id: Date.now().toString(),
      theme,
      title,
      prompt,
      imageUrl,
      createdAt: new Date().toISOString(),
    };
    onSave(item);
    setTimeout(() => setIsSaving(false), 500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">
          🎉 生成完成！
        </h2>

        <div className="flex justify-center mb-6">
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full h-auto rounded-xl shadow-lg"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={handleDownload} className="btn-primary">
            下载图片 ⬇️
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-secondary"
          >
            {isSaving ? '已保存 ✓' : '保存到历史 📚'}
          </button>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button onClick={onReset} className="text-gray-500 hover:text-primary transition-colors">
          再生成一张 →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ResultStep.tsx
git commit -m "feat: add ResultStep component"
```

---

## Task 15: 创建 HistoryModal 组件

- [ ] **Step 1: 创建 src/components/HistoryModal.tsx**

```tsx
'use client';

import type { HistoryItem } from '@/types';

interface HistoryModalProps {
  isOpen: boolean;
  items: HistoryItem[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onSelect: (item: HistoryItem) => void;
}

export default function HistoryModal({
  isOpen,
  items,
  onClose,
  onDelete,
  onClear,
  onSelect,
}: HistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-700">📚 历史记录</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-4">📭</p>
              <p>暂无历史记录</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="card p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onSelect(item)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-bold text-gray-700">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.theme}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(item.createdAt).toLocaleString('zh-CN')}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="mt-2 text-sm text-red-400 hover:text-red-600"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={onClear}
              className="w-full py-2 text-red-400 hover:text-red-600 transition-colors"
            >
              清空历史记录
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/HistoryModal.tsx
git commit -m "feat: add HistoryModal component"
```

---

## Task 16: 创建主页面（整合所有组件）

- [ ] **Step 1: 创建 src/app/page.tsx**

```tsx
'use client';

import { useState, useEffect } from 'react';
import type { AppStep, HistoryItem } from '@/types';
import { getVocabulary } from '@/lib/vocabulary';
import { generatePrompt } from '@/lib/prompt';
import { addHistoryItem, deleteHistoryItem, clearHistory } from '@/lib/storage';
import Header from '@/components/Header';
import InputStep from '@/components/InputStep';
import PreviewStep from '@/components/PreviewStep';
import GeneratingStep from '@/components/GeneratingStep';
import ResultStep from '@/components/ResultStep';
import HistoryModal from '@/components/HistoryModal';

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<AppStep>('input');
  const [theme, setTheme] = useState('');
  const [title, setTitle] = useState('');
  const [vocabulary, setVocabulary] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [taskId, setTaskId] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 加载历史记录
  useEffect(() => {
    setHistory(addHistoryItem as any);
    // 实际加载
    const loadHistoryData = async () => {
      const { loadHistory } = await import('@/lib/storage');
      setHistory(loadHistory());
    };
    loadHistoryData();
  }, []);

  // 处理输入提交
  const handleInputSubmit = (selectedTheme: string, selectedTitle: string) => {
    setTheme(selectedTheme);
    setTitle(selectedTitle);
    const vocab = getVocabulary(selectedTheme);
    setVocabulary(vocab);
    const generatedPrompt = generatePrompt(selectedTheme, selectedTitle, vocab);
    setPrompt(generatedPrompt);
    setCurrentStep('preview');
  };

  // 确认生成
  const handleConfirmGenerate = async () => {
    setCurrentStep('generating');
    setProgress(0);
    setError('');

    try {
      // 调用 API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.code !== 200) {
        throw new Error(data.error || '创建任务失败');
      }

      const newTaskId = data.data.taskId;
      setTaskId(newTaskId);

      // 轮询结果
      pollForResult(newTaskId);

    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
      setCurrentStep('input');
    }
  };

  // 轮询任务结果
  const pollForResult = async (id: string) => {
    let currentProgress = 10;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/poll?taskId=${id}`);
        const data = await response.json();

        if (data.code === 200) {
          const { status, result } = data.data;

          // 更新进度
          if (status === 'pending') {
            setProgress(Math.min(currentProgress + 5, 30));
          } else if (status === 'processing') {
            setProgress(Math.min(currentProgress + 10, 80));
            currentProgress = Math.min(currentProgress + 10, 80);
          }

          if (status === 'completed' && result?.imageUrl) {
            clearInterval(interval);
            setResultUrl(result.imageUrl);
            setCurrentStep('result');
            setProgress(100);
          }

          if (status === 'failed') {
            clearInterval(interval);
            setError('图片生成失败，请重试');
            setCurrentStep('input');
          }
        }
      } catch (err) {
        clearInterval(interval);
        setError('获取结果失败，请重试');
        setCurrentStep('input');
      }
    }, 2000);
  };

  // 保存到历史
  const handleSaveToHistory = (item: HistoryItem) => {
    addHistoryItem(item);
    setHistory(prev => [item, ...prev].slice(0, 50));
  };

  // 删除历史记录
  const handleDeleteHistory = (id: string) => {
    deleteHistoryItem(id);
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  // 清空历史
  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  // 选择历史记录
  const handleSelectHistory = (item: HistoryItem) => {
    setResultUrl(item.imageUrl);
    setTheme(item.theme);
    setTitle(item.title);
    setPrompt(item.prompt);
    setShowHistory(false);
    setCurrentStep('result');
  };

  // 重置
  const handleReset = () => {
    setCurrentStep('input');
    setTheme('');
    setTitle('');
    setVocabulary([]);
    setPrompt('');
    setTaskId('');
    setResultUrl('');
    setProgress(0);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onOpenHistory={() => setShowHistory(true)}
        historyCount={history.length}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {currentStep === 'input' && (
          <InputStep onSubmit={handleInputSubmit} />
        )}

        {currentStep === 'preview' && (
          <PreviewStep
            theme={theme}
            title={title}
            vocabulary={vocabulary}
            prompt={prompt}
            onConfirm={handleConfirmGenerate}
            onBack={handleReset}
          />
        )}

        {currentStep === 'generating' && (
          <GeneratingStep progress={progress} />
        )}

        {currentStep === 'result' && resultUrl && (
          <ResultStep
            theme={theme}
            title={title}
            prompt={prompt}
            imageUrl={resultUrl}
            onSave={handleSaveToHistory}
            onReset={handleReset}
          />
        )}
      </main>

      <HistoryModal
        isOpen={showHistory}
        items={history}
        onClose={() => setShowHistory(false)}
        onDelete={handleDeleteHistory}
        onClear={handleClearHistory}
        onSelect={handleSelectHistory}
      />
    </div>
  );
}
```

- [ ] **Step 2: 创建 src/app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '儿童识字小报生成器',
  description: 'AI 驱动的儿童识字小报生成工具',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "feat: add main page with all components integrated"
```

---

## Task 17: 最终测试和验证

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev`

- [ ] **Step 2: 验证基础流程**

1. 打开 http://localhost:3000
2. 选择"超市"主题，输入标题"快乐购物"
3. 点击"下一步"
4. 检查预览页面的词汇展示
5. 点击"开始生成"
6. 等待生成完成
7. 验证图片显示
8. 点击"下载图片"
9. 点击"保存到历史"

- [ ] **Step 3: 验证历史记录功能**

1. 点击顶部"历史记录"按钮
2. 检查历史记录是否显示
3. 点击删除按钮
4. 点击"清空历史记录"

- [ ] **Step 4: 验证自定义主题**

1. 输入自定义主题如"图书馆"
2. 验证默认词汇是否正确展示

- [ ] **Step 5: 构建测试**

Run: `npm run build`

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: complete literacy news generator application"
```

---

## 完成清单

- [ ] 所有组件已创建
- [ ] API 路由正常工作
- [ ] localStorage 功能正常
- [ ] 图片下载功能正常
- [ ] 历史记录功能正常
- [ ] 构建成功，无错误
- [ ] 所有 TypeScript 类型正确
- [ ] UI 样式符合预期

---

## 部署说明

1. **Vercel 部署**:
   ```bash
   npm install -g vercel
   vercel
   ```

2. **环境变量设置**:
   在 Vercel 控制台添加:
   - `KIE_AI_API_KEY`: 你的 API Key

3. **自定义域名**:
   在 Vercel 项目设置中添加自定义域名
