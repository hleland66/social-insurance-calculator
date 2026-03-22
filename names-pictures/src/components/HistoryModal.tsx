'use client';

import type { HistoryItem } from '@/types';

interface HistoryModalProps {
  isOpen: boolean;
  items: HistoryItem[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onSelect: (item: HistoryItem) => void;
}

export default function HistoryModal({
  isOpen,
  items,
  onClose,
  onDelete,
  onClear,
  onSelect,
}: HistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-700">📚 历史记录</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-4">📭</p>
              <p>暂无历史记录</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="card p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onSelect(item)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-bold text-gray-700">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.theme}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(item.createdAt).toLocaleString('zh-CN')}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="mt-2 text-sm text-red-400 hover:text-red-600"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={onClear}
              className="w-full py-2 text-red-400 hover:text-red-600 transition-colors"
            >
              清空历史记录
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
