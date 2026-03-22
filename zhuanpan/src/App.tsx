// src/App.tsx
import React, { useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DEFAULT_STATE } from './lib/defaults';
import { assignOptionColors } from './lib/themes';
import { exporter } from './lib/exporter';
import { ConfigView } from './components/ConfigView';
import { PlayView } from './components/PlayView';
import type { AppState } from './types';

function App() {
  const [state, setState] = useLocalStorage<AppState>('spinner-state', DEFAULT_STATE);

  // 应用主题到 document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  // 处理选项颜色变化（当选项或主题变化时）
  useEffect(() => {
    setState(prev => ({
      ...prev,
      options: assignOptionColors(prev.options, prev.theme)
    }));
  }, [state.theme]);

  const handleExport = async () => {
    await exporter.export(state);
  };

  return (
    <div data-theme={state.theme}>
      {state.viewMode === 'edit' ? (
        <ConfigView
          state={state}
          setState={setState}
          onExport={handleExport}
        />
      ) : (
        <PlayView
          state={state}
          setState={setState}
          onBack={() => setState(prev => ({ ...prev, viewMode: 'edit' }))}
        />
      )}
    </div>
  );
}

export default App;
