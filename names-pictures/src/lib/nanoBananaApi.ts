import type { CreateTaskRequest, CreateTaskResponse, TaskDetailResponse } from '@/types';
import { CONFIG } from './config';

const API_BASE = CONFIG.apiUrl;

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CONFIG.apiKey}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function createGenerationTask(prompt: string): Promise<string> {
  const payload: CreateTaskRequest = {
    model: CONFIG.model,
    input: {
      prompt,
      aspect_ratio: CONFIG.aspectRatio,
      resolution: CONFIG.resolution,
      output_format: CONFIG.outputFormat,
    },
  };

  const response = await apiRequest<CreateTaskResponse>(
    '/api/v1/jobs/createTask',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  if (response.code !== 200) {
    throw new Error(`Failed to create task: code ${response.code}`);
  }

  return response.data.taskId;
}

export async function getTaskDetail(taskId: string): Promise<TaskDetailResponse['data']> {
  const response = await apiRequest<TaskDetailResponse>(
    `/api/v1/jobs/getTaskDetail?taskId=${taskId}`
  );

  if (response.code !== 200) {
    throw new Error(`Failed to get task detail: code ${response.code}`);
  }

  return response.data;
}

export async function pollTaskCompletion(
  taskId: string,
  onProgress?: (status: string) => void
): Promise<string> {
  const startTime = Date.now();

  while (Date.now() - startTime < CONFIG.maxPollTime) {
    const detail = await getTaskDetail(taskId);

    if (onProgress) {
      onProgress(detail.status);
    }

    if (detail.status === 'completed') {
      if (!detail.result?.imageUrl) {
        throw new Error('Task completed but no image URL returned');
      }
      return detail.result.imageUrl;
    }

    if (detail.status === 'failed') {
      throw new Error('Task generation failed');
    }

    // 等待后重试
    await new Promise(resolve => setTimeout(resolve, CONFIG.pollInterval));
  }

  throw new Error('Task polling timeout');
}
