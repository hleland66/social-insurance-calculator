'use client';

interface GeneratingStepProps {
  progress: number;
}

export default function GeneratingStep({ progress }: GeneratingStepProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-7xl"
            style={{
              animation: 'bounce 1s ease-in-out infinite',
            }}
          >
            ☀️
          </span>
        </div>
        <div
          className="absolute inset-0 border-4 border-dashed border-yellow-300 rounded-full"
          style={{
            animation: 'spin 3s linear infinite',
          }}
        />
      </div>

      <h2 className="text-2xl font-bold text-gray-700 mb-2">
        正在绘制中...
      </h2>
      <p className="text-gray-500 mb-6">
        AI 正在精心创作，请稍候
      </p>

      <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-sm text-gray-400 mt-3">
        预计等待 30-60 秒
      </p>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
