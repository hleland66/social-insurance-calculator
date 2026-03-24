// app/upload/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TwoColumnUploadSection } from '@/components/TwoColumnUploadSection';
import { CitySelector } from '@/components/CitySelector';

export default function UploadPage() {
  const router = useRouter();
  const [selectedCitiesFile, setSelectedCitiesFile] = useState<File | null>(null);
  const [selectedSalariesFile, setSelectedSalariesFile] = useState<File | null>(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [uploadingCities, setUploadingCities] = useState(false);
  const [uploadingSalaries, setUploadingSalaries] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const citySelectorRef = useRef<{ refresh: () => void }>(null);

  const handleCitiesFileSelect = (file: File) => {
    setSelectedCitiesFile(file);
    setMessage(null);
  };

  const handleSalariesFileSelect = (file: File) => {
    setSelectedSalariesFile(file);
    setMessage(null);
  };

  const handleUploadCities = async () => {
    if (!selectedCitiesFile) {
      setMessage({ type: 'error', text: '请先选择城市标准文件' });
      return;
    }

    setUploadingCities(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedCitiesFile);

      const res = await fetch('/api/cities/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `城市标准上传成功！共 ${data.data.citiesInserted} 条记录`,
        });
        setSelectedCitiesFile(null);
        citySelectorRef.current?.refresh();
      } else {
        setMessage({ type: 'error', text: data.error || '上传失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请重试' });
    } finally {
      setUploadingCities(false);
    }
  };

  const handleUploadSalaries = async () => {
    if (!selectedSalariesFile) {
      setMessage({ type: 'error', text: '请先选择工资数据文件' });
      return;
    }

    setUploadingSalaries(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedSalariesFile);

      const res = await fetch('/api/salaries/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `工资数据上传成功！共 ${data.data.salariesInserted} 条记录`,
        });
        setSelectedSalariesFile(null);
      } else {
        setMessage({ type: 'error', text: data.error || '上传失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请重试' });
    } finally {
      setUploadingSalaries(false);
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
        // 计算成功，跳转到结果页
        router.push('/results');
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
      <div className="max-w-4xl mx-auto py-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
        >
          ← 返回首页
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">数据上传与操作</h1>
          <p className="text-gray-600">上传Excel文件并执行计算</p>
        </div>

        {/* 两栏上传区域 */}
        <TwoColumnUploadSection
          onCitiesFileSelect={handleCitiesFileSelect}
          onSalariesFileSelect={handleSalariesFileSelect}
          selectedCitiesFile={selectedCitiesFile}
          selectedSalariesFile={selectedSalariesFile}
          onUploadCities={handleUploadCities}
          onUploadSalaries={handleUploadSalaries}
          uploadingCities={uploadingCities}
          uploadingSalaries={uploadingSalaries}
          disabled={calculating}
        />

        {/* 计算区域 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🧮 计算操作
          </h2>

          <CitySelector
            ref={citySelectorRef}
            value={selectedCity}
            onChange={setSelectedCity}
          />

          <button
            onClick={handleCalculate}
            disabled={!selectedCity || uploadingCities || uploadingSalaries || calculating}
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
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
