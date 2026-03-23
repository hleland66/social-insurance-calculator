// lib/calculator.ts
import type { City, Salary, Result } from '@/types';

export class Calculator {
  /**
   * 计算所有员工的社保缴费
   */
  static calculate(salaries: Salary[], city: City): Result[] {
    // 按员工分组
    const groupedSalaries = this.groupByEmployee(salaries);

    // 获取城市对应的年份
    const cityYear = city.year;

    // 过滤该年份的工资数据
    const filteredSalaries = this.filterByYear(groupedSalaries, cityYear);

    // 计算每个员工的结果
    const results: Result[] = [];

    for (const [employeeId, employeeSalaries] of Object.entries(filteredSalaries)) {
      if (employeeSalaries.length === 0) continue;

      const employeeName = employeeSalaries[0].employee_name;

      // 计算月平均工资
      const avgSalary = this.calculateAvgSalary(employeeSalaries);

      // 计算缴费基数
      const contributionBase = this.calculateContributionBase(
        avgSalary,
        city.base_min,
        city.base_max
      );

      // 计算公司缴费
      const companyFee = this.calculateCompanyFee(contributionBase, city.rate);

      results.push({
        employee_id: employeeId,
        employee_name: employeeName,
        city_name: city.city_name,
        year: city.year,
        avg_salary: this.round(avgSalary),
        contribution_base: this.round(contributionBase),
        company_fee: this.round(companyFee),
      });
    }

    return results;
  }

  /**
   * 按员工编号分组
   */
  private static groupByEmployee(salaries: Salary[]): Record<string, Salary[]> {
    const grouped: Record<string, Salary[]> = {};

    for (const salary of salaries) {
      if (!grouped[salary.employee_id]) {
        grouped[salary.employee_id] = [];
      }
      grouped[salary.employee_id].push(salary);
    }

    return grouped;
  }

  /**
   * 过滤指定年份的工资数据
   */
  private static filterByYear(
    groupedSalaries: Record<string, Salary[]>,
    year: string
  ): Record<string, Salary[]> {
    const filtered: Record<string, Salary[]> = {};

    for (const [employeeId, salaryList] of Object.entries(groupedSalaries)) {
      filtered[employeeId] = salaryList.filter(s => {
        // 从月份中提取年份 (YYYYMM -> YYYY)
        const salaryYear = s.month.substring(0, 4);
        return salaryYear === year;
      });
    }

    return filtered;
  }

  /**
   * 计算月平均工资
   */
  private static calculateAvgSalary(salaries: Salary[]): number {
    const sum = salaries.reduce((acc, s) => acc + s.salary_amount, 0);
    return sum / salaries.length;
  }

  /**
   * 计算缴费基数
   */
  private static calculateContributionBase(
    avgSalary: number,
    baseMin: number,
    baseMax: number
  ): number {
    if (avgSalary < baseMin) return baseMin;
    if (avgSalary > baseMax) return baseMax;
    return avgSalary;
  }

  /**
   * 计算公司缴费
   */
  private static calculateCompanyFee(contributionBase: number, rate: number): number {
    return contributionBase * rate;
  }

  /**
   * 保留两位小数
   */
  private static round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
