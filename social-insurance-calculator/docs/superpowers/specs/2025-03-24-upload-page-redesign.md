# 上传页面两栏布局重新设计

**日期**: 2025-03-24
**状态**: 待审查

---

## 一、需求概述

将上传页面的垂直单列布局改为两栏紧凑布局，并在计算成功后自动跳转到结果页。

---

## 二、当前问题

- 现有页面是单列垂直布局，三个独立卡片（城市标准、员工工资、计算操作）
- 用户需要上下滚动才能完成整个流程
- 不符合参考图片的紧凑设计风格

---

## 三、设计规格

### 3.1 布局结构

```
┌─────────────────────────────────────────────────────────┐
│  ← 返回首页                                              │
│                                                         │
│  数据上传与操作                                          │
│  上传Excel文件并执行计算                                  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  📋 Excel文件上传                                 │   │
│  ├────────────────────┬────────────────────────────┤   │
│  │  📍 城市社保标准      │  💰 员工工资数据            │   │
│  │  ┌────────────────┐ │  ┌────────────────────────┐ │   │
│  │  │  虚线边框上传区  │ │  │  虚线边框上传区          │ │   │
│  │  │  点击或拖拽...  │ │  │  点击或拖拽...           │ │   │
│  │  └────────────────┘ │  └────────────────────────┘ │   │
│  │  [ 选择文件 ]        │  [ 选择文件 ]                │   │
│  │  (蓝色按钮)          │  (绿色按钮)                  │   │
│  └────────────────────┴────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🧮 计算操作                                       │   │
│  │                                                  │   │
│  │  选择城市：[下拉选择器]                            │   │
│  │                                                  │   │
│  │  [ 执行计算并跳转到结果页 ]                        │   │
│  │  (紫色按钮)                                       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3.2 组件设计

#### 新建组件：`TwoColumnUploadSection.tsx`

```tsx
interface TwoColumnUploadSectionProps {
  onCitiesFileSelect: (file: File) => void;
  onSalariesFileSelect: (file: File) => void;
  selectedCitiesFile: File | null;
  selectedSalariesFile: File | null;
  onUploadCities: () => void;
  onUploadSalaries: () => void;
  uploadingCities: boolean;
  uploadingSalaries: boolean;
  disabled: boolean;
}
```

**结构**：
- 外层卡片：白色背景，圆角 `rounded-lg`，阴影 `shadow-sm`，内边距 `p-6`
- 标题行：`📋 Excel文件上传`
- 两栏容器：`grid grid-cols-2 gap-6`
  - 左栏：城市社保标准，蓝色按钮 `bg-blue-600`
  - 右栏：员工工资数据，绿色按钮 `bg-green-600`
- 每栏包含：
  - 图标标题
  - 复用 `FileUploader` 组件
  - 字段说明文字
  - 上传按钮

#### 计算区域

- 复用现有 `CitySelector` 组件
- 修改按钮样式为紫色 `bg-purple-600 hover:bg-purple-700`
- 计算成功后使用 `router.push('/results')` 跳转

### 3.3 样式规格

| 元素 | Tailwind 类名 |
|------|---------------|
| 页面背景 | `bg-gradient-to-b from-blue-50 to-white` |
| 卡片背景 | `bg-white` |
| 卡片圆角 | `rounded-lg` |
| 卡片阴影 | `shadow-sm` |
| 卡片内边距 | `p-6` |
| 卡片间距 | `mb-6` |
| 两栏容器 | `grid grid-cols-2 gap-6` |
| 城市按钮 | `bg-blue-600 hover:bg-blue-700` |
| 工资按钮 | `bg-green-600 hover:bg-green-700` |
| 计算按钮 | `bg-purple-600 hover:bg-purple-700` |
| 按钮文字 | `text-white font-medium py-3 px-6 rounded-lg` |
| 禁用状态 | `disabled:bg-gray-300` |

### 3.4 响应式设计

- **移动端**：保持两列布局，内容自适应变窄（用户选择不堆叠）
- **最小宽度**：使用 `min-w-0` 防止内容溢出

---

## 四、行为逻辑

### 4.1 跳转逻辑

计算成功后自动跳转到结果页：

```typescript
const handleCalculate = async () => {
  // ... 验证和计算逻辑 ...
  if (data.success) {
    router.push('/results');  // 自动跳转
  } else {
    setMessage({ type: 'error', text: data.error || '计算失败' });
  }
};
```

### 4.2 状态管理

- 保持现有的独立状态：
  - `selectedCitiesFile` / `uploadingCities`
  - `selectedSalariesFile` / `uploadingSalaries`
  - `calculating`
  - `message`
- 两个上传操作互不阻塞（可以同时上传）

---

## 五、文件修改清单

| 文件 | 操作 |
|------|------|
| `components/TwoColumnUploadSection.tsx` | 新建 |
| `app/upload/page.tsx` | 修改：使用新组件，添加跳转逻辑 |

---

## 六、验收标准

1. ✅ 两个上传框并排显示在一个卡片内
2. ✅ 左框城市标准蓝色按钮，右框工资数据绿色按钮
3. ✅ 计算按钮为紫色
4. ✅ 计算成功后自动跳转到 `/results`
5. ✅ 保持现有功能完整性（文件选择、上传验证、错误提示）
