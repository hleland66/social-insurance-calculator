// types/index.ts

export interface City {
  city_name: string;
  year: string;
  base_min: number;
  base_max: number;
  rate: number;
}

export interface Salary {
  employee_id: string;
  employee_name: string;
  month: string;  // YYYYMM
  salary_amount: number;
}

export interface Result {
  employee_id: string;
  employee_name: string;
  city_name: string;
  year: string;
  avg_salary: number;
  contribution_base: number;
  company_fee: number;
}

export interface CityOption {
  city_name: string;
  year: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ExcelData {
  cities: City[];
  salaries: Salary[];
}
