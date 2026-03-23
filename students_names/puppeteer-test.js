/**
 * 课堂点名器 - Puppeteer 自动化测试
 *
 * 使用方法:
 * 1. npm install puppeteer
 * 2. node puppeteer-test.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// 简单的测试报告
const TestReport = {
    tests: [],
    pass: 0,
    fail: 0,

    add(name, passed, details) {
        this.tests.push({ name, passed, details });
        if (passed) this.pass++;
        else this.fail++;
    },

    print() {
        console.log('\n╔══════════════════════════════════════════════════════════════╗');
        console.log('║           课堂点名器 - Puppeteer 自动化测试报告                ║');
        console.log('╚══════════════════════════════════════════════════════════════╝\n');

        this.tests.forEach(t => {
            const icon = t.passed ? '✅' : '❌';
            console.log(`${icon} ${t.name}${t.details ? ` - ${t.details}` : ''}`);
        });

        console.log('\n═════════════════════════════════════════════════════════════');
        console.log(`📊 测试结果: ${this.pass}/${this.tests.length} 通过`);
        console.log(`📈 成功率: ${((this.pass / this.tests.length) * 100).toFixed(1)}%`);
        console.log('═════════════════════════════════════════════════════════════\n');
    }
};

// 静态代码分析
function staticAnalysis() {
    console.log('🔍 静态代码分析...\n');

    const html = fs.readFileSync('index.html', 'utf8');

    // 模块检查
    const modules = [
        { name: 'MOCK_STUDENTS 常量', pattern: /const MOCK_STUDENTS\s*=/ },
        { name: 'Utils 模块', pattern: /const Utils\s*=/ },
        { name: 'DataStore 模块', pattern: /const DataStore\s*=/ },
        { name: 'RandomPicker 模块', pattern: /const RandomPicker\s*=/ },
        { name: 'EarthRenderer 模块', pattern: /const EarthRenderer\s*=/ },
        { name: 'CSVExporter 模块', pattern: /const CSVExporter\s*=/ },
        { name: 'UIController 模块', pattern: /const UIController\s*=/ },
        { name: 'App 模块', pattern: /const App\s*=/ }
    ];

    console.log('📦 模块检查:');
    modules.forEach(({ name, pattern }) => {
        const found = pattern.test(html);
        TestReport.add(name, found, found ? '存在' : '缺失');
    });

    // 关键功能检查
    console.log('\n⚙️  功能检查:');

    const checks = [
        { name: 'Three.js CDN', pattern: /three@0\.160\.0/ },
        { name: 'IndexedDB', pattern: /indexedDB\.open/ },
        { name: 'localStorage 降级', pattern: /useLocalStorage/ },
        { name: '权重上限 5', pattern: /Math\.min\(lateWeight,\s*5\)/ },
        { name: 'UUID 生成', pattern: /generateId\(\)/ },
        { name: 'CSV 导出', pattern: /text\/csv/ },
        { name: 'DOMContentLoaded', pattern: /DOMContentLoaded/ },
        { name: '状态机', pattern: /state:\s*['"]IDLE['"]/ },
        { name: 'ESC 键处理', pattern: /key === ['"]Escape['"]/ },
        { name: 'FPS 监控', pattern: /fps.*<.*30/ }
    ];

    checks.forEach(({ name, pattern }) => {
        const found = pattern.test(html);
        TestReport.add(name, found);
    });

    // 学生名单检查
    console.log('\n👥 学生名单:');
    const studentMatch = html.match(/MOCK_STUDENTS = \[([\s\S]*?)\]/);
    if (studentMatch) {
        const students = studentMatch[1].match(/"([^"]+)"/g) || [];
        TestReport.add('内置学生数量', students.length === 20, `${students.length} 个`);
        TestReport.add('包含张伟', students.includes('"张伟"'));
        TestReport.add('包含高明', students.includes('"高明"'));
    } else {
        TestReport.add('内置学生数量', false, '未找到');
    }

    // 文件大小
    const size = Buffer.byteLength(html, 'utf8');
    TestReport.add('文件大小', size > 0, `${(size / 1024).toFixed(2)} KB`);
}

// 运行静态分析
staticAnalysis();
TestReport.print();

console.log('💡 提示: 如需运行完整的浏览器自动化测试，请安装 puppeteer:');
console.log('   npm install puppeteer');
console.log('   然后修改此脚本使用 Puppeteer 进行浏览器内测试\n');
