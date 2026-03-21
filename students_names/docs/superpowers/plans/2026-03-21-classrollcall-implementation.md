# 课堂点名器/签到系统 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个基于浏览器的课堂点名器，使用 Three.js 3D 地球动画作为视觉效果，支持加权随机点名、记录管理、迟到权重等功能。

**Architecture:** 单文件 HTML 应用，内部模块化组织。DataStore 负责 IndexedDB/LocalStorage 封装，EarthRenderer 负责 Three.js 渲染，RandomPicker 负责加权随机，UIController 负责界面交互。

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Three.js (CDN), IndexedDB

---

## 文件结构

```
students_names/
├── index.html          # 单文件应用（HTML + CSS + JS）
└── README.md           # 使用说明
```

**index.html 模块划分：**
- `MockData` - 内置学生数据常量
- `Utils` - 工具函数（UUID、日期格式化）
- `DataStore` - IndexedDB/LocalStorage 封装
- `RandomPicker` - 加权随机选择算法
- `EarthRenderer` - Three.js 3D 地球渲染
- `CSVExporter` - CSV 导出功能
- `UIController` - UI 状态管理和事件处理
- `App` - 主入口和初始化

---

## Task 1: 创建 HTML 骨架和 CSS 样式

**Files:**
- Create: `index.html`

- [ ] **Step 1: 创建 HTML 基础结构和样式**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>课堂点名器</title>
    <style>
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

        /* 地球容器 */
        #earth-container {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
        }

        /* 姓名显示区 */
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
            <button class="btn" id="export-btn">导出记录</button>
            <button class="btn" id="view-records-btn">查看记录</button>
            <button class="btn" id="reset-late-btn">重置迟到</button>
            <button class="btn btn-danger" id="clear-data-btn">清空数据</button>
        </div>

        <!-- 主内容区 -->
        <div class="main-content">
            <!-- 地球容器 -->
            <div id="earth-container"></div>

            <!-- 姓名显示 -->
            <div class="name-display">
                <div class="student-name" id="student-name"></div>
                <div class="status-buttons" id="status-buttons">
                    <button class="status-btn normal" data-status="normal">正常</button>
                    <button class="status-btn late" data-status="late">迟到</button>
                    <button class="status-btn absent" data-status="absent">缺勤</button>
                </div>
            </div>

            <!-- 主按钮 -->
            <div class="main-button-container">
                <button id="start-btn">开始点名</button>
            </div>
        </div>

        <!-- 底部统计 -->
        <div class="stats-bar">
            <div class="stat-item">今日: <span class="stat-value" id="today-count">0</span> / <span class="stat-value" id="total-count">0</span></div>
            <div class="stat-item">迟到: <span class="stat-value" id="late-count">0</span></div>
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

    <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
    <script>
        // JavaScript 代码将在后续步骤添加
    </script>
</body>
</html>
```

- [ ] **Step 2: 测试页面显示**

在浏览器中打开 `index.html`
预期: 看到页面布局（按钮、统计栏、弹窗），地球区域为空

- [ ] **Step 3: 提交**

```bash
git add index.html
git commit -m "feat: add HTML skeleton and CSS styles"
```

---

## Task 2: 实现工具函数和模拟数据模块

**Files:**
- Modify: `index.html` - 在 `<script>` 标签内添加代码

- [ ] **Step 1: 添加工具函数和模拟数据**

在 `<script>` 标签内添加（在 `// JavaScript 代码将在后续步骤添加` 之后）：

```javascript
// ==================== Mock Data ====================
const MOCK_STUDENTS = [
    "张伟", "李娜", "王芳", "刘洋", "陈杰",
    "杨秀英", "赵强", "黄敏", "周涛", "吴磊",
    "徐静", "孙红", "马超", "朱丽", "胡勇",
    "郭丹", "何平", "罗琳", "林峰", "高明"
];

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

- [ ] **Step 2: 提交**

```bash
git add index.html
git commit -m "feat: add Utils and MockData modules"
```

---

## Task 3: 实现 DataStore 模块

**Files:**
- Modify: `index.html` - 在 `<script>` 标签内继续添加

- [ ] **Step 1: 实现 DataStore 模块**

在 Utils 模块后添加：

```javascript
// ==================== DataStore ====================
const DataStore = {
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
                    resolve();
                };

                request.onsuccess = (e) => {
                    this.db = e.target.result;
                    // 初始化模拟数据
                    this.initMockData().then(resolve);
                };

                request.onupgradeneeded = (e) => {
                    const db = e.target.result;

                    // 创建 students 对象存储
                    if (!db.objectStoreNames.contains('students')) {
                        const studentStore = db.createObjectStore('students', { keyPath: 'id' });
                        studentStore.createIndex('name', 'name', { unique: false });
                        studentStore.createIndex('lateCount', 'lateCount', { unique: false });
                    }

                    // 创建 records 对象存储
                    if (!db.objectStoreNames.contains('records')) {
                        const recordStore = db.createObjectStore('records', { keyPath: 'id' });
                        recordStore.createIndex('timestamp', 'timestamp', { unique: false });
                        recordStore.createIndex('studentName', 'studentName', { unique: false });
                    }
                };
            });
        } catch (error) {
            console.warn('IndexedDB 初始化失败，降级到 localStorage', error);
            this.useLocalStorage = true;
            this.initLocalStorage();
            this.initMockData();
        }
    },

    // 初始化 localStorage 模拟
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
            const mockData = MOCK_STUDENTS.map(name => ({
                id: Utils.generateId(),
                name: name,
                lateCount: 0,
                createdDate: now
            }));
            await this.addStudents(mockData);
            console.log(`已初始化 ${mockData.length} 名学生`);
        }
    },

    // IndexedDB 通用操作方法
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

        return this.idbOperation('students', 'readonly', store => {
            return store.getAll();
        });
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

    // 获取今日记录（使用高效的日期比较）
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

- [ ] **Step 2: 提交**

```bash
git add index.html
git commit -m "feat: implement DataStore module with IndexedDB and localStorage fallback"
```

---

## Task 4: 实现 RandomPicker 加权随机算法

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 添加 RandomPicker 模块**

```javascript
// ==================== RandomPicker ====================
const RandomPicker = {
    // 计算学生权重（上限为5）
    calculateWeight(student) {
        const baseWeight = 1;
        const lateWeight = 1 + (student.lateCount * 0.5);
        return Math.min(lateWeight, 5);
    },

    // 加权随机选择
    async pickStudent() {
        const students = await DataStore.getAllStudents();
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

- [ ] **Step 2: 提交**

```bash
git add index.html
git commit -m "feat: implement RandomPicker with weighted selection (max weight 5)"
```

---

## Task 5: 实现 EarthRenderer 3D 地球渲染

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 添加 EarthRenderer 模块**

```javascript
// ==================== EarthRenderer ====================
const EarthRenderer = {
    scene: null,
    camera: null,
    renderer: null,
    earth: null,
    normalSpeed: 0.001,
    fastSpeed: 0.01,
    currentSpeed: 0.001,
    targetSpeed: 0.001,
    animationId: null,
    lastFrameTime: 0,
    frameCount: 0,
    fps: 60,
    lowQualityMode: false,

    // 初始化 Three.js 场景
    init() {
        try {
            const container = document.getElementById('earth-container');
            const width = container.clientWidth;
            const height = container.clientHeight;

            // 创建场景
            this.scene = new THREE.Scene();

            // 创建相机
            this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
            this.camera.position.z = 6;

            // 创建渲染器
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container.appendChild(this.renderer.domElement);

            // 创建地球
            this.createEarth();

            // 添加灯光
            this.addLights();

            // 监听窗口大小变化
            window.addEventListener('resize', () => this.onResize());

            // 开始动画循环
            this.animate();

        } catch (error) {
            console.error('Three.js 初始化失败:', error);
            Utils.showToast('3D 渲染初始化失败，使用简化模式', true);
            this.initFallback();
        }
    },

    // 降级到 CSS 动画模式
    initFallback() {
        const container = document.getElementById('earth-container');
        container.innerHTML = '<div class="earth-fallback"></div>';

        // 检查是否已添加样式（避免重复）
        if (!document.getElementById('fallback-style')) {
            const style = document.createElement('style');
            style.id = 'fallback-style';
            style.textContent = `
                .earth-fallback {
                    width: 300px;
                    height: 300px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 30% 30%, #3b82f6, #1e40af, #0f172a);
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    animation: earthRotate 30s linear infinite;
                    box-shadow: 0 0 60px rgba(59, 130, 246, 0.5),
                               inset -30px -30px 60px rgba(0, 0, 0, 0.4),
                               inset 10px 10px 30px rgba(255, 255, 255, 0.1);
                }
                @keyframes earthRotate {
                    from { transform: translate(-50%, -50%) rotateY(0deg); }
                    to { transform: translate(-50%, -50%) rotateY(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        // 覆盖动画方法（空操作，CSS 动画持续运行）
        this.startFastSpin = () => {};
        this.stopFastSpin = () => {};
        this.dispose = () => {};
    },

    // 创建地球（程序生成网格纹理）
    createEarth() {
        const geometry = new THREE.SphereGeometry(2, 64, 64);

        // 生成网格纹理
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // 背景渐变
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1e3a5f');
        gradient.addColorStop(0.5, '#2563eb');
        gradient.addColorStop(1, '#1e3a5f');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制经纬线网格
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.3)';
        ctx.lineWidth = 1;

        // 经线
        for (let i = 0; i < 24; i++) {
            ctx.beginPath();
            const x = (i / 24) * canvas.width;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        // 纬线
        for (let i = 0; i < 12; i++) {
            ctx.beginPath();
            const y = (i / 12) * canvas.height;
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // 随机添加一些"大陆"色块
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = 30 + Math.random() * 80;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);

        const material = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 25,
            transparent: true,
            opacity: 0.9
        });

        this.earth = new THREE.Mesh(geometry, material);
        this.scene.add(this.earth);
    },

    // 添加灯光
    addLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // 点光源
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);
    },

    // 窗口大小变化
    onResize() {
        const container = document.getElementById('earth-container');
        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    },

    // 动画循环
    animate(currentTime = 0) {
        this.animationId = requestAnimationFrame((t) => this.animate(t));

        // FPS 监控
        this.frameCount++;
        if (currentTime - this.lastFrameTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = currentTime;

            // 低性能检测：FPS 持续低于 30，启用低质量模式
            if (this.fps < 30 && !this.lowQualityMode && this.renderer) {
                this.lowQualityMode = true;
                this.renderer.setPixelRatio(1);
                console.log('检测到低性能设备，已降低渲染质量');
            }
        }

        // 平滑过渡到目标速度
        this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.05;

        // 旋转地球
        if (this.earth) {
            this.earth.rotation.y += this.currentSpeed;
        }

        if (this.renderer) {
            this.renderer.render(this.scene, this.camera);
        }
    },

    // 开始加速旋转
    startFastSpin() {
        this.targetSpeed = this.fastSpeed;
    },

    // 停止加速旋转
    stopFastSpin() {
        this.targetSpeed = this.normalSpeed;
    },

    // 清理资源
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.earth) {
            this.earth.geometry.dispose();
            this.earth.material.dispose();
        }

        if (this.renderer) {
            this.renderer.dispose();
        }
    }
};
```

- [ ] **Step 2: 测试地球渲染**

在浏览器中打开页面
预期: 看到一个旋转的 3D 地球，带有网格纹理和渐变颜色

- [ ] **Step 3: 提交**

```bash
git add index.html
git commit -m "feat: implement EarthRenderer with Three.js"
```

---

## Task 6: 实现 CSVExporter 导出功能

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 添加 CSVExporter 模块**

```javascript
// ==================== CSVExporter ====================
const CSVExporter = {
    // 导出记录为 CSV
    async exportRecords() {
        const records = await DataStore.getAllRecords();
        if (records.length === 0) {
            Utils.showToast('没有记录可导出', true);
            return;
        }

        // 生成 CSV 内容
        let csv = '时间,姓名,状态\n';

        // 状态映射
        const statusMap = {
            'normal': '正常',
            'late': '迟到',
            'absent': '缺勤'
        };

        for (const record of records) {
            const time = Utils.formatDateTime(record.timestamp);
            const status = statusMap[record.status] || record.status;
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
    }
};
```

- [ ] **Step 2: 提交**

```bash
git add index.html
git commit -m "feat: implement CSVExporter"
```

---

## Task 7: 实现 UIController 核心控制逻辑

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 添加 UIController 模块**

```javascript
// ==================== UIController ====================
const UIController = {
    // 应用状态
    state: 'IDLE', // IDLE, SPINNING, SHOWING_NAME, AWAITING_STATUS
    selectedStudent: null,
    confirmCallback: null, // 存储确认回调
    statusMap: {
        'normal': '正常',
        'late': '迟到',
        'absent': '缺勤'
    },

    // 初始化
    init() {
        this.bindEvents();
        this.updateStats();
    },

    // 绑定事件
    bindEvents() {
        // 开始点名按钮
        document.getElementById('start-btn').addEventListener('click', () => this.startRollCall());

        // 状态选择按钮
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.target.dataset.status;
                this.handleStatusSelect(status);
            });
        });

        // 导出记录
        document.getElementById('export-btn').addEventListener('click', () => {
            CSVExporter.exportRecords();
        });

        // 查看记录
        document.getElementById('view-records-btn').addEventListener('click', () => {
            this.showRecordsModal();
        });

        // 重置迟到
        document.getElementById('reset-late-btn').addEventListener('click', () => {
            this.showConfirmModal('确认重置所有学生的迟到计数？', async () => {
                await DataStore.resetLateCounts();
                Utils.showToast('迟到计数已重置');
                this.updateStats();
            });
        });

        // 清空数据
        document.getElementById('clear-data-btn').addEventListener('click', () => {
            this.showConfirmModal('确认清空所有数据？学生名单将重新初始化。', async () => {
                await DataStore.clearAll();
                Utils.showToast('数据已清空');
                this.updateStats();
            });
        });

        // 关闭记录弹窗
        document.getElementById('close-records-btn').addEventListener('click', () => {
            this.closeModal('records-modal');
        });

        // 点击姓名区域取消
        document.getElementById('student-name').addEventListener('click', () => {
            if (this.state === 'AWAITING_STATUS') {
                this.cancelSelection();
            }
        });

        // ESC 键处理
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // 关闭记录弹窗
                this.closeModal('records-modal');
                // 关闭确认弹窗
                this.closeModal('confirm-modal');
                // 取消状态选择
                if (this.state === 'AWAITING_STATUS') {
                    this.cancelSelection();
                }
            }
        });

        // 确认弹窗取消按钮
        document.getElementById('confirm-cancel').addEventListener('click', () => {
            this.closeModal('confirm-modal');
            this.confirmCallback = null;
        });

        // 确认弹窗确认按钮（使用单例回调模式）
        document.getElementById('confirm-ok').addEventListener('click', async () => {
            if (this.confirmCallback) {
                this.closeModal('confirm-modal');
                await this.confirmCallback();
                this.confirmCallback = null;
            }
        });
    },

    // 开始点名
    async startRollCall() {
        if (this.state !== 'IDLE') return;

        this.state = 'SPINNING';
        this.setStartButtonEnabled(false);

        try {
            // 加速地球旋转
            EarthRenderer.startFastSpin();

            // 随机选择学生
            this.selectedStudent = await RandomPicker.pickStudent();

            // 1.5秒后减速
            setTimeout(() => {
                EarthRenderer.stopFastSpin();
            }, 1500);

            // 2秒后显示学生姓名
            setTimeout(() => {
                this.showStudentName();
            }, 2000);

        } catch (error) {
            console.error(error);
            Utils.showToast('点名失败：' + error.message, true);
            this.state = 'IDLE';
            this.setStartButtonEnabled(true);
            EarthRenderer.stopFastSpin();
        }
    },

    // 显示学生姓名
    showStudentName() {
        this.state = 'SHOWING_NAME';

        const nameEl = document.getElementById('student-name');
        nameEl.textContent = this.selectedStudent.name;
        nameEl.classList.add('show');

        // 显示状态按钮
        setTimeout(() => {
            this.state = 'AWAITING_STATUS';
            document.getElementById('status-buttons').classList.add('show');
        }, 300);
    },

    // 处理状态选择
    async handleStatusSelect(status) {
        if (this.state !== 'AWAITING_STATUS') return;

        // 保存记录
        const record = {
            id: Utils.generateId(),
            studentName: this.selectedStudent.name,
            timestamp: Date.now(),
            status: status
        };
        await DataStore.addRecord(record);

        // 更新学生迟到计数
        if (status === 'late') {
            const students = await DataStore.getAllStudents();
            const student = students.find(s => s.id === this.selectedStudent.id);
            if (student) {
                student.lateCount = Math.min(student.lateCount + 1, 8);
                await DataStore.updateStudent(student);
            }
        }

        // 更新统计
        this.updateStats();

        // 隐藏姓名和按钮
        document.getElementById('status-buttons').classList.remove('show');

        // 2秒后淡出姓名
        setTimeout(() => {
            document.getElementById('student-name').classList.remove('show');
            this.state = 'IDLE';
            this.setStartButtonEnabled(true);
            this.selectedStudent = null;

            Utils.showToast(`已记录：${this.statusMap[status]}`);
        }, 2000);
    },

    // 取消选择
    cancelSelection() {
        document.getElementById('status-buttons').classList.remove('show');
        document.getElementById('student-name').classList.remove('show');
        this.state = 'IDLE';
        this.setStartButtonEnabled(true);
        this.selectedStudent = null;
    },

    // 设置开始按钮状态
    setStartButtonEnabled(enabled) {
        document.getElementById('start-btn').disabled = !enabled;
    },

    // 更新统计
    async updateStats() {
        const students = await DataStore.getAllStudents();
        const todayRecords = await DataStore.getTodayRecords();

        const totalCount = students.length;
        const todayCount = todayRecords.length;
        const lateCount = todayRecords.filter(r => r.status === 'late').length;

        document.getElementById('total-count').textContent = totalCount;
        document.getElementById('today-count').textContent = todayCount;
        document.getElementById('late-count').textContent = lateCount;
    },

    // 显示记录弹窗
    async showRecordsModal() {
        const records = await DataStore.getAllRecords();
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

    // 显示确认弹窗（使用单例回调模式，避免重复绑定）
    showConfirmModal(message, onConfirm) {
        document.getElementById('confirm-message').textContent = message;
        this.confirmCallback = onConfirm;
        this.showModal('confirm-modal');
    },

    // 显示弹窗
    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    },

    // 关闭弹窗
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }
};
```

- [ ] **Step 2: 提交**

```bash
git add index.html
git commit -m "feat: implement UIController with state machine"
```

---

## Task 8: 实现 App 主入口和初始化

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 添加 App 主入口模块**

在 UIController 模块后添加：

```javascript
// ==================== App ====================
const App = {
    // 初始化应用
    async init() {
        try {
            // 初始化数据存储
            await DataStore.init();

            // 初始化地球渲染
            EarthRenderer.init();

            // 初始化 UI 控制器
            UIController.init();

            // 隐藏加载状态
            document.getElementById('loading').style.display = 'none';

            console.log('应用初始化完成');

        } catch (error) {
            console.error('应用初始化失败:', error);
            document.getElementById('loading').textContent = '初始化失败，请刷新页面重试';
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    EarthRenderer.dispose();
});
```

- [ ] **Step 2: 测试完整功能**

在浏览器中打开页面，测试：
1. 点击"开始点名"，地球加速旋转
2. 学生姓名显示，选择状态
3. 记录保存，统计更新
4. 导出 CSV 功能
5. 查看记录弹窗
6. 重置迟到和清空数据

- [ ] **Step 3: 提交**

```bash
git add index.html
git commit -m "feat: implement App main entry point"
```

---

## Task 9: 创建 README 使用说明

**Files:**
- Create: `README.md`

- [ ] **Step 1: 编写 README 文档**

```markdown
# 课堂点名器/签到系统

一个基于浏览器的课堂点名器，使用 3D 地球旋转动画作为视觉效果。

## 功能特点

- 🌍 **3D 地球动画** - 基于 Three.js 的酷炫地球旋转效果
- 🎲 **加权随机** - 迟到学生被点中概率更高（最高权重 5）
- 📊 **记录管理** - 自动记录每次点名，支持导出 CSV
- 🔄 **迟到追踪** - 自动统计迟到次数，可重置
- 💾 **本地存储** - 使用 IndexedDB，数据保存在浏览器中

## 使用方法

1. **打开应用** - 直接在浏览器中打开 `index.html`
2. **开始点名** - 点击"开始点名"按钮
3. **选择状态** - 选中学生后，点击"正常"/"迟到"/"缺勤"
4. **查看记录** - 点击"查看记录"查看所有点名记录
5. **导出数据** - 点击"导出记录"下载 CSV 文件

## 内置学生名单

系统内置 20 个学生姓名：
张伟、李娜、王芳、刘洋、陈杰、杨秀英、赵强、黄敏、周涛、吴磊、
徐静、孙红、马超、朱丽、胡勇、郭丹、何平、罗琳、林峰、高明

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
- Three.js (3D 渲染)
- IndexedDB (数据存储)
- localStorage (降级方案)

## 浏览器要求

- Chrome 90+
- Firefox 88+
- Safari 14+

需要支持 WebGL 和 IndexedDB。

## 数据清空

如需重新开始，点击"清空数据"按钮，学生名单将重新初始化。
```

- [ ] **Step 2: 提交**

```bash
git add README.md
git commit -m "docs: add README with usage instructions"
```

---

## Task 10: 最终测试和优化

**Files:**
- Modify: `index.html` (如有需要)

- [ ] **Step 1: 完整功能测试**

测试清单：
- [ ] 首次加载初始化 20 个学生
- [ ] 点击"开始点名"地球加速旋转 1.5 秒
- [ ] 姓名显示动画正常弹出
- [ ] 三种状态按钮都可点击
- [ ] 选择后记录正确保存
- [ ] 今日统计正确更新
- [ ] 迟到学生权重增加
- [ ] 权重上限生效（迟到 8+ 次后权重不超过 5）
- [ ] 导出 CSV 格式正确
- [ ] 查看记录弹窗显示
- [ ] 重置迟到计数生效
- [ ] 清空数据后重新初始化
- [ ] ESC 键在状态选择时取消点名
- [ ] ESC 键关闭记录弹窗
- [ ] ESC 键关闭确认弹窗
- [ ] 点击姓名区域取消选择
- [ ] 确认弹窗回调正确执行（重置迟到、清空数据）
- [ ] Three.js 初始化失败时降级到 CSS 动画（模拟：禁用 WebGL）
- [ ] 低性能设备自动降低渲染质量（FPS < 30 时）

- [ ] **Step 2: 性能检查**

打开浏览器开发者工具 > Performance：
- 录制 5 秒钟
- 检查 FPS 是否稳定在 60fps
- 检查是否有内存泄漏

- [ ] **Step 3: 最终提交**

```bash
git add index.html README.md
git commit -m "chore: final testing and optimization complete"
```

---

## 实现完成标志

当所有任务完成后：
- ✅ 单文件 HTML 应用可以独立运行
- ✅ Three.js 地球正常旋转和加速
- ✅ 加权随机点名功能正常
- ✅ 记录保存和导出功能正常
- ✅ 所有边界情况处理正确

## 使用说明

### 方式 1: Subagent-Driven (推荐)

每个任务由独立的子代理执行，完成后进行审查。

### 方式 2: Inline Execution

在当前会话中使用 executing-plans 技能批量执行。
