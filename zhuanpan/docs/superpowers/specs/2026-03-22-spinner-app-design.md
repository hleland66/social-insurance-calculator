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
- GSAP 动画库（打包时内嵌，不依赖 CDN）
- CSS Modules / Tailwind CSS
- localStorage 持久化

**依赖策略**: 所有依赖（React、GSAP）通过 Vite 打包内嵌，生成的单文件无需外部 CDN，完全离线可用。

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
// 按权重随机选择结果
function getRandomByWeight(options: Option[]): Option {
  const totalWeight = options.reduce((sum, o) => sum + o.weight, 0);
  let random = Math.random() * totalWeight;
  for (const opt of options) {
    random -= opt.weight;
    if (random <= 0) return opt;
  }
  return options[0];
}

// 计算目标角度（确保指针停在结果扇形中央）
function calculateTargetAngle(result: Option, options: Option[]): number {
  const resultArc = calculateArcs(options).find(a => a.id === result.id);
  const midAngle = (resultArc.startAngle + resultArc.endAngle) / 2;
  // 指针固定在顶部（-90度），需要反向旋转
  return 360 * 5 + (360 - midAngle - 90);
}

const spin = () => {
  const result = getRandomByWeight(options);  // 立即计算结果
  const targetAngle = calculateTargetAngle(result, options);
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
  private rotation: number = 0;
  private segments: Segment[] = [];
  private theme: Theme | null = null;

  // 绘制转盘
  draw(segments: Segment[], theme: Theme): void {
    this.segments = segments;
    this.theme = theme;
    this.render();
  }

  // 内部渲染方法（根据当前 rotation 重绘）
  private render(): void {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((this.rotation * Math.PI) / 180);

    this.segments.forEach(seg => {
      this.drawSegment(seg.startAngle, seg.endAngle, seg.color);
      this.drawLabel(seg.name, seg.midAngle, this.theme.textColor);
    });

    ctx.restore();
    this.drawPointer(this.theme.pointerColor);
  }

  // 转动动画
  spin(from: number, to: number): Promise<void> {
    return gsap.to(this, {
      rotation: to + 360 * 5,  // 多转5圈
      duration: 4,
      ease: "power2.out",
      onUpdate: () => this.render()  // 每帧重绘 Canvas
    });
  }
}
```

### 5.2 SingleFileExporter（单文件导出）

```typescript
class SingleFileExporter {
  // 音效文件路径（项目中的资源）
  private readonly ASSETS = {
    spin: '/public/spin.mp3',
    win: '/public/win.mp3'
  };

  // 生成单文件 HTML
  async export(state: AppState): Promise<Blob> {
    const template = await this.loadTemplate();
    const injected = this.injectState(template, state);
    const embedded = await this.embedAssets(injected);
    return new Blob([embedded], { type: 'text/html' });
  }

  // 注入状态到模板
  private injectState(template: string, state: AppState): string {
    const stateScript = `<script>window.__INITIAL_STATE__=${JSON.stringify(state)}</script>`;
    return template.replace('</head>', stateScript + '</head>');
  }

  // 读取文件并转换为 Base64
  private async fileToBase64(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // 内嵌资源（音效转为 Base64）
  private async embedAssets(html: string): Promise<string> {
    try {
      const spinBase64 = await this.fileToBase64(this.ASSETS.spin);
      const winBase64 = await this.fileToBase64(this.ASSETS.win);
      return html
        .replace('src="./spin.mp3"', `src="${spinBase64}"`)
        .replace('src="./win.mp3"', `src="${winBase64}"`);
    } catch (e) {
      console.warn('Failed to embed audio files:', e);
      return html; // 失败时返回原始 HTML
    }
  }
}
```

**音效文件要求**:
- 格式：MP3，建议比特率 128kbps
- 大小：单个文件 < 100KB
- 时长：spin.mp3 约 2-3 秒循环音，win.mp3 约 1 种提示音

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

**颜色分配算法**:
每个主题包含一个固定调色板（12 种颜色），按顺序分配给选项：

```typescript
const THEME_PALETTES: Record<ThemeId, string[]> = {
  morandi: ['#A8B5C4', '#B8C5D4', '#C8D5E4', '#D8E5F4', ...],
  minimal: ['#2D3436', '#636E72', '#B2BEC3', '#DFE6E9', ...],
  pastel: ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', ...],
  warm: ['#FF6B6B', '#FFA07A', '#FFD93D', '#6BCB77', ...]
};

// 为选项分配颜色
function assignOptionColors(options: Option[], theme: ThemeId): Option[] {
  const palette = THEME_PALETTES[theme];
  return options.map((opt, i) => ({
    ...opt,
    color: palette[i % palette.length]  // 循环使用调色板
  }));
}
```

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
- 由于所有依赖已内嵌，无需 CDN 降容处理

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
