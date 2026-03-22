# 儿童识字小报生成器 - 设计文档

**日期**: 2026-03-22
**状态**: 设计阶段

## 1. 项目概述

### 1.1 目标
构建一个公开网站，供家长和老师输入主题和标题，自动生成儿童识字小报图片。

### 1.2 核心功能
- 用户输入主题/场景和标题
- 从预置词库匹配词汇
- 生成 AI 绘图提示词并预览
- 调用 Nano Banana 2 API 生成图片
- 展示结果并支持下载
- 本地存储历史记录

### 1.3 技术选型
- **框架**: Next.js (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React useState
- **存储**: localStorage
- **API**: Nano Banana 2 (kie.ai)

---

## 2. 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js App                             │
├─────────────────────────────────────────────────────────────────┤
│  pages/index.tsx - 单页组件，state 控制步骤切换                  │
│                                                                  │
│  步骤组件:                                                       │
│  • InputStep - 用户输入                                          │
│  • PreviewPromptStep - 预览 prompt 和词汇                        │
│  • GeneratingStep - 生成进度                                     │
│  • ResultStep - 结果展示                                         │
│                                                                  │
│  工具库 (lib/):                                                  │
│  • generatePrompt.ts - 填充模板                                  │
│  • vocabulary.ts - 预置词库                                      │
│  • nanoBananaApi.ts - API 封装                                  │
│  • storage.ts - localStorage 封装                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 数据模型

### 3.1 应用状态

```typescript
interface AppState {
  currentStep: 'input' | 'preview' | 'generating' | 'result';
  theme: string;
  title: string;
  vocabulary: VocabularyEntry[];
  generatedPrompt: string;
  taskId: string | null;
  resultUrl: string | null;
  error: string | null;
}

interface VocabularyEntry {
  category: 'core' | 'items' | 'env';
  pinyin: string;
  hanzi: string;
}

interface HistoryItem {
  id: string;
  theme: string;
  title: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
}
```

### 3.2 API 响应

```typescript
interface CreateTaskResponse {
  code: number;
  data: {
    taskId: string;
  };
}

interface TaskDetailResponse {
  code: number;
  data: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: {
      imageUrl: string;
    };
  };
}
```

---

## 4. 用户流程

```
1. 输入阶段
   用户选择主题（或自定义）+ 输入标题
   → 点击"下一步"

2. 预览阶段
   展示将包含的词汇列表
   展示生成的 prompt（可折叠查看）
   → 点击"开始生成"

3. 生成阶段
   调用 API 创建任务
   轮询任务状态
   显示加载动画

4. 结果阶段
   展示生成的图片
   提供下载按钮
   保存到历史记录
   → 可选择"再生成"或"返回首页"
```

---

## 5. API 集成

### 5.1 端点

```typescript
// 通过 Next.js API Route 代理
POST /api/generate

// 直接调用 kie.ai
POST https://api.kie.ai/api/v1/jobs/createTask
GET https://api.kie.ai/api/v1/jobs/getTaskDetail?taskId={taskId}
```

### 5.2 请求参数

```typescript
{
  model: "nano-banana-2",
  input: {
    prompt: string,      // 最大 20000 字符
    aspect_ratio: "3:4", // A4 竖版
    resolution: "4K",
    output_format: "png"
  }
}
```

### 5.3 错误处理

| 错误码 | 处理方式 |
|--------|----------|
| 401    | 提示检查 API Key 配置 |
| 402    | 提示账户余额问题 |
| 422    | 提示检查输入内容 |
| 501    | 允许重新尝试 |
| 网络超时 | 显示重试按钮 |

---

## 6. 词库设计

### 6.1 数据结构

```typescript
interface VocabularyTheme {
  core: string[];   // 核心角色与设施 (3-5个)
  items: string[];  // 常见物品 (5-8个)
  env: string[];    // 环境与装饰 (3-5个)
}
```

### 6.2 预置主题

- 超市: 收银台、货架、购物车、苹果、牛奶、面包...
- 医院: 医生、护士、病床、听诊器、体温表...
- 公园: 滑梯、秋千、跷跷板、花朵、大树...
- 学校: 老师、黑板、课桌、书本、铅笔...
- 动物园: 长颈鹿、大象、猴子、笼子、标牌...

### 6.3 自定义主题

使用默认通用词汇，用户可后续扩展。

---

## 7. UI 设计

### 7.1 颜色方案

```typescript
const colors = {
  primary: "#FF6B9D",      // 粉色 - 主按钮
  secondary: "#4ECDC4",    // 青色 - 次要元素
  accent: "#FFE66D",       // 黄色 - 强调
  background: "#FFF5F8",   // 浅粉背景
  surface: "#FFFFFF",      // 卡片背景
  text: "#2D3436",         // 深灰文字
};
```

### 7.2 组件规范

- **按钮**: 大圆角 (rounded-2xl)、阴影、hover 弹跳
- **卡片**: 白色背景、柔和阴影、圆角
- **输入框**: 大字体、清晰边框、focus 边框变色
- **加载**: 可爱动画（跳动的小太阳）

---

## 8. 配置

### 8.1 环境变量

```bash
# .env.local
KIE_AI_API_KEY=your_api_key_here
KIE_AI_API_URL=https://api.kie.ai
```

### 8.2 应用配置

```typescript
export const CONFIG = {
  model: "nano-banana-2",
  aspectRatio: "3:4",
  resolution: "4K",
  outputFormat: "png",
  pollInterval: 2000,
  maxPollTime: 120000,
  STORAGE_KEY: "literacy_news_history",
  MAX_HISTORY: 50
};
```

---

## 9. 文件结构

```
names-pictures/
├── ai-docs/                    # 已有文档
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-03-22-literacy-news-generator-design.md
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── InputStep.tsx
│   │   ├── PreviewStep.tsx
│   │   ├── GeneratingStep.tsx
│   │   ├── ResultStep.tsx
│   │   ├── Header.tsx
│   │   └── HistoryModal.tsx
│   ├── lib/
│   │   ├── config.ts
│   │   ├── vocabulary.ts
│   │   ├── prompt.ts
│   │   ├── nanoBananaApi.ts
│   │   └── storage.ts
│   └── types/
│       └── index.ts
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 10. 安全考虑

- API Key 存储在服务端环境变量，不暴露给客户端
- 所有 API 调用通过 Next.js API Routes 代理
- 用户输入验证，防止注入攻击
- localStorage 数据仅存必要信息

---

## 11. 部署

- **平台**: Vercel
- **环境变量**: 在 Vercel 控制台配置 `KIE_AI_API_KEY`
- **域名**: 可选配置自定义域名
