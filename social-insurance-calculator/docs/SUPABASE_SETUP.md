# Supabase 配置指南

## 一、获取 Supabase 连接信息

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择或创建一个新项目
3. 进入 **Settings** → **API**
4. 复制以下信息：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 二、配置本地环境变量

在项目根目录创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 三、创建数据库表

### 方式一：使用 SQL Editor（推荐）

1. 在 Supabase Dashboard 中，进入 **SQL Editor**
2. 点击 **New Query**
3. 复制 `supabase/migration.sql` 文件内容
4. 点击 **Run** 执行

### 方式二：使用 CLI

```bash
# 安装 Supabase CLI
npm install -g supabase

# 连接到你的项目
supabase link --project-ref YOUR_PROJECT_REF

# 执行迁移
supabase db push
```

---

## 四、验证表结构

执行 SQL 后，在 **Table Editor** 中应该能看到以下表：

| 表名 | 用途 | 记录数 |
|------|------|--------|
| `cities` | 城市社保标准 | 2条测试数据 |
| `salaries` | 员工工资记录 | 24条测试数据 |
| `results` | 计算结果 | 空（待计算） |

---

## 五、测试连接

启动开发服务器：

```bash
npm run dev
```

访问 http://localhost:3000，尝试：
1. 上传 Excel 测试文件
2. 选择城市（佛山/广州 2024）
3. 执行计算
4. 查看结果

---

## 六、表结构说明

### cities 表
```sql
- id: 主键
- city_name: 城市名称
- year: 年份
- base_min: 缴费基数下限
- base_max: 缴费基数上限
- rate: 公司缴费比例
```

### salaries 表
```sql
- id: 主键
- employee_id: 员工编号
- employee_name: 员工姓名
- month: 月份（YYYYMM 格式）
- salary_amount: 工资金额
```

### results 表
```sql
- id: 主键
- employee_id: 员工编号
- employee_name: 员工姓名
- city_name: 城市名称
- year: 年份
- avg_salary: 月平均工资
- contribution_base: 缴费基数
- company_fee: 公司缴费金额
```

---

## 七、安全注意事项

> ⚠️ **重要**：当前配置为 MVP 阶段，RLS 策略允许所有访问。

生产环境建议：
1. 启用严格的 RLS 策略
2. 使用 Service Role Key 替代 Anon Key 进行服务端操作
3. 添加用户认证系统
4. 限制 API 调用频率

---

## 八、故障排查

### 错误：Invalid supabaseUrl
- 检查 `.env.local` 中的 URL 是否以 `https://` 开头

### 错误：API key 未找到
- 确认使用的是 `anon public` key，不是 `service_role` key

### 表不存在错误
- 在 SQL Editor 中确认表已创建
- 检查表名拼写是否正确（小写）
