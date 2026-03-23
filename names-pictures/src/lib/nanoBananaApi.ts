import type { ImageGenerationRequest, ImageGenerationResponse } from '@/types';
import { CONFIG } from './config';

const API_BASE = CONFIG.apiUrl;

async function apiRequest<T>(endpoint: string, apiKey: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function generateImage(prompt: string, apiKey: string): Promise<string> {
  const payload: ImageGenerationRequest = {
    model: CONFIG.model,
    prompt,
    size: CONFIG.size,
    aspect_ratio: CONFIG.aspectRatio,
    response_format: CONFIG.responseFormat as 'url' | 'b64_json',
  };

  const response = await apiRequest<ImageGenerationResponse>(
    '/v1/images/generations',
    apiKey,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  // V-API 直接返回图片 URL
  if (!response.data?.[0]?.url) {
    throw new Error('No image URL returned');
  }

  return response.data[0].url;
}
