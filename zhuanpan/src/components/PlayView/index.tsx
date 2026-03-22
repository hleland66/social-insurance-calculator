// src/components/PlayView/index.tsx
import { useState, useEffect } from 'react';
import type { AppState } from '@/types';
import { SpinnerCanvas } from './SpinnerCanvas';
import { SpinButton } from './SpinButton';
import { ResultModal } from './ResultModal';
import { BackToEditButton } from './BackToEditButton';
import { useSpinner } from '@/hooks/useSpinner';
import { useSound } from '@/hooks/useSound';

interface PlayViewProps {
  state: AppState;
  onBack: () => void;
}

export function PlayView({ state, onBack }: PlayViewProps) {
  const [showResult, setShowResult] = useState(false);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);

  // 从 useSpinner 获取 rotation 状态
  const { isSpinning, lastResult, rotation, canvasRef, spin, canStartPlay } = useSpinner(state.options);
  const { playSpin, stopSpin, playWin } = useSound(state.soundEnabled);

  // 同步 canvas ref
  useEffect(() => {
    if (canvasEl && canvasRef.current !== canvasEl) {
      canvasRef.current = canvasEl;
    }
  }, [canvasEl, canvasRef]);

  const handleSpin = async () => {
    if (!canStartPlay || isSpinning) return;
    playSpin();
    await spin();
    stopSpin();
    playWin();
    setShowResult(true);
  };

  const handleReplay = () => {
    setShowResult(false);
    handleSpin();
  };

  const handleCloseResult = () => {
    setShowResult(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <BackToEditButton onBack={onBack} isSpinning={isSpinning} />

      <h1 style={{
        fontSize: 'clamp(1.5rem, 5vw, 3rem)',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        {state.title}
      </h1>

      <SpinnerCanvas
        options={state.options}
        rotation={rotation}
        onCanvasRef={setCanvasEl}
      />

      <SpinButton
        isSpinning={isSpinning}
        canStart={canStartPlay}
        onSpin={handleSpin}
      />

      {!canStartPlay && (
        <p style={{ color: '#ff6b6b', marginTop: '10px' }}>
          请确保至少有 2 个有效选项
        </p>
      )}

      <ResultModal
        result={showResult ? lastResult : null}
        onClose={handleCloseResult}
        onReplay={handleReplay}
      />
    </div>
  );
}
