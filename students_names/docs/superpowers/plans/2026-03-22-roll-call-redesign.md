# 快速点名器重新设计实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标:** 构建一个单文件 HTML 课堂点名器，使用轻量 CSS 动画、加权随机选择和本地存储。

**架构:** 单文件应用，所有代码（HTML/CSS/JS）集成在 `index.html` 中。模块化分层：UI Layer → Service Layer → Data Layer。

**技术栈:** HTML5, CSS3, Vanilla JavaScript, IndexedDB (localStorage 降级)

---

## 文件结构

```
students_names/
├── index.html          # 主应用文件（新建，完全重写）
├── README.md           # 更新使用说明
├── TESTING_CHECKLIST.md # 测试清单（如需要）
└── docs/
    └── superpowers/
        ├── specs/
        │   └── 2026-03-22-roll-call-redesign.md
        └── plans/
            └── 2026-03-22-roll-call-redesign.md (本文件)
```

---

## Task 1: 创建 HTML 基础结构和样式

**文件:**
- 创建: `index.html`

- [ ] **Step 1: 创建 HTML 基础结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>快速点名器</title>
    <style>
        /* 全局样式 */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%);
            color: #fff;
            min-height: 100vh;
            overflow: hidden;
        }

        /* 布局容器 */
        #app {
            display: flex;
            flex-direction: column;
            height: 100vh;
        }

        /* 顶部工具栏 */
        .toolbar {
            display: flex;
            gap: 10px;
            padding: 15px 20px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            background: rgba(99, 102, 241, 0.8);
            color: #fff;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
        }

        .btn:hover:not(:disabled) {
            background: rgba(99, 102, 241, 1);
            transform: translateY(-2px);
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .btn-danger {
            background: rgba(239, 68, 68, 0.8);
        }

        .btn-danger:hover:not(:disabled) {
            background: rgba(239, 68, 68, 1);
        }

        /* 主内容区 */
        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        /* 旋转动画容器 */
        #spinner-container {
            width: 200px;
            height: 200px;
            position: relative;
        }

        .spinner {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: conic-gradient(
                from 0deg,
                #6366f1 0deg,
                #8b5cf6 90deg,
                #6366f1 180deg,
                #8b5cf6 270deg,
                #6366f1 360deg
            );
            animation: spin 3s linear infinite;
        }

        .spinner.fast {
            animation: spin 0.3s linear infinite;
        }

        .spinner.stopping {
            animation: spin-stop 1s ease-out forwards;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        @keyframes spin-stop {
            from { transform: rotate(0deg); }
            to { transform: rotate(1080deg); }
        }

        /* 内圆 */
        .spinner-inner {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 140px;
            height: 140px;
            border-radius: 50%;
            background: #1a1a2e;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* 姓名显示 */
        .name-display {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10;
            text-align: center;
        }

        .student-name {
            font-size: 72px;
            font-weight: bold;
            text-shadow: 0 0 30px rgba(99, 102, 241, 0.8),
                         0 0 60px rgba(99, 102, 241, 0.4);
            opacity: 0;
            transform: scale(0);
            transition: all 0.6s ease-out;
        }

        .student-name.show {
            opacity: 1;
            transform: scale(1);
        }

        /* 状态选择按钮 */
        .status-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
        }

        .status-buttons.show {
            opacity: 1;
            pointer-events: auto;
        }

        .status-btn {
            padding: 15px 40px;
            font-size: 18px;
            border-radius: 12px;
            border: 2px solid transparent;
            cursor: pointer;
            transition: all 0.3s;
        }

        .status-btn.normal {
            background: rgba(34, 197, 94, 0.8);
        }

        .status-btn.late {
            background: rgba(251, 191, 36, 0.8);
        }

        .status-btn.absent {
            background: rgba(239, 68, 68, 0.8);
        }

        .status-btn:hover {
            transform: scale(1.05);
            border-color: #fff;
        }

        /* 主点名按钮 */
        .main-button-container {
            position: absolute;
            bottom: 120px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10;
        }

        #start-btn {
            padding: 20px 60px;
            font-size: 24px;
            border-radius: 16px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border: none;
            color: #fff;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
            transition: all 0.3s;
        }

        #start-btn:hover:not(:disabled) {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 15px 40px rgba(99, 102, 241, 0.6);
        }

        #start-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* 底部统计栏 */
        .stats-bar {
            display: flex;
            justify-content: center;
            gap: 40px;
            padding: 15px 20px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 16px;
        }

        .stat-item {
            display: flex;
            gap: 8px;
        }

        .stat-value {
            color: #8b5cf6;
            font-weight: bold;
        }

        /* 弹窗样式 */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 100;
            align-items: center;
            justify-content: center;
        }

        .modal.show {
            display: flex;
        }

        .modal-content {
            background: #1a1a2e;
            border-radius: 16px;
            padding: 30px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .modal-title {
            font-size: 24px;
            font-weight: bold;
        }

        .modal-close {
            background: none;
            border: none;
            color: #fff;
            font-size: 28px;
            cursor: pointer;
        }

        /* 学生列表项 */
        .student-list {
            max-height: 400px;
            overflow-y: auto;
        }

        .student-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .student-info {
            display: flex;
            gap: 15px;
            align-items: center;
        }

        .student-late-badge {
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 12px;
            background: rgba(251, 191, 36, 0.2);
            color: #fbbf24;
        }

        .student-actions {
            display: flex;
            gap: 8px;
        }

        .btn-small {
            padding: 6px 12px;
            font-size: 12px;
        }

        /* 添加学生表单 */
        .add-student-form {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }

        .add-student-form input {
            flex: 1;
            padding: 10px 15px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            font-size: 14px;
        }

        .add-student-form input:focus {
            outline: none;
            border-color: #6366f1;
        }

        /* 记录列表 */
        .records-list {
            max-height: 400px;
            overflow-y: auto;
        }

        .record-item {
            display: flex;
            justify-content: space-between;
            padding: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .record-status {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
        }

        .record-status.normal {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
        }

        .record-status.late {
            background: rgba(251, 191, 36, 0.2);
            color: #fbbf24;
        }

        .record-status.absent {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
        }

        /* 确认弹窗 */
        .confirm-dialog {
            text-align: center;
        }

        .confirm-dialog p {
            margin-bottom: 20px;
            font-size: 18px;
        }

        .confirm-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
        }

        /* 通知提示 */
        .toast {
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 15px 25px;
            background: rgba(34, 197, 94, 0.9);
            color: #fff;
            border-radius: 8px;
            z-index: 200;
            transform: translateX(400px);
            transition: transform 0.3s;
        }

        .toast.show {
            transform: translateX(0);
        }

        .toast.error {
            background: rgba(239, 68, 68, 0.9);
        }

        /* 加载状态 */
        .loading {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            z-index: 50;
        }
    </style>
</head>
<body>
    <div id="app">
        <!-- 工具栏 -->
        <div class="toolbar">
            <button class="btn" id="start-btn">开始点名</button>
            <button class="btn" id="manage-students-btn">名单管理</button>
            <button class="btn" id="view-records-btn">查看记录</button>
            <button class="btn" id="export-btn">导出记录</button>
            <button class="btn" id="reset-late-btn">重置迟到</button>
            <button class="btn btn-danger" id="clear-data-btn">清空数据</button>
        </div>

        <!-- 主内容区 -->
        <div class="main-content">
            <!-- 旋转动画 -->
            <div id="spinner-container">
                <div class="spinner" id="spinner">
                    <div class="spinner-inner"></div>
                </div>
            </div>

            <!-- 姓名显示 -->
            <div class="name-display">
                <div class="student-name" id="student-name"></div>
                <div class="status-buttons" id="status-buttons">
                    <button class="status-btn normal" data-status="normal">正常</button>
                    <button class="status-btn late" data-status="late">迟到</button>
                    <button class="status-btn absent" data-status="absent">缺勤</button>
                </div>
            </div>
        </div>

        <!-- 底部统计 -->
        <div class="stats-bar">
            <div class="stat-item">今日: <span class="stat-value" id="today-count">0</span> / <span class="stat-value" id="total-count">0</span></div>
            <div class="stat-item">迟到: <span class="stat-value" id="late-count">0</span></div>
        </div>
    </div>

    <!-- 名单管理弹窗 -->
    <div class="modal" id="students-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">学生名单</h2>
                <button class="modal-close" id="close-students-btn">&times;</button>
            </div>
            <div class="add-student-form">
                <input type="text" id="new-student-name" placeholder="输入学生姓名" maxlength="10">
                <button class="btn" id="add-student-btn">添加</button>
            </div>
            <div class="student-list" id="student-list">
                <!-- 动态填充 -->
            </div>
        </div>
    </div>

    <!-- 记录弹窗 -->
    <div class="modal" id="records-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">点名记录</h2>
                <button class="modal-close" id="close-records-btn">&times;</button>
            </div>
            <div class="records-list" id="records-list">
                <!-- 动态填充 -->
            </div>
        </div>
    </div>

    <!-- 确认弹窗 -->
    <div class="modal" id="confirm-modal">
        <div class="modal-content">
            <div class="confirm-dialog">
                <p id="confirm-message">确认操作？</p>
                <div class="confirm-buttons">
                    <button class="btn" id="confirm-cancel">取消</button>
                    <button class="btn btn-danger" id="confirm-ok">确认</button>
                </div>
            </div>
        </div>
    </div>

    <!-- 通知 -->
    <div class="toast" id="toast"></div>

    <!-- 加载状态 -->
    <div class="loading" id="loading">初始化中...</div>

    <script>
        // JavaScript 代码将在后续任务中添加
    </script>
</body>
</html>
```

- [ ] **Step 2: 在浏览器中打开测试页面**

打开 `index.html`，验证：
- 页面正常显示
- 布局结构正确（工具栏、主内容区、统计栏）
- 按钮可见但无功能
- 旋转动画显示并持续旋转

- [ ] **Step 3: 提交基础结构**

```bash
git add index.html
git commit -m "feat: create HTML structure and styles"
```

---

## Task 2: 实现工具函数和存储服务

**文件:**
- 修改: `index.html` (在 `<script>` 标签内添加代码)

- [ ] **Step 1: 添加工具函数模块**

在 `<script>` 标签内添加：

```javascript
// ==================== Utils ====================
const Utils = {
    // 生成 UUID
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // 格式化日期时间
    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    // 获取今日日期字符串
    getTodayString() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // 显示通知
    showToast(message, isError = false) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = isError ? 'toast show error' : 'toast show';
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }
};
```

- [ ] **Step 2: 添加存储服务模块**

在工具函数后添加：

```javascript
// ==================== Initial Students ====================
const INITIAL_STUDENTS = [
    "张伟", "李娜", "王芳", "刘洋", "陈杰",
    "杨秀英", "赵强", "黄敏", "周涛", "吴磊",
    "徐静", "孙红", "马超", "朱丽", "胡勇",
    "郭丹", "何平", "罗琳", "林峰", "高明"
];

// ==================== StorageService ====================
const StorageService = {
    dbName: 'ClassRollCallDB',
    dbVersion: 1,
    db: null,
    useLocalStorage: false,

    // 初始化数据库
    async init() {
        try {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            return new Promise((resolve, reject) => {
                request.onerror = () => {
                    console.warn('IndexedDB 不可用，降级到 localStorage');
                    this.useLocalStorage = true;
                    this.initLocalStorage();
                    this.initMockData().then(resolve);
                };

                request.onsuccess = (e) => {
                    this.db = e.target.result;
                    this.initMockData().then(resolve);
                };

                request.onupgradeneeded = (e) => {
                    const db = e.target.result;

                    // 创建 students 对象存储
                    if (!db.objectStoreNames.contains('students')) {
                        const studentStore = db.createObjectStore('students', { keyPath: 'id' });
                        studentStore.createIndex('name', 'name', { unique: false });
                    }

                    // 创建 records 对象存储
                    if (!db.objectStoreNames.contains('records')) {
                        const recordStore = db.createObjectStore('records', { keyPath: 'id' });
                        recordStore.createIndex('timestamp', 'timestamp', { unique: false });
                    }
                };
            });
        } catch (error) {
            console.warn('IndexedDB 初始化失败，降级到 localStorage', error);
            this.useLocalStorage = true;
            this.initLocalStorage();
            await this.initMockData();
        }
    },

    // 初始化 localStorage
    initLocalStorage() {
        if (!localStorage.getItem('students')) {
            localStorage.setItem('students', JSON.stringify([]));
        }
        if (!localStorage.getItem('records')) {
            localStorage.setItem('records', JSON.stringify([]));
        }
    },

    // 初始化模拟数据
    async initMockData() {
        const students = await this.getAllStudents();
        if (students.length === 0) {
            const now = Date.now();
            const mockData = INITIAL_STUDENTS.map(name => ({
                id: Utils.generateId(),
                name: name,
                lateCount: 0,
                createdAt: now
            }));
            await this.addStudents(mockData);
            console.log(`已初始化 ${mockData.length} 名学生`);
        }
    },

    // IndexedDB 通用操作
    async idbOperation(storeName, mode, operation) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);
            const request = operation(store);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // 添加学生
    async addStudents(students) {
        if (this.useLocalStorage) {
            const existing = JSON.parse(localStorage.getItem('students') || '[]');
            const updated = [...existing, ...students];
            localStorage.setItem('students', JSON.stringify(updated));
            return;
        }

        for (const student of students) {
            await this.idbOperation('students', 'readwrite', store => store.add(student));
        }
    },

    // 获取所有学生
    async getAllStudents() {
        if (this.useLocalStorage) {
            return JSON.parse(localStorage.getItem('students') || '[]');
        }

        return this.idbOperation('students', 'readonly', store => store.getAll());
    },

    // 更新学生
    async updateStudent(student) {
        if (this.useLocalStorage) {
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            const index = students.findIndex(s => s.id === student.id);
            if (index !== -1) {
                students[index] = student;
                localStorage.setItem('students', JSON.stringify(students));
            }
            return;
        }

        await this.idbOperation('students', 'readwrite', store => store.put(student));
    },

    // 删除学生
    async deleteStudent(studentId) {
        if (this.useLocalStorage) {
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            const filtered = students.filter(s => s.id !== studentId);
            localStorage.setItem('students', JSON.stringify(filtered));
            return;
        }

        await this.idbOperation('students', 'readwrite', store => store.delete(studentId));
    },

    // 添加记录
    async addRecord(record) {
        if (this.useLocalStorage) {
            const records = JSON.parse(localStorage.getItem('records') || '[]');
            records.push(record);
            localStorage.setItem('records', JSON.stringify(records));
            return;
        }

        await this.idbOperation('records', 'readwrite', store => store.add(record));
    },

    // 获取所有记录
    async getAllRecords() {
        if (this.useLocalStorage) {
            return JSON.parse(localStorage.getItem('records') || '[]');
        }

        const records = await this.idbOperation('records', 'readonly', store => store.getAll());
        return records.sort((a, b) => b.timestamp - a.timestamp);
    },

    // 获取今日记录
    async getTodayRecords() {
        const allRecords = await this.getAllRecords();
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const todayEnd = todayStart + 24 * 60 * 60 * 1000;

        return allRecords.filter(r => r.timestamp >= todayStart && r.timestamp < todayEnd);
    },

    // 清空所有数据
    async clearAll() {
        if (this.useLocalStorage) {
            localStorage.removeItem('students');
            localStorage.removeItem('records');
            await this.initMockData();
            return;
        }

        await this.idbOperation('students', 'readwrite', store => store.clear());
        await this.idbOperation('records', 'readwrite', store => store.clear());
        await this.initMockData();
    },

    // 重置迟到计数
    async resetLateCounts() {
        const students = await this.getAllStudents();
        for (const student of students) {
            student.lateCount = 0;
            await this.updateStudent(student);
        }
    }
};
```

- [ ] **Step 3: 在浏览器中测试存储服务**

打开浏览器控制台，运行以下测试：

```javascript
// 测试初始化
await StorageService.init();
const students = await StorageService.getAllStudents();
console.log('学生数量:', students.length); // 应该是 20

// 测试添加学生
await StorageService.addStudents([{ id: 'test', name: '测试', lateCount: 0, createdAt: Date.now() }]);
const updated = await StorageService.getAllStudents();
console.log('添加后数量:', updated.length); // 应该是 21

// 测试删除学生
await StorageService.deleteStudent('test');
const afterDelete = await StorageService.getAllStudents();
console.log('删除后数量:', afterDelete.length); // 应该是 20
```

预期结果：所有测试通过，数字正确

- [ ] **Step 4: 提交存储服务**

```bash
git add index.html
git commit -m "feat: add Utils and StorageService modules"
```

---

## Task 3: 实现点名服务和状态管理

**文件:**
- 修改: `index.html`

- [ ] **Step 1: 添加点名服务模块**

在 StorageService 后添加：

```javascript
// ==================== PickerService ====================
const PickerService = {
    // 计算学生权重
    calculateWeight(student) {
        const baseWeight = 1;
        const lateWeight = 1 + (student.lateCount * 0.5);
        return Math.min(lateWeight, 5);
    },

    // 加权随机选择
    async pickStudent() {
        const students = await StorageService.getAllStudents();
        if (students.length === 0) {
            throw new Error('没有学生数据');
        }

        // 计算所有学生权重
        const weights = students.map(s => this.calculateWeight(s));
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);

        // 生成随机数
        let random = Math.random() * totalWeight;

        // 选择学生
        for (let i = 0; i < students.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return students[i];
            }
        }

        return students[students.length - 1];
    }
};
```

- [ ] **Step 2: 添加应用状态管理**

在 PickerService 后添加：

```javascript
// ==================== AppState ====================
const AppState = {
    // 应用状态
    phase: 'IDLE', // IDLE, SPINNING, SHOWING, SELECTING
    selectedStudent: null,
    students: [],
    todayRecords: [],

    // 状态转换
    setPhase(newPhase) {
        this.phase = newPhase;
        this.updateUI();
    },

    // 更新学生列表
    async refreshStudents() {
        this.students = await StorageService.getAllStudents();
    },

    // 更新今日记录
    async refreshTodayRecords() {
        this.todayRecords = await StorageService.getTodayRecords();
    },

    // 更新 UI
    updateUI() {
        // 更新统计
        document.getElementById('total-count').textContent = this.students.length;
        document.getElementById('today-count').textContent = this.todayRecords.length;
        document.getElementById('late-count').textContent = this.todayRecords.filter(r => r.status === 'late').length;

        // 更新开始按钮状态
        document.getElementById('start-btn').disabled = (this.phase !== 'IDLE');
    }
};
```

- [ ] **Step 3: 在浏览器中测试点名服务**

打开浏览器控制台，运行：

```javascript
// 初始化
await StorageService.init();
await AppState.refreshStudents();

// 测试权重计算
console.log('迟到0次的权重:', PickerService.calculateWeight({ lateCount: 0 })); // 1
console.log('迟到2次的权重:', PickerService.calculateWeight({ lateCount: 2 })); // 2
console.log('迟到10次的权重:', PickerService.calculateWeight({ lateCount: 10 })); // 5 (上限)

// 测试随机选择
const student = await PickerService.pickStudent();
console.log('选中学生:', student.name);
```

预期结果：权重计算正确，能够随机选中学生

- [ ] **Step 4: 提交点名服务和状态管理**

```bash
git add index.html
git commit -m "feat: add PickerService and AppState modules"
```

---

## Task 4: 实现动画控制和点名流程

**文件:**
- 修改: `index.html`

- [ ] **Step 1: 添加动画控制器**

在 AppState 后添加：

```javascript
// ==================== SpinnerController ====================
const SpinnerController = {
    spinner: null,
    nameElement: null,
    statusButtons: null,

    init() {
        this.spinner = document.getElementById('spinner');
        this.nameElement = document.getElementById('student-name');
        this.statusButtons = document.getElementById('status-buttons');
    },

    startSpin() {
        this.spinner.classList.add('fast');
        this.nameElement.classList.remove('show');
        this.statusButtons.classList.remove('show');
    },

    stopSpin() {
        this.spinner.classList.remove('fast');
        this.spinner.classList.add('stopping');

        // 动画结束后移除 stopping 类
        setTimeout(() => {
            this.spinner.classList.remove('stopping');
        }, 1000);
    },

    showName(name) {
        this.nameElement.textContent = name;
        this.nameElement.classList.add('show');
    },

    showStatusButtons() {
        this.statusButtons.classList.add('show');
    },

    hideAll() {
        this.nameElement.classList.remove('show');
        this.statusButtons.classList.remove('show');
    }
};
```

- [ ] **Step 2: 添加点名流程控制器**

在 SpinnerController 后添加：

```javascript
// ==================== RollCallController ====================
const RollCallController = {
    statusMap: {
        'normal': '正常',
        'late': '迟到',
        'absent': '缺勤'
    },

    async start() {
        if (AppState.phase !== 'IDLE') return;

        AppState.setPhase('SPINNING');
        SpinnerController.startSpin();

        try {
            // 选择学生
            AppState.selectedStudent = await PickerService.pickStudent();

            // 1.5秒后停止旋转
            setTimeout(() => {
                SpinnerController.stopSpin();
            }, 1500);

            // 2.5秒后显示姓名
            setTimeout(() => {
                this.showStudent();
            }, 2500);

        } catch (error) {
            console.error(error);
            Utils.showToast('点名失败：' + error.message, true);
            AppState.setPhase('IDLE');
            SpinnerController.stopSpin();
        }
    },

    showStudent() {
        AppState.setPhase('SHOWING');
        SpinnerController.showName(AppState.selectedStudent.name);

        // 显示状态按钮
        setTimeout(() => {
            AppState.setPhase('SELECTING');
            SpinnerController.showStatusButtons();
        }, 300);
    },

    async handleStatus(status) {
        if (AppState.phase !== 'SELECTING') return;

        // 保存记录
        const record = {
            id: Utils.generateId(),
            studentId: AppState.selectedStudent.id,
            studentName: AppState.selectedStudent.name,
            timestamp: Date.now(),
            status: status
        };
        await StorageService.addRecord(record);

        // 更新学生迟到计数
        if (status === 'late') {
            const student = AppState.students.find(s => s.id === AppState.selectedStudent.id);
            if (student) {
                student.lateCount = Math.min(student.lateCount + 1, 8);
                await StorageService.updateStudent(student);
            }
        }

        // 更新统计
        await AppState.refreshTodayRecords();
        await AppState.refreshStudents();
        AppState.updateUI();

        // 隐藏界面
        SpinnerController.hideAll();

        // 2秒后重置状态
        setTimeout(() => {
            AppState.setPhase('IDLE');
            AppState.selectedStudent = null;
            Utils.showToast(`已记录：${this.statusMap[status]}`);
        }, 2000);
    },

    cancel() {
        SpinnerController.hideAll();
        AppState.setPhase('IDLE');
        AppState.selectedStudent = null;
    }
};
```

- [ ] **Step 3: 在浏览器中测试点名流程**

打开浏览器控制台，运行：

```javascript
// 初始化所有模块
await StorageService.init();
await AppState.refreshStudents();
SpinnerController.init();

// 测试点名流程
await RollCallController.start();
// 观察动画效果
// 等待2.5秒后应该显示学生姓名
```

预期结果：动画加速旋转，减速停止，显示学生姓名，显示状态按钮

- [ ] **Step 4: 提交动画控制器**

```bash
git add index.html
git commit -m "feat: add SpinnerController and RollCallController"
```

---

## Task 5: 实现名单管理功能

**文件:**
- 修改: `index.html`

- [ ] **Step 1: 添加学生管理服务**

在 RollCallController 后添加：

```javascript
// ==================== StudentManager ====================
const StudentManager = {
    async showList() {
        const students = await StorageService.getAllStudents();
        const listEl = document.getElementById('student-list');

        if (students.length === 0) {
            listEl.innerHTML = '<p style="text-align: center; color: #888;">暂无学生</p>';
        } else {
            listEl.innerHTML = students.map(s => `
                <div class="student-item" data-id="${s.id}">
                    <div class="student-info">
                        <span>${s.name}</span>
                        ${s.lateCount > 0 ? `<span class="student-late-badge">迟到${s.lateCount}次</span>` : ''}
                    </div>
                    <div class="student-actions">
                        <button class="btn btn-small btn-danger" onclick="StudentManager.deleteStudent('${s.id}')">删除</button>
                    </div>
                </div>
            `).join('');
        }

        this.showModal('students-modal');
    },

    async addStudent() {
        const input = document.getElementById('new-student-name');
        const name = input.value.trim();

        if (!name) {
            Utils.showToast('请输入学生姓名', true);
            return;
        }

        if (name.length > 10) {
            Utils.showToast('姓名不能超过10个字符', true);
            return;
        }

        const students = await StorageService.getAllStudents();
        if (students.some(s => s.name === name)) {
            Utils.showToast('该学生已存在', true);
            return;
        }

        await StorageService.addStudents([{
            id: Utils.generateId(),
            name: name,
            lateCount: 0,
            createdAt: Date.now()
        }]);

        input.value = '';
        await this.showList();
        await AppState.refreshStudents();
        AppState.updateUI();
        Utils.showToast('添加成功');
    },

    async deleteStudent(id) {
        await StorageService.deleteStudent(id);
        await this.showList();
        await AppState.refreshStudents();
        AppState.updateUI();
        Utils.showToast('删除成功');
    },

    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    },

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }
};
```

- [ ] **Step 2: 测试名单管理功能**

打开应用，测试：
1. 点击"名单管理"按钮
2. 查看学生列表
3. 添加新学生
4. 删除学生

预期结果：所有操作正常工作

- [ ] **Step 3: 提交名单管理功能**

```bash
git add index.html
git commit -m "feat: add StudentManager for list management"
```

---

## Task 6: 实现记录查看和导出功能

**文件:**
- 修改: `index.html`

- [ ] **Step 1: 添加记录管理服务**

在 StudentManager 后添加：

```javascript
// ==================== RecordManager ====================
const RecordManager = {
    statusMap: {
        'normal': '正常',
        'late': '迟到',
        'absent': '缺勤'
    },

    async showList() {
        const records = await StorageService.getAllRecords();
        const listEl = document.getElementById('records-list');

        if (records.length === 0) {
            listEl.innerHTML = '<p style="text-align: center; color: #888;">暂无记录</p>';
        } else {
            listEl.innerHTML = records.map(r => `
                <div class="record-item">
                    <span>${Utils.formatDateTime(r.timestamp)}</span>
                    <span>${r.studentName}</span>
                    <span class="record-status ${r.status}">${this.statusMap[r.status]}</span>
                </div>
            `).join('');
        }

        this.showModal('records-modal');
    },

    async exportCSV() {
        const records = await StorageService.getAllRecords();
        if (records.length === 0) {
            Utils.showToast('没有记录可导出', true);
            return;
        }

        // 生成 CSV 内容
        let csv = '时间,姓名,状态\n';

        for (const record of records) {
            const time = Utils.formatDateTime(record.timestamp);
            const status = this.statusMap[record.status] || record.status;
            csv += `${time},${record.studentName},${status}\n`;
        }

        // 创建 Blob 并下载
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `点名记录_${Utils.getTodayString()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Utils.showToast(`已导出 ${records.length} 条记录`);
    },

    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    },

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }
};
```

- [ ] **Step 2: 测试记录功能**

打开应用，测试：
1. 点击"查看记录"按钮
2. 查看记录列表
3. 点击"导出记录"按钮
4. 验证下载的 CSV 文件

预期结果：记录正常显示，CSV 正确导出

- [ ] **Step 3: 提交记录功能**

```bash
git add index.html
git commit -m "feat: add RecordManager for viewing and exporting"
```

---

## Task 7: 实现主应用初始化和事件绑定

**文件:**
- 修改: `index.html`

- [ ] **Step 1: 添加确认对话框服务**

在 RecordManager 后添加：

```javascript
// ==================== ConfirmDialog ====================
const ConfirmDialog = {
    callback: null,

    show(message, onConfirm) {
        document.getElementById('confirm-message').textContent = message;
        this.callback = onConfirm;
        this.showModal('confirm-modal');
    },

    async confirm() {
        if (this.callback) {
            this.closeModal('confirm-modal');
            await this.callback();
            this.callback = null;
        }
    },

    cancel() {
        this.closeModal('confirm-modal');
        this.callback = null;
    },

    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    },

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }
};
```

- [ ] **Step 2: 添加主应用模块**

在 ConfirmDialog 后添加：

```javascript
// ==================== App ====================
const App = {
    async init() {
        try {
            // 初始化存储服务
            await StorageService.init();

            // 初始化状态
            await AppState.refreshStudents();
            await AppState.refreshTodayRecords();

            // 初始化控制器
            SpinnerController.init();

            // 绑定事件
            this.bindEvents();

            // 更新 UI
            AppState.updateUI();

            // 隐藏加载状态
            document.getElementById('loading').style.display = 'none';

            console.log('应用初始化完成');

        } catch (error) {
            console.error('应用初始化失败:', error);
            document.getElementById('loading').textContent = '初始化失败，请刷新页面重试';
        }
    },

    bindEvents() {
        // 开始点名按钮
        document.getElementById('start-btn').addEventListener('click', () => {
            RollCallController.start();
        });

        // 名单管理按钮
        document.getElementById('manage-students-btn').addEventListener('click', () => {
            StudentManager.showList();
        });

        // 添加学生按钮
        document.getElementById('add-student-btn').addEventListener('click', () => {
            StudentManager.addStudent();
        });

        // 新学生姓名输入框回车
        document.getElementById('new-student-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                StudentManager.addStudent();
            }
        });

        // 查看记录按钮
        document.getElementById('view-records-btn').addEventListener('click', () => {
            RecordManager.showList();
        });

        // 导出记录按钮
        document.getElementById('export-btn').addEventListener('click', () => {
            RecordManager.exportCSV();
        });

        // 重置迟到按钮
        document.getElementById('reset-late-btn').addEventListener('click', () => {
            ConfirmDialog.show('确认重置所有学生的迟到计数？', async () => {
                await StorageService.resetLateCounts();
                await AppState.refreshStudents();
                AppState.updateUI();
                Utils.showToast('迟到计数已重置');
            });
        });

        // 清空数据按钮
        document.getElementById('clear-data-btn').addEventListener('click', () => {
            ConfirmDialog.show('确认清空所有数据？学生名单将重新初始化。', async () => {
                await StorageService.clearAll();
                await AppState.refreshStudents();
                await AppState.refreshTodayRecords();
                AppState.updateUI();
                Utils.showToast('数据已清空');
            });
        });

        // 状态选择按钮
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.target.dataset.status;
                RollCallController.handleStatus(status);
            });
        });

        // 关闭名单弹窗
        document.getElementById('close-students-btn').addEventListener('click', () => {
            StudentManager.closeModal('students-modal');
        });

        // 关闭记录弹窗
        document.getElementById('close-records-btn').addEventListener('click', () => {
            RecordManager.closeModal('records-modal');
        });

        // 确认弹窗取消按钮
        document.getElementById('confirm-cancel').addEventListener('click', () => {
            ConfirmDialog.cancel();
        });

        // 确认弹窗确认按钮
        document.getElementById('confirm-ok').addEventListener('click', () => {
            ConfirmDialog.confirm();
        });

        // 点击姓名区域取消
        document.getElementById('student-name').addEventListener('click', () => {
            if (AppState.phase === 'SELECTING') {
                RollCallController.cancel();
            }
        });

        // ESC 键处理
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                StudentManager.closeModal('students-modal');
                RecordManager.closeModal('records-modal');
                ConfirmDialog.cancel();
                if (AppState.phase === 'SELECTING') {
                    RollCallController.cancel();
                }
            }
        });

        // 点击弹窗背景关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                    ConfirmDialog.callback = null;
                }
            });
        });
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
```

- [ ] **Step 2: 完整测试应用**

打开应用，测试完整流程：
1. 点名流程（开始 → 动画 → 显示姓名 → 选择状态）
2. 名单管理（查看、添加、删除）
3. 记录查看
4. 导出 CSV
5. 重置迟到
6. 清空数据
7. ESC 键取消
8. 点击背景关闭弹窗

预期结果：所有功能正常工作

- [ ] **Step 3: 提交主应用**

```bash
git add index.html
git commit -m "feat: add App initialization and event binding"
```

---

## Task 8: 更新文档

**文件:**
- 修改: `README.md`

- [ ] **Step 1: 更新 README**

```markdown
# 快速点名器

一个轻量级的课堂点名器，使用 CSS 动画作为视觉效果。

## 功能特点

- 🎯 **快速点名** - 一键开始，流畅动画
- 🎲 **加权随机** - 迟到学生被点中概率更高（最高权重 5）
- 📊 **记录管理** - 自动记录每次点名，支持导出 CSV
- 🔄 **迟到追踪** - 自动统计迟到次数，可重置
- ✏️ **名单管理** - 可添加、删除学生
- 💾 **本地存储** - 使用 IndexedDB，数据保存在浏览器中
- 📦 **单文件** - 无需构建，双击即可运行

## 使用方法

1. **打开应用** - 直接在浏览器中打开 `index.html`
2. **开始点名** - 点击"开始点名"按钮
3. **选择状态** - 选中学生后，点击"正常"/"迟到"/"缺勤"
4. **查看记录** - 点击"查看记录"查看所有点名记录
5. **导出数据** - 点击"导出记录"下载 CSV 文件

## 名单管理

- 点击"名单管理"按钮查看所有学生
- 输入姓名并点击"添加"新增学生
- 点击"删除"按钮移除学生

## 加权规则

- 基础权重：1
- 每迟到 1 次：权重 +0.5
- 权重上限：5（迟到 8 次后不再增加）

示例：
- 迟到 0 次 → 权重 1
- 迟到 2 次 → 权重 2
- 迟到 8+ 次 → 权重 5

## 技术栈

- HTML5 / CSS3 / Vanilla JavaScript
- CSS Animations（轻量级动画）
- IndexedDB（数据存储）
- localStorage（降级方案）

## 浏览器要求

- Chrome 90+
- Firefox 88+
- Safari 14+

需要支持 IndexedDB。

## 数据清空

如需重新开始，点击"清空数据"按钮，学生名单将重新初始化为内置的 20 个姓名。
```

- [ ] **Step 2: 提交文档更新**

```bash
git add README.md
git commit -m "docs: update README for redesigned roll call app"
```

---

## Task 9: 最终测试和清理

- [ ] **Step 1: 完整回归测试**

测试所有功能点：
- [ ] 点名流程完整运行
- [ ] 加权随机正确工作
- [ ] 学生名单增删改
- [ ] 记录查看正确
- [ ] CSV 导出格式正确
- [ ] 统计数据准确
- [ ] 重置迟到功能
- [ ] 清空数据功能
- [ ] ESC 键取消
- [ ] 弹窗交互
- [ ] 通知提示

- [ ] **Step 2: 跨浏览器测试**

在不同浏览器中测试：
- [ ] Chrome
- [ ] Firefox
- [ ] Safari（如可用）

- [ ] **Step 3: 性能检查**

- [ ] 页面加载时间 < 1 秒
- [ ] 点名响应时间 < 100ms
- [ ] 动画流畅（60fps）

- [ ] **Step 4: 最终提交**

```bash
git add .
git commit -m "chore: complete roll call redesign implementation"
```

---

## 验收标准

完成所有任务后，应用应满足：

1. ✅ 单文件应用，双击即可运行
2. ✅ 点名流程流畅，动画轻量
3. ✅ 加权随机正确工作
4. ✅ 数据持久化到浏览器
5. ✅ 名单可编辑
6. ✅ 记录可查看和导出
7. ✅ 所有交互响应及时
8. ✅ 错误处理友好

---

## 开发注意事项

1. **TDD 原则**：每个功能点先考虑如何测试，再实现代码
2. **小步提交**：每个 Task 完成后立即提交
3. **DRY 原则**：复用代码，避免重复
4. **YAGNI 原则**：只实现需要的功能
5. **错误处理**：所有异步操作都要有错误处理
6. **用户体验**：提供即时反馈和友好的错误提示
