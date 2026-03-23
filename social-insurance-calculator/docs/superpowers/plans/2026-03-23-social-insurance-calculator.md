# 五险一金计算器实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 构建一个基于 Next.js + Supabase 的五险一金计算器 Web 应用

**架构：** Next.js App Router + Tailwind CSS 作为前端，API Routes 处理业务逻辑，Supabase PostgreSQL 存储数据

**技术栈：** Next.js 14+, Supabase, xlsx, Tailwind CSS, TypeScript

---

## 文件结构概览

```
social-insurance-calculator/
├── app/
│   ├── layout.tsx              # 根布局（商务蓝主题）
│   ├── page.tsx                # 首页（居中按钮式）
│   ├── upload/
│   │   └── page.tsx            # 上传页面
│   ├── results/
│   │   └── page.tsx            # 结果展示页面
│   └── api/
│       ├── upload/route.ts     # Excel 上传解析 API
│       ├── cities/route.ts     # 获取城市列表 API
│       ├── calculate/route.ts  # 计算逻辑 API
│       └── results/route.ts    # 获取结果 API
├── components/
│   ├── FileUploader.tsx        # 文件上传组件
│   ├── CitySelector.tsx        # 城市选择下拉框
│   └── ResultTable.tsx         # 结果表格组件
├── lib/
│   ├── supabase.ts             # Supabase 客户端配置
│   ├── excel-parser.ts         # Excel 解析逻辑
│   └── calculator.ts           # 社保计算核心逻辑
├── types/
│   └── index.ts                # TypeScript 类型定义
├── .env.local                  # 环境变量
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Task 1: 项目初始化

**目标：** 创建 Next.js 项目并配置基础依赖

- [ ] **Step 1: 创建 Next.js 项目**

```bash
cd "D:/codes/Test/202512_Claude_Code/social-insurance-calculator"
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-npm
```

**预期输出：** 项目初始化成功

- [ ] **Step 2: 安装额外依赖**

```bash
npm install @supabase/supabase-js xlsx
npm install -D @types/node
```

**预期输出：** 依赖安装成功

- [ ] **Step 3: 创建环境变量文件**

创建 `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: initialize Next.js project with dependencies"
```

---

## Task 2: 类型定义

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
// types/index.ts

export interface City {
  city_name: string;
  year: string;
  base_min: number;
  base_max: number;
  rate: number;
}

export interface Salary {
  employee_id: string;
  employee_name: string;
  month: string;  // YYYYMM
  salary_amount: number;
}

export interface Result {
  employee_id: string;
  employee_name: string;
  city_name: string;
  year: string;
  avg_salary: number;
  contribution_base: number;
  company_fee: number;
}

export interface CityOption {
  city_name: string;
  year: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ExcelData {
  cities: City[];
  salaries: Salary[];
}
```

- [ ] **Step 2: 提交**

```bash
git add types/index.ts
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 3: Supabase 客户端配置

**Files:**
- Create: `lib/supabase.ts`

- [ ] **Step 1: 创建 Supabase 客户端**

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库表操作辅助函数
export const db = {
  // Cities
  async getCities() {
    const { data, error } = await supabase
      .from('cities')
      .select('city_name, year')
      .order('city_name');
    if (error) throw error;
    return data;
  },

  async upsertCities(cities: any[]) {
    // 先删除同名同年的记录
    for (const city of cities) {
      await supabase
        .from('cities')
        .delete()
        .eq('city_name', city.city_name)
        .eq('year', city.year);
    }
    // 插入新记录
    const { data, error } = await supabase
      .from('cities')
      .insert(cities)
      .select();
    if (error) throw error;
    return data;
  },

  async getCity(cityName: string, year: string) {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('city_name', cityName)
      .eq('year', year)
      .single();
    if (error) throw error;
    return data;
  },

  // Salaries
  async upsertSalaries(salaries: any[]) {
    // 先删除同名同月的记录
    for (const salary of salaries) {
      await supabase
        .from('salaries')
        .delete()
        .eq('employee_id', salary.employee_id)
        .eq('month', salary.month);
    }
    // 插入新记录
    const { data, error } = await supabase
      .from('salaries')
      .insert(salaries)
      .select();
    if (error) throw error;
    return data;
  },

  async getSalaries() {
    const { data, error } = await supabase
      .from('salaries')
      .select('*')
      .order('employee_id, month');
    if (error) throw error;
    return data;
  },

  // Results
  async clearResults() {
    const { error } = await supabase
      .from('results')
      .delete()
      .neq('id', 0); // 删除所有记录
    if (error) throw error;
  },

  async insertResults(results: any[]) {
    const { data, error } = await supabase
      .from('results')
      .insert(results)
      .select();
    if (error) throw error;
    return data;
  },

  async getResults() {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .order('employee_id');
    if (error) throw error;
    return data;
  },
};
```

- [ ] **Step 2: 提交**

```bash
git add lib/supabase.ts
git commit -m "feat: add Supabase client and database helpers"
```

---

## Task 4: Excel 解析器

**Files:**
- Create: `lib/excel-parser.ts`

- [ ] **Step 1: 创建 Excel 解析器**

```typescript
// lib/excel-parser.ts
import * as xlsx from 'xlsx';
import type { City, Salary, ExcelData } from '@/types';

export class ExcelParser {
  /**
   * 解析 Excel 文件并返回数据
   */
  static async parse(file: File): Promise<ExcelData> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = xlsx.read(arrayBuffer, { type: 'array' });

    // 检查必要的 Sheet
    if (!workbook.SheetNames.includes('cities')) {
      throw new Error('Excel 必须包含 cities 工作表');
    }
    if (!workbook.SheetNames.includes('salaries')) {
      throw new Error('Excel 必须包含 salaries 工作表');
    }

    // 解析 cities
    const cities = this.parseCities(workbook.Sheets['cities']);

    // 解析 salaries
    const salaries = this.parseSalaries(workbook.Sheets['salaries']);

    return { cities, salaries };
  }

  /**
   * 解析 cities 工作表
   */
  private static parseCities(sheet: xlsx.WorkSheet): City[] {
    const data = xlsx.utils.sheet_to_json(sheet);

    return data.map((row: any) => ({
      city_name: String(row.city_name || row['城市名称'] || '').trim(),
      year: String(row.year || row['年份'] || '').trim(),
      base_min: Number(row.base_min || row['基数下限'] || 0),
      base_max: Number(row.base_max || row['基数上限'] || 0),
      rate: Number(row.rate || row['缴费比例'] || 0),
    })).filter(city => {
      // 验证必要字段
      if (!city.city_name || !city.year) return false;
      if (city.base_min <= 0 || city.base_max <= 0 || city.rate <= 0) return false;
      return true;
    });
  }

  /**
   * 解析 salaries 工作表
   */
  private static parseSalaries(sheet: xlsx.WorkSheet): Salary[] {
    const data = xlsx.utils.sheet_to_json(sheet);

    return data.map((row: any) => ({
      employee_id: String(row.employee_id || row['员工编号'] || '').trim(),
      employee_name: String(row.employee_name || row['员工姓名'] || '').trim(),
      month: String(row.month || row['月份'] || '').trim(),
      salary_amount: Number(row.salary_amount || row['工资金额'] || 0),
    })).filter(salary => {
      // 验证必要字段
      if (!salary.employee_id || !salary.employee_name || !salary.month) return false;
      if (salary.salary_amount <= 0) return false;
      // 验证月份格式 YYYYMM
      if (!/^\d{6}$/.test(salary.month)) return false;
      return true;
    });
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add lib/excel-parser.ts
git commit -m "feat: add Excel parser with validation"
```

---

## Task 5: 计算核心逻辑

**Files:**
- Create: `lib/calculator.ts`

- [ ] **Step 1: 创建计算器**

```typescript
// lib/calculator.ts
import type { City, Salary, Result } from '@/types';

export class Calculator {
  /**
   * 计算所有员工的社保缴费
   */
  static calculate(salaries: Salary[], city: City): Result[] {
    // 按员工分组
    const groupedSalaries = this.groupByEmployee(salaries);

    // 获取城市对应的年份
    const cityYear = city.year;

    // 过滤该年份的工资数据
    const filteredSalaries = this.filterByYear(groupedSalaries, cityYear);

    // 计算每个员工的结果
    const results: Result[] = [];

    for (const [employeeId, employeeSalaries] of Object.entries(filteredSalaries)) {
      if (employeeSalaries.length === 0) continue;

      const employeeName = employeeSalaries[0].employee_name;

      // 计算月平均工资
      const avgSalary = this.calculateAvgSalary(employeeSalaries);

      // 计算缴费基数
      const contributionBase = this.calculateContributionBase(
        avgSalary,
        city.base_min,
        city.base_max
      );

      // 计算公司缴费
      const companyFee = this.calculateCompanyFee(contributionBase, city.rate);

      results.push({
        employee_id: employeeId,
        employee_name: employeeName,
        city_name: city.city_name,
        year: city.year,
        avg_salary: this.round(avgSalary),
        contribution_base: this.round(contributionBase),
        company_fee: this.round(companyFee),
      });
    }

    return results;
  }

  /**
   * 按员工编号分组
   */
  private static groupByEmployee(salaries: Salary[]): Record<string, Salary[]> {
    const grouped: Record<string, Salary[]> = {};

    for (const salary of salaries) {
      if (!grouped[salary.employee_id]) {
        grouped[salary.employee_id] = [];
      }
      grouped[salary.employee_id].push(salary);
    }

    return grouped;
  }

  /**
   * 过滤指定年份的工资数据
   */
  private static filterByYear(
    groupedSalaries: Record<string, Salary[]>,
    year: string
  ): Record<string, Salary[]> {
    const filtered: Record<string, Salary[]> = {};

    for (const [employeeId, salaryList] of Object.entries(groupedSalaries)) {
      filtered[employeeId] = salaryList.filter(s => {
        // 从月份中提取年份 (YYYYMM -> YYYY)
        const salaryYear = s.month.substring(0, 4);
        return salaryYear === year;
      });
    }

    return filtered;
  }

  /**
   * 计算月平均工资
   */
  private static calculateAvgSalary(salaries: Salary[]): number {
    const sum = salaries.reduce((acc, s) => acc + s.salary_amount, 0);
    return sum / salaries.length;
  }

  /**
   * 计算缴费基数
   */
  private static calculateContributionBase(
    avgSalary: number,
    baseMin: number,
    baseMax: number
  ): number {
    if (avgSalary < baseMin) return baseMin;
    if (avgSalary > baseMax) return baseMax;
    return avgSalary;
  }

  /**
   * 计算公司缴费
   */
  private static calculateCompanyFee(contributionBase: number, rate: number): number {
    return contributionBase * rate;
  }

  /**
   * 保留两位小数
   */
  private static round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add lib/calculator.ts
git commit -m "feat: add social insurance calculation logic"
```

---

## Task 6: API Routes - 获取城市列表

**Files:**
- Create: `app/api/cities/route.ts`

- [ ] **Step 1: 创建 GET /api/cities**

```typescript
// app/api/cities/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET() {
  try {
    const cities = await db.getCities();

    return NextResponse.json({
      success: true,
      data: { cities },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '获取城市列表失败',
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add app/api/cities/route.ts
git commit -m "feat: add GET /api/cities endpoint"
```

---

## Task 7: API Routes - 上传 Excel

**Files:**
- Create: `app/api/upload/route.ts`

- [ ] **Step 1: 创建 POST /api/upload**

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ExcelParser } from '@/lib/excel-parser';
import { db } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '请上传文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { success: false, error: '请上传正确的 Excel 文件 (.xlsx 或 .xls)' },
        { status: 400 }
      );
    }

    // 解析 Excel
    const { cities, salaries } = await ExcelParser.parse(file);

    // 写入数据库
    const citiesInserted = await db.upsertCities(cities);
    const salariesInserted = await db.upsertSalaries(salaries);

    return NextResponse.json({
      success: true,
      data: {
        citiesInserted: citiesInserted.length,
        salariesInserted: salariesInserted.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '上传失败',
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add app/api/upload/route.ts
git commit -m "feat: add POST /api/upload endpoint"
```

---

## Task 8: API Routes - 执行计算

**Files:**
- Create: `app/api/calculate/route.ts`

- [ ] **Step 1: 创建 POST /api/calculate**

```typescript
// app/api/calculate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Calculator } from '@/lib/calculator';
import { db } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city_name, year } = body;

    if (!city_name || !year) {
      return NextResponse.json(
        { success: false, error: '请指定城市和年份' },
        { status: 400 }
      );
    }

    // 获取城市标准
    const city = await db.getCity(city_name, year);

    // 获取所有工资数据
    const salaries = await db.getSalaries();

    if (salaries.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有工资数据，请先上传' },
        { status: 400 }
      );
    }

    // 执行计算
    const results = Calculator.calculate(salaries, city);

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有找到匹配的数据' },
        { status: 400 }
      );
    }

    // 清空旧结果并写入新结果
    await db.clearResults();
    await db.insertResults(results);

    return NextResponse.json({
      success: true,
      data: {
        calculated: results.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '计算失败',
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add app/api/calculate/route.ts
git commit -m "feat: add POST /api/calculate endpoint"
```

---

## Task 9: API Routes - 获取结果

**Files:**
- Create: `app/api/results/route.ts`

- [ ] **Step 1: 创建 GET /api/results**

```typescript
// app/api/results/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET() {
  try {
    const results = await db.getResults();

    return NextResponse.json({
      success: true,
      data: { results },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '获取结果失败',
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add app/api/results/route.ts
git commit -m "feat: add GET /api/results endpoint"
```

---

## Task 10: UI 组件 - 结果表格

**Files:**
- Create: `components/ResultTable.tsx`

- [ ] **Step 1: 创建结果表格组件**

```typescript
// components/ResultTable.tsx
'use client';

import type { Result } from '@/types';

interface ResultTableProps {
  results: Result[];
  loading?: boolean;
}

export function ResultTable({ results, loading }: ResultTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>暂无数据</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">员工编号</th>
            <th className="px-4 py-3 text-left text-sm font-medium">姓名</th>
            <th className="px-4 py-3 text-left text-sm font-medium">城市</th>
            <th className="px-4 py-3 text-left text-sm font-medium">年份</th>
            <th className="px-4 py-3 text-right text-sm font-medium">月均工资</th>
            <th className="px-4 py-3 text-right text-sm font-medium">缴费基数</th>
            <th className="px-4 py-3 text-right text-sm font-medium">公司缴费</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {results.map((result, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">{result.employee_id}</td>
              <td className="px-4 py-3 text-sm">{result.employee_name}</td>
              <td className="px-4 py-3 text-sm">{result.city_name}</td>
              <td className="px-4 py-3 text-sm">{result.year}</td>
              <td className="px-4 py-3 text-sm text-right">
                ¥{result.avg_salary.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-right">
                ¥{result.contribution_base.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">
                ¥{result.company_fee.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add components/ResultTable.tsx
git commit -m "feat: add ResultTable component"
```

---

## Task 11: UI 组件 - 文件上传器

**Files:**
- Create: `components/FileUploader.tsx`

- [ ] **Step 1: 创建文件上传组件**

```typescript
// components/FileUploader.tsx
'use client';

import { useState, useRef } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
}

export function FileUploader({ onFileSelect, loading }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-colors duration-200
        ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleChange}
        className="hidden"
        disabled={loading}
      />
      <div className="text-4xl mb-4">📤</div>
      <p className="text-lg font-medium text-gray-700">
        {loading ? '处理中...' : '点击或拖拽上传 Excel 文件'}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        支持 .xlsx 和 .xls 格式
      </p>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add components/FileUploader.tsx
git commit -m "feat: add FileUploader component"
```

---

## Task 12: UI 组件 - 城市选择器

**Files:**
- Create: `components/CitySelector.tsx`

- [ ] **Step 1: 创建城市选择组件**

```typescript
// components/CitySelector.tsx
'use client';

import { useState, useEffect } from 'react';
import type { CityOption } from '@/types';

interface CitySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CitySelector({ value, onChange }: CitySelectorProps) {
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const res = await fetch('/api/cities');
      const data = await res.json();
      if (data.success) {
        setCities(data.data.cities);
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    } finally {
      setLoading(false);
    }
  };

  // 生成选项值：city_name|year
  const options = cities.map(c => ({
    label: `${c.city_name} (${c.year})`,
    value: `${c.city_name}|${c.year}`,
  }));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        选择城市
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading || cities.length === 0}
        className="
          w-full px-4 py-2 border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
        "
      >
        <option value="">
          {loading ? '加载中...' : cities.length === 0 ? '请先上传数据' : '请选择城市'}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add components/CitySelector.tsx
git commit -m "feat: add CitySelector component"
```

---

## Task 13: 首页

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: 创建首页**

```typescript
// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          五险一金计算器
        </h1>
        <p className="text-gray-600 mb-12">
          社保缴费基数与公司费用计算
        </p>

        <div className="space-y-4">
          <Link
            href="/upload"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200"
          >
            上传数据
          </Link>
          <Link
            href="/results"
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200"
          >
            查看结果
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-12">
          仅支持同一城市批量计算
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add app/page.tsx
git commit -m "feat: add home page with centered button layout"
```

---

## Task 14: 上传页面

**Files:**
- Create: `app/upload/page.tsx`

- [ ] **Step 1: 创建上传页面**

```typescript
// app/upload/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileUploader } from '@/components/FileUploader';
import { CitySelector } from '@/components/CitySelector';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [uploading, setUploading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setMessage(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: '请先选择文件' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `上传成功！城市: ${data.data.citiesInserted} 条，工资: ${data.data.salariesInserted} 条`,
        });
        setSelectedFile(null);
        // 刷新城市列表
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: data.error || '上传失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请重试' });
    } finally {
      setUploading(false);
    }
  };

  const handleCalculate = async () => {
    if (!selectedCity) {
      setMessage({ type: 'error', text: '请先选择城市' });
      return;
    }

    const [cityName, year] = selectedCity.split('|');

    setCalculating(true);
    setMessage(null);

    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city_name: cityName, year }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `计算成功！共 ${data.data.calculated} 名员工`,
        });
      } else {
        setMessage({ type: 'error', text: data.error || '计算失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请重试' });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
        >
          ← 返回首页
        </Link>

        <h1 className="text-3xl font-bold text-blue-900 mb-8">数据上传与计算</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <FileUploader
            onFileSelect={handleFileSelect}
            loading={uploading || calculating}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading || calculating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {uploading ? '上传中...' : '上传数据'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <CitySelector value={selectedCity} onChange={setSelectedCity} />

          <button
            onClick={handleCalculate}
            disabled={!selectedCity || uploading || calculating}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {calculating ? '计算中...' : '执行计算'}
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add app/upload/page.tsx
git commit -m "feat: add upload page"
```

---

## Task 15: 结果页面

**Files:**
- Create: `app/results/page.tsx`

- [ ] **Step 1: 创建结果页面**

```typescript
// app/results/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ResultTable } from '@/components/ResultTable';
import type { Result } from '@/types';

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/results');
      const data = await res.json();

      if (data.success) {
        setResults(data.data.results);
      } else {
        setError(data.error || '获取数据失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-blue-900">计算结果</h1>
          <button
            onClick={fetchResults}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            刷新
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <ResultTable results={results} loading={loading} />

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {!loading && results.length > 0 && (
          <div className="mt-4 text-right text-sm text-gray-500">
            共 {results.length} 条记录
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add app/results/page.tsx
git commit -m "feat: add results page"
```

---

## Task 16: 更新根布局

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: 更新根布局（设置商务蓝主题）**

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '五险一金计算器',
  description: '社保缴费基数与公司费用计算工具',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add app/layout.tsx
git commit -m "feat: update root layout with metadata"
```

---

## Task 17: Supabase 数据库表创建

**目标：** 在 Supabase 中创建数据库表

- [ ] **Step 1: 在 Supabase SQL Editor 中执行以下 SQL**

```sql
-- 创建 cities 表
create table if not exists cities (
  id bigint generated by default as identity primary key,
  city_name text not null,
  year text not null,
  base_min integer not null,
  base_max integer not null,
  rate numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 添加唯一约束
alter table cities add constraint cities_city_name_year_key unique (city_name, year);

-- 创建 salaries 表
create table if not exists salaries (
  id bigint generated by default as identity primary key,
  employee_id text not null,
  employee_name text not null,
  month text not null,
  salary_amount integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 添加唯一约束
alter table salaries add constraint salaries_employee_id_month_key unique (employee_id, month);

-- 创建 results 表
create table if not exists results (
  id bigint generated by default as identity primary key,
  employee_id text not null,
  employee_name text not null,
  city_name text not null,
  year text not null,
  avg_salary numeric not null,
  contribution_base numeric not null,
  company_fee numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

- [ ] **Step 2: 在 Supabase 中设置 RLS（可选，如需认证）**

```sql
-- 启用 RLS
alter table cities enable row level security;
alter table salaries enable row level security;
alter table results enable row level security;

-- 允许公开访问（MVP 阶段）
create policy "Allow public access to cities" on cities for select using (true);
create policy "Allow public insert to cities" on cities for insert with check (true);
create policy "Allow public update to cities" on cities for all using (true);

create policy "Allow public access to salaries" on salaries for select using (true);
create policy "Allow public insert to salaries" on salaries for insert with check (true);
create policy "Allow public update to salaries" on salaries for all using (true);

create policy "Allow public access to results" on results for select using (true);
create policy "Allow public insert to results" on results for insert with check (true);
create policy "Allow public delete to results" on results for all using (true);
```

- [ ] **Step 3: 在本地项目中记录 SQL**

创建 `docs/database-schema.sql` 并保存上述 SQL

- [ ] **Step 4: 提交**

```bash
git add docs/database-schema.sql
git commit -m "docs: add Supabase database schema"
```

---

## Task 18: 配置 Supabase 环境变量

**目标：** 配置本地和 Supabase 项目连接

- [ ] **Step 1: 获取 Supabase 凭证**

1. 登录 Supabase 控制台
2. 进入你的项目
3. Settings → API
4. 复制以下信息：
   - Project URL
   - anon public key

- [ ] **Step 2: 更新 .env.local**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 3: 验证连接**

```bash
npm run dev
```

访问 http://localhost:3000，确认页面正常加载

- [ ] **Step 4: 提交 .env.local 示例**

创建 `.env.local.example`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- [ ] **Step 5: 提交**

```bash
git add .env.local.example
git commit -m "docs: add environment variable example"
```

---

## Task 19: 本地测试

**目标：** 完整测试应用功能

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 准备测试 Excel 文件**

创建包含以下内容的测试文件：

**Sheet 1 (cities):**
| city_name | year | base_min | base_max | rate |
|-----------|------|----------|----------|------|
| 佛山 | 2024 | 4900 | 26421 | 0.145 |
| 广州 | 2024 | 5284 | 26421 | 0.145 |

**Sheet 2 (salaries):**
| employee_id | employee_name | month | salary_amount |
|-------------|---------------|-------|---------------|
| E001 | 张三 | 202401 | 8000 |
| E001 | 张三 | 202402 | 8500 |
| E001 | 张三 | 202403 | 9000 |
| E002 | 李四 | 202401 | 12000 |
| E002 | 李四 | 202402 | 12500 |

- [ ] **Step 3: 测试上传功能**

1. 访问 http://localhost:3000/upload
2. 上传测试 Excel
3. 验证成功提示

- [ ] **Step 4: 测试计算功能**

1. 选择城市（如：佛山 (2024)）
2. 点击"执行计算"
3. 验证计算结果

- [ ] **Step 5: 测试结果展示**

1. 访问 http://localhost:3000/results
2. 验证表格数据正确
3. 验证计算逻辑：
   - 张三月均工资: (8000+8500+9000)/3 = 8500
   - 缴费基数: 8500 (在 4900-26421 之间)
   - 公司缴费: 8500 × 0.145 = 1232.50

- [ ] **Step 6: 修复发现的问题（如有）**

记录并修复任何 bug

- [ ] **Step 7: 提交**

```bash
git add -A
git commit -m "test: complete local testing and bug fixes"
```

---

## Task 20: 生产部署

**目标：** 部署到 Vercel

- [ ] **Step 1: 推送代码到 GitHub**

```bash
git push -u origin master
```

- [ ] **Step 2: 在 Vercel 导入项目**

1. 访问 https://vercel.com
2. 点击 "Add New Project"
3. 从 GitHub 导入仓库
4. 配置环境变量：
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY

- [ ] **Step 3: 部署**

点击 "Deploy"

- [ ] **Step 4: 验证部署**

访问部署的 URL，测试所有功能

- [ ] **Step 5: 提交**

```bash
git commit --allow-empty -m "deploy: deployed to Vercel"
```

---

## 完成检查

- [ ] 所有 API 正常工作
- [ ] 上传功能正常
- [ ] 计算逻辑正确
- [ ] 结果展示正常
- [ ] 响应式设计（移动端可用）
- [ ] 错误处理完善
- [ ] 已部署到生产环境

---

**计划完成！** 按顺序执行上述任务即可完成整个项目的开发。
