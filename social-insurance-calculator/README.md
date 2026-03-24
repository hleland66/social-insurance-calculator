# 五险一金计算器

一个基于 Next.js + Supabase 的轻量级社保缴费计算工具。

## 功能

- 📤 上传 Excel 文件（城市标准 + 员工工资）
- 🧮 自动计算缴费基数和公司缴费
- 📊 结果展示与导出
- 🎯 支持多城市、多年份

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

详细步骤请参考 [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)

简要步骤：

1. 在 [Supabase](https://supabase.com) 创建项目
2. 在 SQL Editor 中执行 `supabase/migration.sql`
3. 获取 API 配置并填入 `.env.local`

### 3. 配置环境变量

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`，填入你的 Supabase 配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## Excel 文件格式

上传的 Excel 需包含两个工作表：

### Sheet 1: cities

| city_name | year | base_min | base_max | rate |
|-----------|------|----------|----------|------|
| 佛山 | 2024 | 2390 | 20268 | 0.151 |

支持中英文列名：
- `city_name` / `城市名称`
- `year` / `年份`
- `base_min` / `基数下限`
- `base_max` / `基数上限`
- `rate` / `缴费比例`

### Sheet 2: salaries

| employee_id | employee_name | month | salary_amount |
|-------------|---------------|-------|---------------|
| E001 | 张三 | 202401 | 8000 |

支持中英文列名：
- `employee_id` / `员工编号`
- `employee_name` / `员工姓名`
- `month` / `月份`（格式：YYYYMM）
- `salary_amount` / `工资金额`

## 项目结构

```
├── app/              # Next.js App Router
│   ├── api/          # API 路由
│   ├── upload/       # 上传页面
│   └── results/      # 结果页面
├── components/       # React 组件
├── lib/              # 核心逻辑
│   ├── calculator.ts    # 计算引擎
│   ├── excel-parser.ts  # Excel 解析
│   └── supabase.ts      # 数据库操作
├── types/            # TypeScript 类型
└── supabase/         # 数据库迁移脚本
```

## 计算逻辑

1. 按员工分组工资数据
2. 过滤选定年份的月份
3. 计算月平均工资
4. 根据城市标准确定缴费基数：
   - 低于下限 → 使用下限
   - 高于上限 → 使用上限
   - 区间内 → 使用实际值
5. 计算公司缴费 = 缴费基数 × 缴费比例

## 技术栈

- **前端**: Next.js 15, React 18, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **Excel 处理**: xlsx

## 开发

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

## 文档

- [Supabase 配置指南](docs/SUPABASE_SETUP.md)
- [项目设计文档](docs/superpowers/specs/2026-03-23-social-insurance-calculator-design.md)
- [实施计划](docs/superpowers/plans/2026-03-23-social-insurance-calculator.md)

## License

MIT
