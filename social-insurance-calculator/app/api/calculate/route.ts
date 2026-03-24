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

    // 验证输入格式
    if (typeof city_name !== 'string' || city_name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '城市名称格式不正确' },
        { status: 400 }
      );
    }

    if (typeof year !== 'string' || !/^\d{4}$/.test(year)) {
      return NextResponse.json(
        { success: false, error: '年份格式不正确，应为四位数字（如：2024）' },
        { status: 400 }
      );
    }

    // 清理输入
    const trimmedCityName = city_name.trim();
    const trimmedYear = year.trim();

    // 获取城市标准
    const city = await db.getCity(trimmedCityName, trimmedYear);

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
