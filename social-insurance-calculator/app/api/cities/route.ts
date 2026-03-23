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
