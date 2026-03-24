const xlsx = require('xlsx');
const path = require('path');

// 创建测试数据
const cities = [
  {
    city_name: '佛山',
    year: '2024',
    base_min: 4900,
    base_max: 26421,
    rate: 0.145
  },
  {
    city_name: '广州',
    year: '2024',
    base_min: 5284,
    base_max: 26421,
    rate: 0.145
  },
  {
    city_name: '深圳',
    year: '2024',
    base_min: 5284,
    base_max: 26421,
    rate: 0.145
  }
];

const salaries = [
  {
    employee_id: 'E001',
    employee_name: '张三',
    month: '202401',
    salary_amount: 8000
  },
  {
    employee_id: 'E001',
    employee_name: '张三',
    month: '202402',
    salary_amount: 8500
  },
  {
    employee_id: 'E001',
    employee_name: '张三',
    month: '202403',
    salary_amount: 9000
  },
  {
    employee_id: 'E002',
    employee_name: '李四',
    month: '202401',
    salary_amount: 12000
  },
  {
    employee_id: 'E002',
    employee_name: '李四',
    month: '202402',
    salary_amount: 12500
  },
  {
    employee_id: 'E003',
    employee_name: '王五',
    month: '202401',
    salary_amount: 4500
  },
  {
    employee_id: 'E003',
    employee_name: '王五',
    month: '202402',
    salary_amount: 4800
  },
  {
    employee_id: 'E003',
    employee_name: '王五',
    month: '202403',
    salary_amount: 5000
  }
];

// 创建工作簿
const workbook = xlsx.utils.book_new();

// 创建 cities Sheet
const citiesSheet = xlsx.utils.json_to_sheet(cities);
xlsx.utils.book_append_sheet(workbook, citiesSheet, 'cities');

// 创建 salaries Sheet
const salariesSheet = xlsx.utils.json_to_sheet(salaries);
xlsx.utils.book_append_sheet(workbook, salariesSheet, 'salaries');

// 写入文件
const outputPath = path.join(__dirname, 'test-data.xlsx');
xlsx.writeFile(workbook, outputPath);

console.log('测试 Excel 文件已创建:', outputPath);
console.log('');
console.log('文件内容预览:');
console.log('====================');
console.log('');
console.log('Sheet 1: cities');
console.log('城市 | 年份 | 基数下限 | 基数上限 | 缴费比例');
console.log('---- | ---- | -------- | -------- | --------');
cities.forEach(c => {
  console.log(`${c.city_name} | ${c.year} | ${c.base_min} | ${c.base_max} | ${c.rate}`);
});
console.log('');
console.log('Sheet 2: salaries');
console.log('员工编号 | 姓名 | 月份 | 工资金额');
console.log('-------- | ---- | ---- | --------');
salaries.forEach(s => {
  console.log(`${s.employee_id} | ${s.employee_name} | ${s.month} | ${s.salary_amount}`);
});
console.log('');
console.log('预期计算结果 (佛山 2024):');
console.log('====================');
console.log('张三: 月均工资 = (8000+8500+9000)/3 = 8500');
console.log('     缴费基数 = 8500 (在 4900-26421 之间)');
console.log('     公司缴费 = 8500 × 0.145 = ¥1232.50');
console.log('');
console.log('李四: 月均工资 = (12000+12500)/2 = 12250');
console.log('     缴费基数 = 12250');
console.log('     公司缴费 = 12250 × 0.145 = ¥1776.25');
console.log('');
console.log('王五: 月均工资 = (4500+4800+5000)/3 = 4766.67');
console.log('     缴费基数 = 4900 (低于下限，使用下限)');
console.log('     公司缴费 = 4900 × 0.145 = ¥710.50');
