// src/components/ConfigView/index.tsx
import React from 'react';
import { AppState } from '@/types';
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
      <ExportButton onExport={onExport} />
    </div>
  );
}
