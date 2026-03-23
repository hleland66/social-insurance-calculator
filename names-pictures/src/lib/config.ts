export const CONFIG = {
  // V-API 配置
  model: 'nano-banana-pro-4k',  // gemini-3-pro-image-preview, 4K resolution
  size: '4K',                    // gemini-3+ uses K values
  aspectRatio: '3:4',            // A4 竖版比例
  responseFormat: 'url',         // url or b64_json

  // 本地存储 key
  STORAGE_KEY: 'literacy_news_history',

  // 历史记录限制
  MAX_HISTORY: 50,

  // API 配置
  apiUrl: process.env.V_API_URL || 'https://api.gpt.ge',
  apiKey: process.env.V_API_KEY || '',
};
