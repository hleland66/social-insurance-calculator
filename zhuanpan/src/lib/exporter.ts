// src/lib/exporter.ts
import type { AppState } from '@/types';

export class SingleFileExporter {
  async export(state: AppState): Promise<void> {
    // 读取模板
    const template = await this.loadTemplate();
    const injected = this.injectState(template, state);
    const embedded = await this.embedAssets(injected);

    // 下载文件
    const blob = new Blob([embedded], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `转盘-${state.title}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private async loadTemplate(): Promise<string> {
    // 使用公共的模板文件
    const response = await fetch('/index.html.template');
    if (!response.ok) {
      throw new Error('Failed to load template');
    }
    return await response.text();
  }

  private injectState(template: string, state: AppState): string {
    const stateScript = `<script>window.__INITIAL_STATE__=${JSON.stringify(state)}<\/script>`;
    return template.replace('<!-- __STATE_INJECT_POINT__ -->', stateScript);
  }

  private async fileToBase64(path: string): Promise<string> {
    try {
      const response = await fetch(path);
      if (!response.ok) return '';
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn('Failed to load asset:', path);
      return '';
    }
  }

  private async embedAssets(html: string): Promise<string> {
    try {
      const spinBase64 = await this.fileToBase64('/spin.mp3');
      const winBase64 = await this.fileToBase64('/win.mp3');

      let result = html;
      if (spinBase64) {
        result = result.replace('src="/spin.mp3"', `src="${spinBase64}"`);
      }
      if (winBase64) {
        result = result.replace('src="/win.mp3"', `src="${winBase64}"`);
      }
      return result;
    } catch (e) {
      console.warn('Failed to embed assets:', e);
      return html;
    }
  }
}

export const exporter = new SingleFileExporter();
