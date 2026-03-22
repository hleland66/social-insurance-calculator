// src/components/PlayView/BackToEditButton.tsx
import React from 'react';

interface BackToEditButtonProps {
  onBack: () => void;
  isSpinning: boolean;
}

export function BackToEditButton({ onBack, isSpinning }: BackToEditButtonProps) {
  return (
    <button
      onClick={onBack}
      disabled={isSpinning}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '10px 15px',
        background: 'white',
        border: '2px solid #ddd',
        borderRadius: '10px',
        cursor: isSpinning ? 'not-allowed' : 'pointer',
        opacity: isSpinning ? 0.5 : 1,
        zIndex: 100,
      }}
    >
      ⚙️ 编辑
    </button>
  );
}
