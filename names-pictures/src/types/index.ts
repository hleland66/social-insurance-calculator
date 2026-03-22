// 应用步骤
export type AppStep = 'input' | 'preview' | 'generating' | 'result';

// 词汇条目
export interface VocabularyEntry {
  category: 'core' | 'items' | 'env';
  pinyin: string;
  hanzi: string;
}

// 词汇主题
export interface VocabularyTheme {
  core: string[];
  items: string[];
  env: string[];
}

// 历史记录项
export interface HistoryItem {
  id: string;
  theme: string;
  title: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
}

// 应用状态
export interface AppState {
  currentStep: AppStep;
  theme: string;
  title: string;
  vocabulary: VocabularyEntry[];
  generatedPrompt: string;
  taskId: string | null;
  resultUrl: string | null;
  error: string | null;
}

// Nano Banana API 请求
export interface CreateTaskRequest {
  model: string;
  input: {
    prompt: string;
    aspect_ratio: string;
    resolution: string;
    output_format: string;
  };
}

// Nano Banana API 响应
export interface CreateTaskResponse {
  code: number;
  data: {
    taskId: string;
  };
}

export interface TaskDetailResponse {
  code: number;
  data: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: {
      imageUrl: string;
    };
  };
}
