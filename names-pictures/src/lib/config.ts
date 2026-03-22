export const CONFIG = {
  // Nano Banana 2 配置
  model: 'nano-banana-2',
  aspectRatio: '3:4',  // A4 竖版比例
  resolution: '4K',
  outputFormat: 'png',

  // 轮询配置
  pollInterval: 2000,  // 2秒轮询一次
  maxPollTime: 120000, // 最多等待2分钟

  // 本地存储 key
  STORAGE_KEY: 'literacy_news_history',

  // 历史记录限制
  MAX_HISTORY: 50,

  // API 配置
  apiUrl: process.env.KIE_AI_API_URL || 'https://api.kie.ai',
  apiKey: process.env.KIE_AI_API_KEY || '',
};
