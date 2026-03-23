import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/nanoBananaApi';

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

    const { prompt, apiKey } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt' },
        { status: 400 }
      );
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API Key is required. Please configure it in settings.' },
        { status: 400 }
      );
    }

    if (prompt.length > 32768) {
      return NextResponse.json(
        { error: 'Prompt too long (max 32768 tokens)' },
        { status: 400 }
      );
    }

    // V-API 直接返回图片 URL
    const imageUrl = await generateImage(prompt, apiKey);

    return NextResponse.json({
      code: 200,
      data: { imageUrl }
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
