import { NextRequest, NextResponse } from 'next/server';
import { createGenerationTask } from '@/lib/nanoBananaApi';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt' },
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
