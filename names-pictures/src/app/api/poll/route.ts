import { NextRequest, NextResponse } from 'next/server';
import { getTaskDetail } from '@/lib/nanoBananaApi';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Missing taskId' },
        { status: 400 }
      );
    }

    const detail = await getTaskDetail(taskId);

    return NextResponse.json({
      code: 200,
      data: detail
    });

  } catch (error) {
    console.error('Poll API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { code: 500, error: errorMessage },
      { status: 500 }
    );
  }
}
