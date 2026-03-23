// app/upload/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileUploader } from '@/components/FileUploader';
import { CitySelector } from '@/components/CitySelector';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [uploading, setUploading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setMessage(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: '请先选择文件' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `上传成功！城市: ${data.data.citiesInserted} 条，工资: ${data.data.salariesInserted} 条`,
        });
        setSelectedFile(null);
        // 刷新城市列表
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: data.error || '上传失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请重试' });
    } finally {
      setUploading(false);
    }
  };

  const handleCalculate = async () => {
    if (!selectedCity) {
      setMessage({ type: 'error', text: '请先选择城市' });
      return;
    }

    const [cityName, year] = selectedCity.split('|');

    setCalculating(true);
    setMessage(null);

    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city_name: cityName, year }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `计算成功！共 ${data.data.calculated} 名员工`,
        });
      } else {
        setMessage({ type: 'error', text: data.error || '计算失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请重试' });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
        >
          ← 返回首页
        </Link>

        <h1 className="text-3xl font-bold text-blue-900 mb-8">数据上传与计算</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <FileUploader
            onFileSelect={handleFileSelect}
            loading={uploading || calculating}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading || calculating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {uploading ? '上传中...' : '上传数据'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <CitySelector value={selectedCity} onChange={setSelectedCity} />

          <button
            onClick={handleCalculate}
            disabled={!selectedCity || uploading || calculating}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {calculating ? '计算中...' : '执行计算'}
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </main>
  );
}
