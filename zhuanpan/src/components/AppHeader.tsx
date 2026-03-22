// src/components/AppHeader.tsx

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header style={{
      textAlign: 'center',
      padding: '20px',
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      fontWeight: '600',
    }}>
      {title}
    </header>
  );
}
