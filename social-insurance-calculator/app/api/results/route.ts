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
