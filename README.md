# 项目名称
Mini 五险一金计算器（Web App）

---

# 一、项目目标

构建一个基于 Next.js + Supabase 的轻量级 Web 应用，实现以下完整流程：

1. 上传员工工资与城市社保标准数据（Excel）
2. 自动计算员工年度平均工资
3. 根据城市基数规则计算缴费基数
4. 计算公司缴纳费用
5. 将结果写入数据库
6. 前端展示计算结果

该项目定位为：
👉 MVP（最小可用产品）
👉 可扩展为 SaaS 工具

---

# 二、技术栈

- 前端框架：Next.js（App Router）
- 样式：Tailwind CSS
- 后端/数据库：Supabase（PostgreSQL）
- 数据处理：Node.js（API Route 内执行）
- 文件解析：Excel 解析库（如 xlsx）

---

# 三、数据库设计（Supabase）

## 1. cities（城市标准表）

| 字段 | 类型 |
|------|------|
| id | int (PK) |
| city_name | text |
| year | text |
| base_min | int |
| base_max | int |
| rate | float |

---

## 2. salaries（员工工资表）

| 字段 | 类型 |
|------|------|
| id | int (PK) |
| employee_id | text |
| employee_name | text |
| month | text（YYYYMM） |
| salary_amount | int |

---

## 3. results（计算结果表）

（采用扩展字段设计，便于后续扩展）

| 字段 | 类型 |
|------|------|
| id | int (PK) |
| employee_id | text |
| employee_name | text |
| city_name | text |
| year | text |
| avg_salary | float |
| contribution_base | float |
| company_fee | float |
| created_at | timestamp |

---

# 四、核心业务逻辑

## 计算流程

1. 从 salaries 表读取数据
2. 按 employee_id 分组
3. 过滤出对应年份数据（依据 cities.year）
4. 计算年度月平均工资：

   avg_salary = 所有月份工资总和 / 有数据的月份数

---

5. 获取城市标准（如佛山）：

- base_min
- base_max
- rate

---

6. 计算缴费基数：

- avg_salary < base_min → base_min
- avg_salary > base_max → base_max
- 否则 → avg_salary

---

7. 计算公司缴费：

company_fee = contribution_base × rate

---

8. 数据处理规则：

- 所有金额保留 2 位小数（四舍五入）
- 每次执行计算：
  👉 清空 results 表
  👉 写入新结果

---

# 五、Excel 上传规则

## 上传方式

👉 一个 Excel 文件，包含两个 Sheet：

### Sheet 1：cities

| city_name | year | base_min | base_max | rate |

---

### Sheet 2：salaries

| employee_id | employee_name | month | salary_amount |

---

## 导入策略

- cities：
  👉 同 city_name + year → 覆盖（先删后插）

- salaries：
  👉 同 employee_id + month → 覆盖

---

# 六、前端页面设计

## 1. 首页 `/`

### 功能
导航入口

### UI
- 两个卡片（Card）
- 桌面：2列
- 移动：1列

### 卡片

#### 数据上传
→ 跳转 `/upload`

#### 结果查询
→ 跳转 `/results`

---

## 2. `/upload`

### 功能

#### 按钮1：上传数据
- 选择 Excel
- 解析
- 写入 cities + salaries

---

#### 按钮2：执行计算
- 调用 API
- 执行计算逻辑
- 写入 results

---

## 3. `/results`

### 功能

- 页面加载自动查询 results
- 表格展示数据

### 表头

- employee_id
- employee_name
- city_name
- year
- avg_salary
- contribution_base
- company_fee

---

### UI要求

- Tailwind 表格
- 极简风格
- 支持：
  - 空状态
  - loading 状态
  - 错误提示

---

# 七、系统架构

## 数据流

```text
Excel → 上传 → Supabase（cities / salaries）
            ↓
      API Route（计算）
            ↓
       Supabase（results）
            ↓
        前端展示
