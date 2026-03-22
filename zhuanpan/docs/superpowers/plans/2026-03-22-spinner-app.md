# 自定义转盘应用实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个支持高度自定义、纯前端运行的转盘应用，可导出为单文件 HTML

**Architecture:** React 18 + TypeScript + Vite，Canvas 绘制转盘，GSAP 驱动动画，localStorage 持久化，运行时生成单文件

**Tech Stack:** React 18, TypeScript, Vite, Canvas 2D API, GSAP, CSS Modules

---

## Phase 1: 项目初始化

### Task 1.1: 创建 Vite + React + TypeScript 项目

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `.gitignore`

- [ ] **Step 1: 初始化项目**

```bash
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 2: 安装依赖**

```bash
npm install gsap
npm install --save-dev @types/node
```

- [ ] **Step 3: 验证项目运行**

```bash
npm run dev
```

Expected: 开发服务器启动，访问 http://localhost:5173 显示 React 模板页面

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: initialize Vite React TypeScript project"
```

### Task 1.2: 配置路径别名和基础设置

**Files:**
- Modify: `vite.config.ts`
- Modify: `tsconfig.json`

- [ ] **Step 1: 配置 Vite 路径别名**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@types': path.resolve(__dirname, './src/types'),
    }
  }
})
```

- [ ] **Step 2: 配置 TypeScript 路径**

```json
// tsconfig.json - 添加 compilerOptions.paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@lib/*": ["./src/lib/*"],
      "@types/*": ["./src/types/*"]
    }
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add vite.config.ts tsconfig.json
git commit -m "chore: configure path aliases"
```

---

## Phase 2: 类型定义

### Task 2.1: 创建核心类型定义

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
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
```

- [ ] **Step 2: 提交**

```bash
git add src/types/index.ts
git commit -m "feat: add core type definitions"
```

---

## Phase 3: 主题系统

### Task 3.1: 创建主题定义和颜色分配

**Files:**
- Create: `src/lib/themes.ts`

- [ ] **Step 1: 创建主题库**

```typescript
// src/lib/themes.ts
import { Theme, ThemeId, Option } from '@/types';

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
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/themes.ts
git commit -m "feat: add theme system with color palettes"
```

### Task 3.2: 创建全局 CSS 样式

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: 创建全局样式**

```css
/* src/styles/global.css */
:root {
  --wheel-size: min(80vw, 400px);
  --primary-color: #6c5ce7;
  --bg-color: #f8f9fa;
  --text-color: #2d3436;
  --border-radius: 12px;
  --transition: all 0.2s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

/* 主题变体 */
[data-theme="morandi"] {
  --bg-color: #E8ECEF;
  --text-color: #495057;
}

[data-theme="minimal"] {
  --bg-color: #F8F9FA;
  --text-color: #2D3436;
}

[data-theme="pastel"] {
  --bg-color: #FFF5F7;
  --text-color: #4A4A4A;
}

[data-theme="warm"] {
  --bg-color: #FFF9F0;
  --text-color: #2D3436;
}
```

- [ ] **Step 2: 在 main.tsx 中引入**

```typescript
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 3: 提交**

```bash
git add src/styles/global.css src/main.tsx
git commit -m "feat: add global CSS with theme variables"
```

---

## Phase 4: Hooks 实现

### Task 4.1: 创建 useLocalStorage Hook

**Files:**
- Create: `src/hooks/useLocalStorage.ts`

- [ ] **Step 1: 创建 useLocalStorage hook**

```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue] as const;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/hooks/useLocalStorage.ts
git commit -m "feat: add useLocalStorage hook"
```

### Task 4.2: 创建转盘计算工具函数

**Files:**
- Create: `src/lib/spinner.ts`

- [ ] **Step 1: 创建转盘计算函数**

```typescript
// src/lib/spinner.ts
import { Option, Segment } from '@/types';

export function calculateArcs(options: Option[]): Segment[] {
  const totalWeight = options.reduce((sum, o) => sum + o.weight, 0);
  let accumulatedAngle = 0;

  return options.map(opt => {
    const arcSize = (opt.weight / totalWeight) * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + arcSize;
    const midAngle = startAngle + arcSize / 2;

    accumulatedAngle = endAngle;

    return {
      id: opt.id,
      name: opt.name,
      color: opt.color,
      startAngle,
      endAngle,
      midAngle
    };
  });
}

export function getRandomByWeight(options: Option[]): Option {
  const totalWeight = options.reduce((sum, o) => sum + o.weight, 0);
  let random = Math.random() * totalWeight;
  for (const opt of options) {
    random -= opt.weight;
    if (random <= 0) return opt;
  }
  return options[0];
}

export function calculateTargetAngle(result: Option, options: Option[]): number {
  const arcs = calculateArcs(options);
  const resultArc = arcs.find(a => a.id === result.id);
  if (!resultArc) return 0;

  const midAngle = resultArc.midAngle;
  // 指针固定在顶部（-90度），多转5圈
  return 360 * 5 + (360 - midAngle - 90);
}

export function canStartPlay(options: Option[]): boolean {
  return options.length >= 2 &&
         options.every(o => o.name.trim() !== '' && o.weight > 0);
}
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/spinner.ts
git commit -m "feat: add spinner calculation utilities"
```

### Task 4.3: 创建 useSpinner Hook

**Files:**
- Create: `src/hooks/useSpinner.ts`

- [ ] **Step 1: 创建 useSpinner hook**

```typescript
// src/hooks/useSpinner.ts
import { useState, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { Option } from '@/types';
import { calculateArcs, getRandomByWeight, calculateTargetAngle, canStartPlay } from '@/lib/spinner';

export function useSpinner(options: Option[]) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);

  const spin = useCallback(async () => {
    if (!canStartPlay(options) || isSpinning) return null;

    setIsSpinning(true);
    const result = getRandomByWeight(options);
    const targetRotation = calculateTargetAngle(result, options);

    return new Promise<Option>((resolve) => {
      gsap.to(rotationRef, {
        current: targetRotation,
        duration: 4,
        ease: 'power2.out',
        onUpdate: () => {
          // 触发 Canvas 重绘
          if (canvasRef.current) {
            drawSpinner(canvasRef.current, options, rotationRef.current);
          }
        },
        onComplete: () => {
          setIsSpinning(false);
          setLastResult(result.name);
          resolve(result);
        }
      });
    });
  }, [options, isSpinning]);

  return {
    isSpinning,
    lastResult,
    canvasRef,
    spin,
    canStartPlay: canStartPlay(options)
  };
}

// Canvas 绘制函数（将在 SpinnerCanvas 组件中使用）
function drawSpinner(
  canvas: HTMLCanvasElement,
  options: Option[],
  rotation: number
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const segments = calculateArcs(options);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 10;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate((rotation * Math.PI) / 180);

  segments.forEach(seg => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius,
      (seg.startAngle * Math.PI) / 180,
      (seg.endAngle * Math.PI) / 180
    );
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();

    // 绘制文字
    ctx.save();
    ctx.rotate((seg.midAngle * Math.PI) / 180);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(seg.name, radius * 0.65, 0);
    ctx.restore();
  });

  ctx.restore();

  // 绘制指针（固定在顶部）
  ctx.beginPath();
  ctx.moveTo(centerX, 10);
  ctx.lineTo(centerX - 10, 30);
  ctx.lineTo(centerX + 10, 30);
  ctx.closePath();
  ctx.fillStyle = '#2D3436';
  ctx.fill();
}
```

- [ ] **Step 2: 提交**

```bash
git add src/hooks/useSpinner.ts
git commit -m "feat: add useSpinner hook with GSAP animation"
```

### Task 4.4: 创建 useSound Hook

**Files:**
- Create: `src/hooks/useSound.ts`

- [ ] **Step 1: 创建 useSound hook**

```typescript
// src/hooks/useSound.ts
import { useState, useRef, useEffect } from 'react';

export function useSound(enabled: boolean) {
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (enabled) {
      spinSoundRef.current = new Audio('/spin.mp3');
      winSoundRef.current = new Audio('/win.mp3');
      spinSoundRef.current.loop = true;

      return () => {
        spinSoundRef.current?.pause();
        winSoundRef.current?.pause();
      };
    }
  }, [enabled]);

  const playSpin = () => {
    if (enabled && spinSoundRef.current) {
      spinSoundRef.current.currentTime = 0;
      spinSoundRef.current.play().catch(() => {});
    }
  };

  const stopSpin = () => {
    if (spinSoundRef.current) {
      spinSoundRef.current.pause();
    }
  };

  const playWin = () => {
    stopSpin();
    if (enabled && winSoundRef.current) {
      winSoundRef.current.currentTime = 0;
      winSoundRef.current.play().catch(() => {});
    }
  };

  return { playSpin, stopSpin, playWin };
}
```

- [ ] **Step 2: 提交**

```bash
git add src/hooks/useSound.ts
git commit -m "feat: add useSound hook for audio effects"
```

---

## Phase 5: 默认状态和初始化

### Task 5.1: 创建默认状态

**Files:**
- Create: `src/lib/defaults.ts`

- [ ] **Step 1: 创建默认状态**

```typescript
// src/lib/defaults.ts
import { AppState, Option } from '@/types';
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
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/defaults.ts
git commit -m "feat: add default app state"
```

---

## Phase 6: 组件实现

### Task 6.1: 创建 AppHeader 组件

**Files:**
- Create: `src/components/AppHeader.tsx`

- [ ] **Step 1: 创建 AppHeader 组件**

```typescript
// src/components/AppHeader.tsx
import React from 'react';

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header style={{
      textAlign: 'center',
      padding: '20px',
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      fontWeight: '600',
    }}>
      {title}
    </header>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/AppHeader.tsx
git commit -m "feat: add AppHeader component"
```

### Task 6.2: 创建 TitleInput 组件

**Files:**
- Create: `src/components/ConfigView/TitleInput.tsx`

- [ ] **Step 1: 创建 TitleInput 组件**

```typescript
// src/components/ConfigView/TitleInput.tsx
import React from 'react';

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TitleInput({ value, onChange }: TitleInputProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 20))}
        placeholder="今天决定点什么？"
        maxLength={20}
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '1.2rem',
          border: '2px solid #ddd',
          borderRadius: '12px',
          textAlign: 'center',
          outline: 'none',
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/ConfigView/TitleInput.tsx
git commit -m "feat: add TitleInput component"
```

### Task 6.3: 创建 OptionItem 组件

**Files:**
- Create: `src/components/ConfigView/OptionItem.tsx`

- [ ] **Step 1: 创建 OptionItem 组件**

```typescript
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
```

- [ ] **Step 2: 提交**

```bash
git add src/components/ConfigView/OptionItem.tsx
git commit -m "feat: add OptionItem component"
```

### Task 6.4: 创建 OptionList 组件

**Files:**
- Create: `src/components/ConfigView/OptionList.tsx`

- [ ] **Step 1: 创建 OptionList 组件**

```typescript
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
```

- [ ] **Step 2: 提交**

```bash
git add src/components/ConfigView/OptionList.tsx
git commit -m "feat: add OptionList component"
```

### Task 6.5: 创建 ThemeSelector 组件

**Files:**
- Create: `src/components/ConfigView/ThemeSelector.tsx`

- [ ] **Step 1: 创建 ThemeSelector 组件**

```typescript
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
```

- [ ] **Step 2: 提交**

```bash
git add src/components/ConfigView/ThemeSelector.tsx
git commit -m "feat: add ThemeSelector component"
```

### Task 6.6: 创建 ExportButton 组件

**Files:**
- Create: `src/components/ConfigView/ExportButton.tsx`

- [ ] **Step 1: 创建 ExportButton 组件**

```typescript
// src/components/ConfigView/ExportButton.tsx
import React from 'react';

interface ExportButtonProps {
  onExport: () => void;
}

export function ExportButton({ onExport }: ExportButtonProps) {
  return (
    <button
      onClick={onExport}
      style={{
        width: '100%',
        padding: '15px',
        background: '#6c5ce7',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      导出为 HTML
    </button>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/ConfigView/ExportButton.tsx
git commit -m "feat: add ExportButton component"
```

### Task 6.7: 创建 ConfigView 组件

**Files:**
- Create: `src/components/ConfigView/index.tsx`

- [ ] **Step 1: 创建 ConfigView 容器组件**

```typescript
// src/components/ConfigView/index.tsx
import React from 'react';
import { AppState } from '@/types';
import { TitleInput } from './TitleInput';
import { OptionList } from './OptionList';
import { ThemeSelector } from './ThemeSelector';
import { ExportButton } from './ExportButton';

interface ConfigViewProps {
  state: AppState;
  setState: (state: AppState | ((s: AppState) => AppState)) => void;
  onExport: () => void;
}

export function ConfigView({ state, setState, onExport }: ConfigViewProps) {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
    }}>
      <TitleInput
        value={state.title}
        onChange={(title) => setState({ ...state, title })}
      />
      <OptionList
        options={state.options}
        onChange={(options) => setState({ ...state, options })}
      />
      <ThemeSelector
        currentTheme={state.theme}
        onChange={(theme) => setState({ ...state, theme })}
      />
      <ExportButton onExport={onExport} />
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/ConfigView/index.tsx
git commit -m "feat: add ConfigView container component"
```

### Task 6.8: 创建 SpinnerCanvas 组件

**Files:**
- Create: `src/components/PlayView/SpinnerCanvas.tsx`

- [ ] **Step 1: 创建 SpinnerCanvas 组件**

```typescript
// src/components/PlayView/SpinnerCanvas.tsx
import React, { useEffect, useRef } from 'react';
import { Option } from '@/types';
import { calculateArcs } from '@/lib/spinner';

interface SpinnerCanvasProps {
  options: Option[];
  rotation: number;
  onCanvasRef: (ref: HTMLCanvasElement | null) => void;
}

export function SpinnerCanvas({ options, rotation, onCanvasRef }: SpinnerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    onCanvasRef(canvasRef.current);
  }, [onCanvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 Canvas 大小（支持 Retina）
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(window.innerWidth * 0.8, 400);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const segments = calculateArcs(options);
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    // 清除画布
    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);

    // 绘制扇形
    segments.forEach(seg => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius,
        (seg.startAngle * Math.PI) / 180,
        (seg.endAngle * Math.PI) / 180
      );
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 绘制文字
      ctx.save();
      ctx.rotate((seg.midAngle * Math.PI) / 180);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(seg.name, radius * 0.65, 0);
      ctx.restore();
    });

    ctx.restore();

    // 绘制指针（固定在顶部）
    ctx.beginPath();
    ctx.moveTo(centerX, 10);
    ctx.lineTo(centerX - 10, 35);
    ctx.lineTo(centerX + 10, 35);
    ctx.closePath();
    ctx.fillStyle = '#2D3436';
    ctx.fill();

  }, [options, rotation]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
      <canvas
        ref={canvasRef}
        style={{ borderRadius: '50%', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      />
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/PlayView/SpinnerCanvas.tsx
git commit -m "feat: add SpinnerCanvas component"
```

### Task 6.9: 创建 SpinButton 组件

**Files:**
- Create: `src/components/PlayView/SpinButton.tsx`

- [ ] **Step 1: 创建 SpinButton 组件**

```typescript
// src/components/PlayView/SpinButton.tsx
import React from 'react';

interface SpinButtonProps {
  isSpinning: boolean;
  canStart: boolean;
  onSpin: () => void;
}

export function SpinButton({ isSpinning, canStart, onSpin }: SpinButtonProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
      <button
        onClick={onSpin}
        disabled={isSpinning || !canStart}
        style={{
          padding: '15px 50px',
          fontSize: '1.2rem',
          fontWeight: '600',
          background: isSpinning || !canStart ? '#ccc' : '#6c5ce7',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          cursor: isSpinning || !canStart ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {isSpinning ? '转动中...' : '开始抽奖'}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/PlayView/SpinButton.tsx
git commit -m "feat: add SpinButton component"
```

### Task 6.10: 创建 ResultModal 组件

**Files:**
- Create: `src/components/PlayView/ResultModal.tsx`

- [ ] **Step 1: 创建 ResultModal 组件**

```typescript
// src/components/PlayView/ResultModal.tsx
import React from 'react';

interface ResultModalProps {
  result: string | null;
  onClose: () => void;
  onReplay: () => void;
}

export function ResultModal({ result, onClose, onReplay }: ResultModalProps) {
  if (!result) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        textAlign: 'center',
        animation: 'popIn 0.3s ease',
      }}>
        <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>🎉 结果</h2>
        <p style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#6c5ce7',
          marginBottom: '30px',
        }}>
          {result}
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={onReplay}
            style={{
              padding: '12px 25px',
              background: '#6c5ce7',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            再转一次
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 25px',
              background: '#ddd',
              color: '#333',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            关闭
          </button>
        </div>
      </div>
      <style>{`
        @keyframes popIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/PlayView/ResultModal.tsx
git commit -m "feat: add ResultModal component"
```

### Task 6.11: 创建 BackToEditButton 组件

**Files:**
- Create: `src/components/PlayView/BackToEditButton.tsx`

- [ ] **Step 1: 创建 BackToEditButton 组件**

```typescript
// src/components/PlayView/BackToEditButton.tsx
import React from 'react';

interface BackToEditButtonProps {
  onBack: () => void;
  isSpinning: boolean;
}

export function BackToEditButton({ onBack, isSpinning }: BackToEditButtonProps) {
  return (
    <button
      onClick={onBack}
      disabled={isSpinning}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '10px 15px',
        background: 'white',
        border: '2px solid #ddd',
        borderRadius: '10px',
        cursor: isSpinning ? 'not-allowed' : 'pointer',
        opacity: isSpinning ? 0.5 : 1,
        zIndex: 100,
      }}
    >
      ⚙️ 编辑
    </button>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/PlayView/BackToEditButton.tsx
git commit -m "feat: add BackToEditButton component"
```

### Task 6.12: 创建 PlayView 组件

**Files:**
- Create: `src/components/PlayView/index.tsx`

- [ ] **Step 1: 创建 PlayView 容器组件**

```typescript
// src/components/PlayView/index.tsx
import React, { useState, useEffect } from 'react';
import { AppState } from '@/types';
import { SpinnerCanvas } from './SpinnerCanvas';
import { SpinButton } from './SpinButton';
import { ResultModal } from './ResultModal';
import { BackToEditButton } from './BackToEditButton';
import { useSpinner } from '@/hooks/useSpinner';
import { useSound } from '@/hooks/useSound';
import { calculateArcs } from '@/lib/spinner';

interface PlayViewProps {
  state: AppState;
  setState: (state: AppState | ((s: AppState) => AppState)) => void;
  onBack: () => void;
}

export function PlayView({ state, setState, onBack }: PlayViewProps) {
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);

  const { isSpinning, lastResult, canvasRef, spin, canStartPlay } = useSpinner(state.options);
  const { playSpin, stopSpin, playWin } = useSound(state.soundEnabled);

  // 同步 canvas ref
  useEffect(() => {
    if (canvasEl && canvasRef.current !== canvasEl) {
      canvasRef.current = canvasEl;
    }
  }, [canvasEl, canvasRef]);

  const handleSpin = async () => {
    if (!canStartPlay || isSpinning) return;
    playSpin();
    const result = await spin();
    stopSpin();
    playWin();
    setShowResult(true);
  };

  const handleReplay = () => {
    setShowResult(false);
    handleSpin();
  };

  const handleCloseResult = () => {
    setShowResult(false);
  };

  // 计算 rotation 用于显示
  useEffect(() => {
    // 从 useSpinner 的 rotationRef 获取当前值
    const interval = setInterval(() => {
      // 这里需要从 useSpinner 暴露 rotation
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <BackToEditButton onBack={onBack} isSpinning={isSpinning} />

      <h1 style={{
        fontSize: 'clamp(1.5rem, 5vw, 3rem)',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        {state.title}
      </h1>

      <SpinnerCanvas
        options={state.options}
        rotation={rotation}
        onCanvasRef={setCanvasEl}
      />

      <SpinButton
        isSpinning={isSpinning}
        canStart={canStartPlay}
        onSpin={handleSpin}
      />

      {!canStartPlay && (
        <p style={{ color: '#ff6b6b', marginTop: '10px' }}>
          请确保至少有 2 个有效选项
        </p>
      )}

      <ResultModal
        result={showResult ? lastResult : null}
        onClose={handleCloseResult}
        onReplay={handleReplay}
      />
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/PlayView/index.tsx
git commit -m "feat: add PlayView container component"
```

---

## Phase 7: 单文件导出

### Task 7.1: 创建单文件导出器

**Files:**
- Create: `src/lib/exporter.ts`

- [ ] **Step 1: 创建导出器**

```typescript
// src/lib/exporter.ts
import { AppState } from '@/types';

export class SingleFileExporter {
  async export(state: AppState): Promise<void> {
    // 读取构建后的 HTML 模板
    const template = await this.loadTemplate();
    const injected = this.injectState(template, state);
    const embedded = await this.embedAssets(injected);

    // 下载文件
    const blob = new Blob([embedded], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `转盘-${state.title}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private async loadTemplate(): Promise<string> {
    const response = await fetch('/index.html');
    return await response.text();
  }

  private injectState(template: string, state: AppState): string {
    const stateScript = `<script>window.__INITIAL_STATE__=${JSON.stringify(state)}<\/script>`;
    return template.replace('</head>', stateScript + '</head>');
  }

  private async fileToBase64(path: string): Promise<string> {
    try {
      const response = await fetch(path);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn('Failed to load asset:', path);
      return '';
    }
  }

  private async embedAssets(html: string): Promise<string> {
    try {
      const spinBase64 = await this.fileToBase64('/spin.mp3');
      const winBase64 = await this.fileToBase64('/win.mp3');

      let result = html;
      if (spinBase64) {
        result = result.replace('src="/spin.mp3"', `src="${spinBase64}"`);
      }
      if (winBase64) {
        result = result.replace('src="/win.mp3"', `src="${winBase64}"`);
      }
      return result;
    } catch (e) {
      console.warn('Failed to embed assets:', e);
      return html;
    }
  }
}

export const exporter = new SingleFileExporter();
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/exporter.ts
git commit -m "feat: add single file exporter"
```

---

## Phase 8: 主应用组装

### Task 8.1: 创建 App 组件

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 实现 App 组件**

```typescript
// src/App.tsx
import React, { useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DEFAULT_STATE } from './lib/defaults';
import { assignOptionColors } from './lib/themes';
import { exporter } from './lib/exporter';
import { ConfigView } from './components/ConfigView';
import { PlayView } from './components/PlayView';
import type { AppState } from './types';

function App() {
  const [state, setState] = useLocalStorage<AppState>('spinner-state', DEFAULT_STATE);

  // 应用主题到 document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  // 处理选项颜色变化（当选项或主题变化时）
  useEffect(() => {
    setState(prev => ({
      ...prev,
      options: assignOptionColors(prev.options, prev.theme)
    }));
  }, [state.theme]);

  const handleExport = async () => {
    await exporter.export(state);
  };

  return (
    <div data-theme={state.theme}>
      {state.viewMode === 'edit' ? (
        <ConfigView
          state={state}
          setState={setState}
          onExport={handleExport}
        />
      ) : (
        <PlayView
          state={state}
          setState={setState}
          onBack={() => setState(prev => ({ ...prev, viewMode: 'edit' }))}
        />
      )}
    </div>
  );
}

export default App;
```

- [ ] **Step 2: 提交**

```bash
git add src/App.tsx
git commit -m "feat: implement App component with view switching"
```

---

## Phase 9: 音效资源

### Task 9.1: 添加占位音效文件

**Files:**
- Create: `public/spin.mp3`
- Create: `public/win.mp3`

- [ ] **Step 1: 添加音效文件**

由于音效文件需要真实音频，这里提供两种方案：

**方案 A：使用在线音效**
```bash
# 下载音效到 public 目录
# spin.mp3: 转动时的循环音效（2-3秒）
# win.mp3: 中奖提示音（1秒）
```

**方案 B：临时静音处理**
暂时创建空文件，后续替换真实音效：

```bash
# 创建空占位文件
touch public/spin.mp3 public/win.mp3
```

- [ ] **Step 2: 添加真实音效（用户自行准备）**

推荐音效来源：
- spin.mp3: 轻柔的齿轮转动声或白噪音
- win.mp3: 清脆的铃音或"叮"声

- [ ] **Step 3: 提交**

```bash
git add public/spin.mp3 public/win.mp3
git commit -m "feat: add audio effect files"
```

---

## Phase 10: 测试和优化

### Task 10.1: 运行应用测试

**Files:**
- Test: 全应用测试

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 测试配置视图**
- 修改标题
- 添加/删除选项
- 修改权重
- 切换主题

- [ ] **Step 3: 测试游玩视图**
- 点击"开始抽奖"
- 验证转动动画
- 验证结果显示
- 测试"再转一次"

- [ ] **Step 4: 测试导出功能**
- 点击"导出为 HTML"
- 打开导出的文件
- 验证离线运行

- [ ] **Step 5: 测试响应式**
- 移动端视图
- 桌面端视图

- [ ] **Step 6: 提交修复**

```bash
git add .
git commit -m "fix: address issues found during testing"
```

### Task 10.2: 性能优化

**Files:**
- Modify: 各组件优化

- [ ] **Step 1: 添加 React.memo**

对不需要频繁重渲染的组件添加 `React.memo`：

```typescript
export const AppHeader = React.memo(function AppHeader({ title }) {
  // ...
});
```

- [ ] **Step 2: 优化 Canvas 渲染**

确保 Canvas 只在必要时重绘。

- [ ] **Step 3: 检查包大小**

```bash
npm run build
# 检查 dist 目录大小
```

- [ ] **Step 4: 提交优化**

```bash
git add .
git commit -m "perf: optimize rendering and bundle size"
```

---

## Phase 11: 构建和部署

### Task 11.1: 生产构建

**Files:**
- Build output

- [ ] **Step 1: 构建生产版本**

```bash
npm run build
```

- [ ] **Step 2: 预览构建结果**

```bash
npm run preview
```

- [ ] **Step 3: 验证单文件导出**

在预览模式下测试导出功能。

- [ ] **Step 4: 最终提交**

```bash
git add .
git commit -m "chore: finalize production build"
```

---

## 验收标准

完成后，应用应满足：

1. **功能完整性**
   - [ ] 可配置标题、选项、权重
   - [ ] 4 种主题切换正常
   - [ ] 转动动画流畅
   - [ ] 结果计算准确
   - [ ] 导出单文件可离线运行

2. **用户体验**
   - [ ] 响应式布局适配移动端和桌面端
   - [ ] 输入验证友好
   - [ ] 错误提示清晰
   - [ ] 动画过渡自然

3. **性能指标**
   - [ ] 首次加载 < 1s
   - [ ] 转动动画 60fps
   - [ ] 单文件大小 < 500KB
   - [ ] 导出耗时 < 2s

4. **代码质量**
   - [ ] TypeScript 无错误
   - [ ] ESLint 无警告
   - [ ] Git 提交历史清晰
