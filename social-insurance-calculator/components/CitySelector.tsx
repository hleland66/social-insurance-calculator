// components/CitySelector.tsx
'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { CityOption } from '@/types';

interface CitySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export interface CitySelectorRef {
  refresh: () => void;
}

export const CitySelector = forwardRef<CitySelectorRef, CitySelectorProps>(
  ({ value, onChange }, ref) => {
    const [cities, setCities] = useState<CityOption[]>([]);
    const [loading, setLoading] = useState(true);

    useImperativeHandle(ref, () => ({
      refresh: fetchCities,
    }));

    useEffect(() => {
      fetchCities();
    }, []);

    const fetchCities = async () => {
      try {
        const res = await fetch('/api/cities');
        const data = await res.json();
        if (data.success) {
          setCities(data.data.cities);
        }
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      } finally {
        setLoading(false);
      }
    };

    // 生成选项值：city_name|year
    const options = cities.map(c => ({
      label: `${c.city_name} (${c.year})`,
      value: `${c.city_name}|${c.year}`,
    }));

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选择城市
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading || cities.length === 0}
          className="
            w-full px-4 py-2 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
          "
        >
          <option value="">
            {loading ? '加载中...' : cities.length === 0 ? '请先上传数据' : '请选择城市'}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

CitySelector.displayName = 'CitySelector';
