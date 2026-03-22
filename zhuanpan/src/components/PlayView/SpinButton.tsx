// src/components/PlayView/SpinButton.tsx

interface SpinButtonProps {
  isSpinning: boolean;
  canStart: boolean;
  onSpin: () => void;
}

export function SpinButton({ isSpinning, canStart, onSpin }: SpinButtonProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
      <button
        onClick={onSpin}
        disabled={isSpinning || !canStart}
        style={{
          padding: '15px 50px',
          fontSize: '1.2rem',
          fontWeight: '600',
          background: isSpinning || !canStart ? '#ccc' : '#6c5ce7',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          cursor: isSpinning || !canStart ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {isSpinning ? '转动中...' : '开始抽奖'}
      </button>
    </div>
  );
}
