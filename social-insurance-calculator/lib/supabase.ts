// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库表操作辅助函数
export const db = {
  // Cities
  async getCities() {
    const { data, error } = await supabase
      .from('cities')
      .select('city_name, year')
      .order('city_name');
    if (error) throw error;
    return data;
  },

  async upsertCities(cities: any[]) {
    if (cities.length === 0) return [];

    // 批量删除同名同年的记录 (收集所有需要删除的组合)
    const deleteConditions = cities.map(c => ({
      city_name: c.city_name,
      year: c.year,
    }));

    // 使用 or 条件批量删除
    const { error: deleteError } = await supabase
      .from('cities')
      .delete()
      .or(deleteConditions.map(c => `and(city_name.eq.${c.city_name},year.eq.${c.year})`).join(','));
    if (deleteError) throw deleteError;

    // 批量插入新记录
    const { data, error } = await supabase
      .from('cities')
      .insert(cities)
      .select();
    if (error) throw error;
    return data;
  },

  async getCity(cityName: string, year: string) {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('city_name', cityName)
      .eq('year', year)
      .single();
    if (error) throw error;
    return data;
  },

  // Salaries
  async upsertSalaries(salaries: any[]) {
    if (salaries.length === 0) return [];

    // 批量删除同名同月的记录
    const deleteConditions = salaries.map(s => ({
      employee_id: s.employee_id,
      month: s.month,
    }));

    // 分批处理 (Supabase 对 or 查询有限制，每批最多 50 条)
    const BATCH_SIZE = 50;
    for (let i = 0; i < deleteConditions.length; i += BATCH_SIZE) {
      const batch = deleteConditions.slice(i, i + BATCH_SIZE);
      const { error: deleteError } = await supabase
        .from('salaries')
        .delete()
        .or(batch.map(s => `and(employee_id.eq.${s.employee_id},month.eq.${s.month})`).join(','));
      if (deleteError) throw deleteError;
    }

    // 批量插入新记录
    const { data, error } = await supabase
      .from('salaries')
      .insert(salaries)
      .select();
    if (error) throw error;
    return data;
  },

  async getSalaries() {
    const { data, error } = await supabase
      .from('salaries')
      .select('*')
      .order('employee_id, month');
    if (error) throw error;
    return data;
  },

  // Results
  async clearResults() {
    const { error } = await supabase
      .from('results')
      .delete()
      .neq('id', 0); // 删除所有记录
    if (error) throw error;
  },

  async insertResults(results: any[]) {
    const { data, error } = await supabase
      .from('results')
      .insert(results)
      .select();
    if (error) throw error;
    return data;
  },

  async getResults() {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .order('employee_id');
    if (error) throw error;
    return data;
  },
};
