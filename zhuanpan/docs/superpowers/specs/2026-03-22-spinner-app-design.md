# 自定义转盘应用 - 设计文档

**日期**: 2026-03-22
**状态**: 已批准
**方案**: 方案 B - React + Vite 开发，运行时动态打包

---

## 1. 概述

一款支持高度自定义、纯前端运行的轻量级转盘应用。用户可自由配置转盘选项与权重，切换极简治愈系主题，并在网页端获得沉浸式的抽奖体验。核心特色是将完整应用一键打包为单个离线 HTML 文件。

**使用场景**: 个人日常决策（如今天吃什么、去哪里玩）

**技术栈**:
- React 18 + TypeScript + Vite
- Canvas 2D API 绘制转盘
- GSAP 动画库
- CSS Modules / Tailwind CSS
- localStorage 持久化

---

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        应用架构                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │  配置控制台视图   │      │   游玩沉浸视图   │            │
│  │                  │      │                  │            │
│  │  - 标题输入      │      │  - 转盘 Canvas   │            │
│  │  - 选项管理列表  │  ◄──► │  - 抽奖按钮     │            │
│  │  - 主题选择器    │      │  - 结果弹窗     │            │
│  │  - 导出按钮      │      │  - 返回编辑     │            │
│  └──────────────────┘      └──────────────────┘            │
│           ▲                         ▲                       │
│           └─────────────┬───────────┘                       │
│                         │                                    │
│              ┌─────────────────────┐                        │
│              │     App State       │                        │
│              │  (useState + localStorage)                   │
│              └─────────────────────┘                        │
│                         │                                    │
│              ┌─────────────────────┐                        │
│              │   单文件导出引擎     │                        │
│              │  - 模板注入         │                        │
│              │  - 资源内嵌         │                        │
│              └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 视图状态机

```
编辑态 (EDIT) ──[开始游玩]──> 游玩态 (PLAY)
     ▲                            │
     └──────[返回编辑]─────────────┘
```

---

## 3. 组件结构

```
App
├── AppHeader (标题显示)
├── ViewSwitcher (视图切换控制)
│
├── ConfigView (配置控制台)
│   ├── TitleInput (标题输入)
│   ├── OptionList (选项管理列表)
│   │   ├── OptionItem (单条选项)
│   │   │   ├── NameInput
│   │   │   ├── WeightInput
│   │   │   └── DeleteButton
│   │   └── AddOptionButton
│   ├── ThemeSelector (主题选择器)
│   │   └── ThemeCard (主题卡片)
│   └── ExportButton (导出按钮)
│
├── PlayView (游玩沉浸视图)
│   ├── SpinnerCanvas (转盘绘制)
│   ├── SpinButton (抽奖按钮)
│   ├── ResultModal (结果弹窗)
│   └── BackToEditButton (返回编辑)
│
└── SoundManager (音效管理 - 单例)
```

### 3.1 关键组件职责

| 组件 | 职责 |
|------|------|
| `SpinnerCanvas` | 核心组件，使用 Canvas 绘制转盘扇形、指针，处理转动动画 |
| `OptionList` | 管理选项数组，支持增删改、权重计算 |
| `ThemeSelector` | 主题切换，改变全局 CSS 变量 |
| `ExportButton` | 触发单文件生成，调用打包引擎 |
| `SoundManager` | 音效预加载、播放控制，支持静音 |

---

## 4. 数据设计

### 4.1 State 结构

```typescript
interface AppState {
  // 全局配置
  title: string;
  theme: ThemeId;

  // 选项数据
  options: Array<{
    id: string;
    name: string;
    weight: number;
    color: string;  // 由主题自动分配
  }>;

  // 视图状态
  viewMode: 'edit' | 'play';

  // 转盘状态
  isSpinning: boolean;
  lastResult: string | null;

  // 音效
  soundEnabled: boolean;
}

type ThemeId = 'morandi' | 'minimal' | 'pastel' | 'warm';
```

### 4.2 数据流

```
用户输入 → State 更新 → localStorage 持久化
                ↓
            视图重渲染
                ↓
            Canvas 重绘
```

### 4.3 权重计算

```typescript
// 计算每个选项的弧度
const calculateArcs = (options: Option[]) => {
  const totalWeight = options.reduce((sum, o) => sum + o.weight, 0);
  return options.map(opt => ({
    ...opt,
    startAngle: accumulatedAngle,
    endAngle: accumulatedAngle + (opt.weight / totalWeight) * 360
  }));
};
```

### 4.4 转动结果预计算

点击瞬间即确定结果，动画只是视觉呈现：

```typescript
const spin = () => {
  const result = getRandomByWeight(options);  // 立即计算结果
  const targetAngle = calculateTargetAngle(result);
  gsap.to(canvas, { rotation: targetAngle, duration: 4 });  // 动画匹配
};
```

---

## 5. 核心模块

### 5.1 SpinnerRenderer（转盘绘制）

```typescript
class SpinnerRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // 绘制转盘
  draw(segments: Segment[], theme: Theme): void {
    segments.forEach(seg => {
      this.drawSegment(seg.startAngle, seg.endAngle, seg.color);
      this.drawLabel(seg.name, seg.midAngle, theme.textColor);
    });
    this.drawPointer(theme.pointerColor);
  }

  // 转动动画
  spin(from: number, to: number): Promise<void> {
    return gsap.to(this, {
      rotation: to + 360 * 5,  // 多转5圈
      duration: 4,
      ease: "power2.out"
    });
  }
}
```

### 5.2 SingleFileExporter（单文件导出）

```typescript
class SingleFileExporter {
  // 生成单文件 HTML
  async export(state: AppState): Promise<Blob> {
    const template = await this.loadTemplate();
    const injected = this.injectState(template, state);
    const embedded = this.embedAssets(injected);
    return new Blob([embedded], { type: 'text/html' });
  }

  // 注入状态到模板
  private injectState(template: string, state: AppState): string {
    const stateScript = `<script>window.__INITIAL_STATE__=${JSON.stringify(state)}</script>`;
    return template.replace('</head>', stateScript + '</head>');
  }

  // 内嵌资源（音效 Base64）
  private embedAssets(html: string): string {
    return html
      .replace('src="./spin.mp3"', `src="${this.base64('./spin.mp3')}"`)
      .replace('src="./win.mp3"', `src="${this.base64('./win.mp3')}"`);
  }
}
```

### 5.3 主题系统

通过 CSS 变量实现主题切换：

```css
:root {
  --wheel-size: min(80vw, 400px);
  --primary-color: #6c5ce7;
  --bg-color: #f8f9fa;
  --text-color: #2d3436;
}

[data-theme="morandi"] {
  --primary-color: #a8b5c4;
  --bg-color: #e8ecef;
  --text-color: #495057;
}
```

**预设主题（4套）**:
1. Morandi - 莫兰迪色系，低饱和度温柔色调
2. Minimal - 极简黑白灰，高对比度
3. Pastel - 马卡龙色系，清新明亮
4. Warm - 暖色调，温馨治愈

---

## 6. 错误处理与边界情况

### 6.1 输入验证

| 场景 | 处理方式 |
|------|----------|
| 标题超过 20 字 | 截断并提示 |
| 选项名为空 | 禁用"开始游玩"按钮，显示错误提示 |
| 权重 ≤ 0 | 输入框标红，禁止保存 |
| 选项超过 20 个 | 禁用"添加"按钮 |
| 所有权重为 0 | 禁用"开始游玩"，显示错误提示 |

### 6.2 状态保护

```typescript
// 进入游玩前的校验
const canStartPlay = (state: AppState): boolean => {
  return state.options.length >= 2 &&
         state.options.every(o => o.name.trim() !== '' && o.weight > 0);
};
```

### 6.3 单文件兼容性

- 离线文件打开时，检测是否有 `__INITIAL_STATE__`
- 兼容无 localStorage 环境（降级为内存状态）
- CDN 失败时优雅降容（无动画但有基本功能）

### 6.4 导出异常处理

- 资源加载失败 → 跳过该资源，继续导出
- 生成文件过大（>2MB） → 警告用户，建议减少主题/音效
- 浏览器不支持 Blob → 提示下载失败

---

## 7. 测试策略

### 7.1 单元测试

| 模块 | 测试内容 |
|------|----------|
| `calculateArcs` | 权重计算准确性、边界值处理 |
| `getRandomByWeight` | 随机性验证、概率分布 |
| `SingleFileExporter` | 状态注入正确性、资源内嵌 |
| Theme 切换 | CSS 变量应用、颜色正确性 |

### 7.2 集成测试

- 完整抽奖流程：配置 → 开始 → 转动 → 结果
- 导出流程：配置 → 导出 → 打开单文件 → 验证状态
- 状态持久化：修改 → 刷新 → 验证恢复

### 7.3 视觉测试（手动）

- 主题切换视觉效果
- 动画流畅度（加速/减速）
- 移动端/桌面端响应式布局
- 单文件离线运行

### 7.4 性能基准

| 指标 | 目标 |
|------|------|
| 首次加载 | < 1s |
| 转动动画 | 60fps |
| 单文件大小 | < 500KB |
| 导出耗时 | < 2s |

---

## 8. 文件结构

```
zhuanpan/
├── src/
│   ├── components/
│   │   ├── ConfigView/
│   │   │   ├── TitleInput.tsx
│   │   │   ├── OptionList.tsx
│   │   │   ├── ThemeSelector.tsx
│   │   │   └── ExportButton.tsx
│   │   ├── PlayView/
│   │   │   ├── SpinnerCanvas.tsx
│   │   │   ├── SpinButton.tsx
│   │   │   ├── ResultModal.tsx
│   │   │   └── BackToEditButton.tsx
│   │   ├── AppHeader.tsx
│   │   └── ViewSwitcher.tsx
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── useSpinner.ts
│   │   └── useSound.ts
│   ├── lib/
│   │   ├── spinner.ts
│   │   ├── exporter.ts
│   │   └── themes.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   ├── spin.mp3
│   └── win.mp3
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 9. 实现顺序

1. **Phase 1 - 基础框架**: 项目初始化、路由/视图切换、状态管理
2. **Phase 2 - 配置视图**: 标题输入、选项列表、权重管理
3. **Phase 3 - 转盘绘制**: Canvas 渲染、扇形绘制、指针
4. **Phase 4 - 动画系统**: GSAP 集成、转动动画、结果计算
5. **Phase 5 - 主题系统**: CSS 变量、主题切换
6. **Phase 6 - 音效**: 音频加载、播放控制
7. **Phase 7 - 导出功能**: 单文件生成、资源内嵌
8. **Phase 8 - 测试与优化**: 单元测试、性能优化
