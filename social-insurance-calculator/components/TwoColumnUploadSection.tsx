'use client';

import { FileUploader } from '@/components/FileUploader';

interface TwoColumnUploadSectionProps {
  onCitiesFileSelect: (file: File) => void;
  onSalariesFileSelect: (file: File) => void;
  selectedCitiesFile: File | null;
  selectedSalariesFile: File | null;
  onUploadCities: () => void;
  onUploadSalaries: () => void;
  uploadingCities: boolean;
  uploadingSalaries: boolean;
  disabled: boolean;
}

export function TwoColumnUploadSection({
  onCitiesFileSelect,
  onSalariesFileSelect,
  selectedCitiesFile,
  selectedSalariesFile,
  onUploadCities,
  onUploadSalaries,
  uploadingCities,
  uploadingSalaries,
  disabled,
}: TwoColumnUploadSectionProps) {
  const isProcessing = uploadingCities || uploadingSalaries || disabled;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        📋 Excel文件上传
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {/* 左栏：城市社保标准 */}
        <div className="min-w-0">
          <h3 className="text-base font-medium text-gray-700 mb-3 flex items-center gap-2">
            📍 城市社保标准
          </h3>
          <FileUploader
            onFileSelect={onCitiesFileSelect}
            loading={isProcessing}
          />
          <p className="text-xs text-gray-500 mt-2">
            包含字段：城市名称、年份、基数下限、基数上限、缴费比例
          </p>
          <button
            onClick={onUploadCities}
            disabled={!selectedCitiesFile || isProcessing}
            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {uploadingCities ? '上传中...' : '上传'}
          </button>
        </div>

        {/* 右栏：员工工资数据 */}
        <div className="min-w-0">
          <h3 className="text-base font-medium text-gray-700 mb-3 flex items-center gap-2">
            💰 员工工资数据
          </h3>
          <FileUploader
            onFileSelect={onSalariesFileSelect}
            loading={isProcessing}
          />
          <p className="text-xs text-gray-500 mt-2">
            包含字段：员工编号、员工姓名、月份（YYYYMM）、工资金额
          </p>
          <button
            onClick={onUploadSalaries}
            disabled={!selectedSalariesFile || isProcessing}
            className="w-full mt-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {uploadingSalaries ? '上传中...' : '上传'}
          </button>
        </div>
      </div>
    </div>
  );
}
