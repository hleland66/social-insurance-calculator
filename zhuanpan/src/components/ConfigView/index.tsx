// src/components/ConfigView/index.tsx
import type { AppState } from '@/types';
import { canStartPlay } from '@/lib/spinner';
import { TitleInput } from './TitleInput';
import { OptionList } from './OptionList';
import { ThemeSelector } from './ThemeSelector';
import { ExportButton } from './ExportButton';

interface ConfigViewProps {
  state: AppState;
  setState: (state: AppState | ((s: AppState) => AppState)) => void;
  onExport: () => void;
}

export function ConfigView({ state, setState, onExport }: ConfigViewProps) {
  const canStart = canStartPlay(state.options);

  const handleStartPlay = () => {
    if (canStart) {
      setState({ ...state, viewMode: 'play' });
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
    }}>
      <TitleInput
        value={state.title}
        onChange={(title) => setState({ ...state, title })}
      />
      <OptionList
        options={state.options}
        onChange={(options) => setState({ ...state, options })}
      />
      <ThemeSelector
        currentTheme={state.theme}
        onChange={(theme) => setState({ ...state, theme })}
      />

      {/* 开始游玩按钮 */}
      <button
        onClick={handleStartPlay}
        disabled={!canStart}
        style={{
          width: '100%',
          padding: '15px',
          marginBottom: '15px',
          fontSize: '1.1rem',
          fontWeight: '600',
          background: canStart ? '#6c5ce7' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: canStart ? 'pointer' : 'not-allowed',
        }}
      >
        开始游玩
      </button>

      <ExportButton onExport={onExport} />
    </div>
  );
}
