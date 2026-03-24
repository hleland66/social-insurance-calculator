// app/api/salaries/upload/route.ts
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

    // 验证文件大小 (限制 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: '文件不能为空' },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: '文件大小不能超过 5MB' },
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

    // 解析 Excel（仅 salaries）
    const salaries = await ExcelParser.parseSalariesFile(file);

    if (salaries.length === 0) {
      return NextResponse.json(
        { success: false, error: '未找到有效的工资数据，请检查表格格式' },
        { status: 400 }
      );
    }

    // 写入数据库
    const salariesInserted = await db.upsertSalaries(salaries);

    return NextResponse.json({
      success: true,
      data: {
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
