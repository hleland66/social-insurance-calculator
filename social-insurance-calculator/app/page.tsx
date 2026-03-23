// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          五险一金计算器
        </h1>
        <p className="text-gray-600 mb-12">
          社保缴费基数与公司费用计算
        </p>

        <div className="space-y-4">
          <Link
            href="/upload"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200"
          >
            上传数据
          </Link>
          <Link
            href="/results"
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200"
          >
            查看结果
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-12">
          仅支持同一城市批量计算
        </p>
      </div>
    </main>
  );
}
