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
