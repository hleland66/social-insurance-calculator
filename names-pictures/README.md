# 🎨 儿童识字小报生成器

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.1.3-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-css?logo=tailwind-css&logoColor=38bdf8)

一个基于 AI 的儿童识字小报生成器，帮助家长和老师为 5-9 岁儿童创建个性化学习材料。

[功能特性](#功能特性) • [快速开始](#快速开始) • [使用说明](#使用说明) • [配置](#配置)

</div>

---

## 功能特性

- 🎯 **多场景支持** - 超市、医院、公园、学校、动物园、消防站等预设场景
- 📝 **自动生成小报** - AI 根据主题和词汇自动生成精美的学习小报
- 🔑 **用户自定义 API Key** - 安全的本地存储，无需服务器配置
- 💾 **历史记录** - 本地保存生成的小报，随时查看
- 📱 **响应式设计** - 完美支持桌面和移动设备
- ⚡ **实时预览** - 生成前预览所有词汇和 Prompt
- 🎨 **精美 UI** - 可爱卡通风格，适合儿童使用

---

## 技术栈

- **框架**: Next.js 15.1.3 (App Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS
- **API**: V-API (api.v3.cm) - 同步图片生成
- **存储**: localStorage (API Key 和历史记录)

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/hleland66/Kids--Character-Learning/upload.git
cd upload
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量（可选）

创建 `.env.local` 文件（可选，主要用于开发环境）：

```bash
V_API_URL=https://api.v3.cm
```

> **注意**：生产环境中，用户在应用内配置自己的 API Key，无需配置环境变量。

### 4. 启动开发服务器

```bash
npm run dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动。

### 5. 构建生产版本

```bash
npm run build
npm start
```

---

## 使用说明

### 基本使用流程

1. **选择主题** - 从预设场景中选择或自定义主题
2. **输入标题** - 为小报起一个名字（自动生成，可修改）
3. **预览词汇** - 查看将要包含的词汇列表
4. **生成小报** - 点击生成按钮，AI 开始创作
5. **查看结果** - 图片生成完成后可以查看和下载
6. **保存历史** - 将喜欢的小报保存到本地历史记录

### 配置 API Key

1. 点击右上角的 **⚙️ 设置** 按钮
2. 输入你的 V-API Key
3. 点击 **保存**
4. API Key 仅保存在浏览器本地，不会上传到服务器

**获取 API Key：**
1. 访问 [api.v3.cm](https://api.v3.cm)
2. 注册/登录账号
3. 在控制台获取 API Key

---

## 配置

### 支持的主题

| 主题 | 默认标题 |
|------|----------|
| 超市 | 走进超市 |
| 医院 | 探秘医院 |
| 公园 | 游逛公园 |
| 学校 | 我的学校 |
| 动物园 | 动物园之旅 |
| 消防站 | 小小消防员 |

### 自定义主题

选择"自定义..."选项，输入你想要的主题名称，应用会自动生成相应的词汇和标题。

### 词汇分类

- **核心角色** (core) - 主要对象和设施
- **常见物品** (items) - 相关物品和工具
- **环境装饰** (env) - 环境特征和装饰

---

## 项目结构

```
names-pictures/
├── src/
│   ├── app/
│   │   ├── api/generate/       # API 路由：生成图片
│   │   ├── page.tsx            # 主页面
│   │   └── layout.tsx          # 布局
│   ├── components/
│   │   ├── Header.tsx          # 顶部导航
│   │   ├── InputStep.tsx       # 输入步骤
│   │   ├── PreviewStep.tsx     # 预览步骤
│   │   ├── GeneratingStep.tsx  # 生成中状态
│   │   ├── ResultStep.tsx      # 结果展示
│   │   ├── HistoryModal.tsx    # 历史记录弹窗
│   │   ├── SettingsModal.tsx   # 设置弹窗
│   │   └── VocabularyCard.tsx  # 词汇卡片
│   ├── lib/
│   │   ├── config.ts           # 应用配置
│   │   ├── storage.ts         # localStorage 管理
│   │   ├── vocabulary.ts       # 词汇数据
│   │   ├── prompt.ts           # Prompt 生成
│   │   └── nanoBananaApi.ts    # V-API 封装
│   └── types/
│       └── index.ts            # TypeScript 类型
├── public/                    # 静态资源
├── .env.local.example          # 环境变量示例
└── README.md                  # 项目说明
```

---

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `V_API_URL` | V-API 地址 | `https://api.v3.cm` |
| `V_API_KEY` | API 密钥（仅开发用） | - |

> **注意**：生产环境中，用户在应用内配置 API Key，无需设置此变量。

---

## API 支持

本项目使用 [V-API (api.v3.cm)](https://api.v3.cm) 提供图片生成服务：

- **模型**: nano-banana-pro-4k (gemini-3-pro-image-preview)
- **分辨率**: 4K (3072x4096)
- **比例**: 3:4 (A4 竖版)
- **格式**: URL

---

## 开发

### 可用脚本

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

### 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

---

## 安全说明

- ✅ API Key 仅存储在用户浏览器 localStorage
- ✅ 不在服务器端存储任何 API Key
- ✅ 不在代码或 Git 历史中包含敏感信息
- ✅ 所有敏感数据都在客户端管理

---

## 许可证

MIT License

---

## 贡献

欢迎提交 Issue 和 Pull Request！

---

## 作者

[hleland66](https://github.com/hleland66)

---

## 更新日志

### v1.0.0 (2026-03-23)

#### 新增
- ✨ 初始版本发布
- 🎯 支持 6 种预设场景
- 🔑 用户可配置 API Key
- 📚 本地历史记录功能
- 📝 自动标题生成
- 🎨 精美卡通 UI 设计

#### 技术实现
- 迁移到 V-API 同步 API
- 移除轮询机制
- 改进可访问性
- 完善类型安全

---

## 支持

如有问题或建议，请提交 [Issue](https://github.com/hleland66/Kids--Character-Learning/upload/issues)。
