// src/components/ConfigView/TitleInput.tsx

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TitleInput({ value, onChange }: TitleInputProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 20))}
        placeholder="今天决定点什么？"
        maxLength={20}
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '1.2rem',
          border: '2px solid #ddd',
          borderRadius: '12px',
          textAlign: 'center',
          outline: 'none',
        }}
      />
    </div>
  );
}
