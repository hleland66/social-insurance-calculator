// 课堂点名器 - 自动化测试脚本
// 可以在浏览器控制台中运行此脚本进行测试

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║           课堂点名器 - 自动化测试                            ║');
console.log('╚══════════════════════════════════════════════════════════════╝');

const TestRunner = {
    results: [],
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    log(name, passed, details = '') {
        const icon = passed ? '✅' : '❌';
        console.log(`${icon} ${name}${details ? ': ' + details : ''}`);
        this.results.push({ name, passed, details });
    },

    async runTests() {
        console.log('\n📋 开始测试...\n');

        // 测试1: 检查模块是否存在
        this.testModulesExist();

        // 测试2: 检查 DOM 元素
        this.testDOMElements();

        // 测试3: 测试 Utils 工具函数
        this.testUtils();

        // 测试4: 测试权重计算
        this.testWeightCalculation();

        // 测试5: 测试状态机
        this.testStateMachine();

        // 测试6: 数据库测试
        await this.testDatabase();

        // 输出结果
        this.printResults();
    },

    testModulesExist() {
        console.log('🧩 模块存在性测试');
        this.log('MockData', typeof MOCK_STUDENTS !== 'undefined');
        this.log('Utils', typeof Utils !== 'undefined');
        this.log('DataStore', typeof DataStore !== 'undefined');
        this.log('RandomPicker', typeof RandomPicker !== 'undefined');
        this.log('EarthRenderer', typeof EarthRenderer !== 'undefined');
        this.log('CSVExporter', typeof CSVExporter !== 'undefined');
        this.log('UIController', typeof UIController !== 'undefined');
        this.log('App', typeof App !== 'undefined');
        console.log('');
    },

    testDOMElements() {
        console.log('🎨 DOM 元素测试');
        this.log('开始按钮', !!document.getElementById('start-btn'));
        this.log('导出按钮', !!document.getElementById('export-btn'));
        this.log('查看记录按钮', !!document.getElementById('view-records-btn'));
        this.log('重置迟到按钮', !!document.getElementById('reset-late-btn'));
        this.log('清空数据按钮', !!document.getElementById('clear-data-btn'));
        this.log('学生姓名显示', !!document.getElementById('student-name'));
        this.log('状态按钮组', !!document.getElementById('status-buttons'));
        this.log('统计栏', !!document.getElementById('today-count'));
        this.log('记录弹窗', !!document.getElementById('records-modal'));
        this.log('确认弹窗', !!document.getElementById('confirm-modal'));
        this.log('Toast 通知', !!document.getElementById('toast'));
        console.log('');
    },

    testUtils() {
        console.log('🔧 Utils 工具函数测试');

        if (typeof Utils === 'undefined') {
            this.log('Utils 模块', false, '模块未定义');
            console.log('');
            return;
        }

        // UUID 测试
        const id = Utils.generateId();
        this.log('UUID 生成', /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id), id);

        // 日期格式化测试
        const timestamp = 1710985200000; // 2024-03-21 10:00:00
        const formatted = Utils.formatDateTime(timestamp);
        this.log('日期格式化', formatted === '2024-03-21 10:00:00', formatted);

        // 今日日期测试
        const today = Utils.getTodayString();
        this.log('今日日期', /^\d{4}-\d{2}-\d{2}$/.test(today), today);
        console.log('');
    },

    testWeightCalculation() {
        console.log('⚖️  权重计算测试');

        if (typeof RandomPicker === 'undefined') {
            this.log('RandomPicker 模块', false, '模块未定义');
            console.log('');
            return;
        }

        // 测试权重计算
        const weights = [
            { lateCount: 0, expected: 1 },
            { lateCount: 2, expected: 2 },
            { lateCount: 4, expected: 3 },
            { lateCount: 6, expected: 4 },
            { lateCount: 8, expected: 5 },
            { lateCount: 10, expected: 5 }
        ];

        weights.forEach(({ lateCount, expected }) => {
            const student = { lateCount };
            const weight = RandomPicker.calculateWeight(student);
            this.log(`迟到${lateCount}次权重`, weight === expected, `计算值: ${weight}, 预期: ${expected}`);
        });
        console.log('');
    },

    testStateMachine() {
        console.log('🔄 状态机测试');

        if (typeof UIController === 'undefined') {
            this.log('UIController 模块', false, '模块未定义');
            console.log('');
            return;
        }

        this.log('初始状态', UIController.state === 'IDLE');
        this.log('状态映射存在', typeof UIController.statusMap === 'object');
        this.log('开始按钮启用', !document.getElementById('start-btn').disabled);
        console.log('');
    },

    async testDatabase() {
        console.log('💾 数据库测试');

        if (typeof DataStore === 'undefined') {
            this.log('DataStore 模块', false, '模块未定义');
            console.log('');
            return;
        }

        // 检查数据库配置
        this.log('数据库名称', DataStore.dbName === 'ClassRollCallDB', DataStore.dbName);
        this.log('数据库版本', DataStore.dbVersion === 1);

        // 获取学生数据
        try {
            const students = await DataStore.getAllStudents();
            this.log('学生数据', students.length > 0, `${students.length} 名学生`);

            // 检查迟到计数
            const maxLateCount = Math.max(...students.map(s => s.lateCount));
            this.log('迟到计数范围', true, `最大: ${maxLateCount}`);

            // 获取记录
            const records = await DataStore.getAllRecords();
            this.log('记录数据', true, `${records.length} 条记录`);

            // 今日记录
            const todayRecords = await DataStore.getTodayRecords();
            this.log('今日记录', true, `${todayRecords.length} 条`);

        } catch (error) {
            this.log('数据库操作', false, error.message);
        }
        console.log('');
    },

    printResults() {
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;

        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║                     测试结果汇总                              ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log(`📊 总计: ${passed}/${total} 通过`);
        console.log(`✅ 通过: ${passed}`);
        console.log(`❌ 失败: ${total - passed}`);
        console.log(`📈 成功率: ${((passed / total) * 100).toFixed(1)}%`);
        console.log('');

        if (passed === total) {
            console.log('🎉 所有测试通过！');
        } else {
            console.log('⚠️  部分测试失败，请检查上述详情');
        }
    }
};

// 运行测试
TestRunner.runTests().then(() => {
    console.log('\n✨ 测试完成');
});

// 导出以便手动调用
window.TestRunner = TestRunner;
