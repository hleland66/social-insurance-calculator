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
    // 先删除同名同年的记录
    for (const city of cities) {
      await supabase
        .from('cities')
        .delete()
        .eq('city_name', city.city_name)
        .eq('year', city.year);
    }
    // 插入新记录
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
    // 先删除同名同月的记录
    for (const salary of salaries) {
      await supabase
        .from('salaries')
        .delete()
        .eq('employee_id', salary.employee_id)
        .eq('month', salary.month);
    }
    // 插入新记录
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
