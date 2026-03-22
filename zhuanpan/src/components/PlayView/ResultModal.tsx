// src/components/PlayView/ResultModal.tsx

interface ResultModalProps {
  result: string | null;
  onClose: () => void;
  onReplay: () => void;
}

export function ResultModal({ result, onClose, onReplay }: ResultModalProps) {
  if (!result) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        textAlign: 'center',
        animation: 'popIn 0.3s ease',
      }}>
        <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>🎉 结果</h2>
        <p style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#6c5ce7',
          marginBottom: '30px',
        }}>
          {result}
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={onReplay}
            style={{
              padding: '12px 25px',
              background: '#6c5ce7',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            再转一次
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 25px',
              background: '#ddd',
              color: '#333',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            关闭
          </button>
        </div>
      </div>
      <style>{`
        @keyframes popIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
