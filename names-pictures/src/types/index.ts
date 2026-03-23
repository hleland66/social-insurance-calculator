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
  resultUrl: string | null;
  error: string | null;
}

// V-API 请求
export interface ImageGenerationRequest {
  model: string;
  prompt: string;
  size: string;
  aspect_ratio?: string;
  response_format?: 'url' | 'b64_json';
}

// V-API 响应
export interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}
