// components/ResultTable.tsx
'use client';

import type { Result } from '@/types';

interface ResultTableProps {
  results: Result[];
  loading?: boolean;
}

export function ResultTable({ results, loading }: ResultTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>暂无数据</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">员工编号</th>
            <th className="px-4 py-3 text-left text-sm font-medium">姓名</th>
            <th className="px-4 py-3 text-left text-sm font-medium">城市</th>
            <th className="px-4 py-3 text-left text-sm font-medium">年份</th>
            <th className="px-4 py-3 text-right text-sm font-medium">月均工资</th>
            <th className="px-4 py-3 text-right text-sm font-medium">缴费基数</th>
            <th className="px-4 py-3 text-right text-sm font-medium">公司缴费</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {results.map((result, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">{result.employee_id}</td>
              <td className="px-4 py-3 text-sm">{result.employee_name}</td>
              <td className="px-4 py-3 text-sm">{result.city_name}</td>
              <td className="px-4 py-3 text-sm">{result.year}</td>
              <td className="px-4 py-3 text-sm text-right">
                ¥{result.avg_salary.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-right">
                ¥{result.contribution_base.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">
                ¥{result.company_fee.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
