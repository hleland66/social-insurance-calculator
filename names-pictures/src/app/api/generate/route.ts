import { NextRequest, NextResponse } from 'next/server';
import { createGenerationTask } from '@/lib/nanoBananaApi';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt' },
        { status: 400 }
      );
    }

    if (prompt.length > 20000) {
      return NextResponse.json(
        { error: 'Prompt too long (max 20000 characters)' },
        { status: 400 }
      );
    }

    // 创建生成任务
    const taskId = await createGenerationTask(prompt);

    // 返回任务 ID，客户端将轮询结果
    return NextResponse.json({
      code: 200,
      data: { taskId }
    });

  } catch (error) {
    console.error('Generate API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { code: 500, error: errorMessage },
      { status: 500 }
    );
  }
}
