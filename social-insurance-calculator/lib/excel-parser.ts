// lib/excel-parser.ts
import * as xlsx from 'xlsx';
import type { City, Salary, ExcelData } from '@/types';

export class ExcelParser {
  /**
   * 解析 Excel 文件并返回数据
   */
  static async parse(file: File): Promise<ExcelData> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = xlsx.read(arrayBuffer, { type: 'array' });

    // 检查必要的 Sheet
    if (!workbook.SheetNames.includes('cities')) {
      throw new Error('Excel 必须包含 cities 工作表');
    }
    if (!workbook.SheetNames.includes('salaries')) {
      throw new Error('Excel 必须包含 salaries 工作表');
    }

    // 解析 cities
    const cities = this.parseCities(workbook.Sheets['cities']);

    // 解析 salaries
    const salaries = this.parseSalaries(workbook.Sheets['salaries']);

    return { cities, salaries };
  }

  /**
   * 解析 cities 工作表
   */
  private static parseCities(sheet: xlsx.WorkSheet): City[] {
    const data = xlsx.utils.sheet_to_json(sheet);

    return data.map((row: any) => ({
      city_name: String(row.city_name || row['城市名称'] || '').trim(),
      year: String(row.year || row['年份'] || '').trim(),
      base_min: Number(row.base_min || row['基数下限'] || 0),
      base_max: Number(row.base_max || row['基数上限'] || 0),
      rate: Number(row.rate || row['缴费比例'] || 0),
    })).filter(city => {
      // 验证必要字段
      if (!city.city_name || !city.year) return false;
      if (city.base_min <= 0 || city.base_max <= 0 || city.rate <= 0) return false;
      return true;
    });
  }

  /**
   * 解析单独的城市标准文件
   */
  static async parseCitiesFile(file: File): Promise<City[]> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = xlsx.read(arrayBuffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return this.parseCities(sheet);
  }

  /**
   * 解析单独的工资数据文件
   */
  static async parseSalariesFile(file: File): Promise<Salary[]> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = xlsx.read(arrayBuffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return this.parseSalaries(sheet);
  }

  /**
   * 解析 salaries 工作表
   */
  private static parseSalaries(sheet: xlsx.WorkSheet): Salary[] {
    const data = xlsx.utils.sheet_to_json(sheet);

    return data.map((row: any) => ({
      employee_id: String(row.employee_id || row['员工编号'] || '').trim(),
      employee_name: String(row.employee_name || row['员工姓名'] || '').trim(),
      month: String(row.month || row['月份'] || '').trim(),
      salary_amount: Number(row.salary_amount || row['工资金额'] || 0),
    })).filter(salary => {
      // 验证必要字段
      if (!salary.employee_id || !salary.employee_name || !salary.month) return false;
      if (salary.salary_amount <= 0) return false;
      // 验证月份格式 YYYYMM
      if (!/^\d{6}$/.test(salary.month)) return false;
      return true;
    });
  }
}
