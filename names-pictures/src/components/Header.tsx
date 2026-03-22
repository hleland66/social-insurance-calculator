'use client';

interface HeaderProps {
  onOpenHistory: () => void;
  historyCount: number;
}

export default function Header({ onOpenHistory, historyCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎨</span>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            儿童识字小报生成器
          </h1>
        </div>

        <button
          onClick={onOpenHistory}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
        >
          <span className="text-lg">📚</span>
          <span className="hidden sm:inline">历史记录</span>
          {historyCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-secondary text-white">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
