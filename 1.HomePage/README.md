# 🏠 首页模块 (HomePage Module)

游戏主界面入口模块，提供游戏设置和导航功能。

## 📋 功能特性

### 核心功能
- ✅ **年级选择** - 支持1-6年级单词范围设置
- ✅ **难度选择** - 提供简单/中等/困难三档难度
- ✅ **游戏启动** - 一键开始游戏功能
- ✅ **单词本入口** - 快速访问单词库
- ✅ **设置保存** - 自动保存用户偏好设置

### UI特效
- 🌟 **星空背景** - 动态闪烁星星装饰
- 🔤 **浮动单词** - 背景英文单词动画
- 🐍 **Q萌蛇头** - 可爱的游戏主题图标
- ✨ **动画效果** - 页面元素渐入动画
- 💫 **交互反馈** - 按钮波纹和悬停效果

## 🚀 使用方法

### 直接使用
1. 打开 `index.html` 文件
2. 在浏览器中预览完整效果
3. 测试各种交互功能

### 集成使用
```html
<!-- 引入核心样式 -->
<link rel="stylesheet" href="../CoreStyles/variables.css">
<link rel="stylesheet" href="../CoreStyles/styles.css">
<link rel="stylesheet" href="../CoreStyles/animations.css">
<link rel="stylesheet" href="HomePage/style.css">

<!-- 引入脚本 -->
<script src="HomePage/script.js"></script>
```

### JavaScript API
```javascript
// 获取当前设置
const settings = window.HomePageModule.getCurrentSettings();
console.log(settings); // {grade: "3", difficulty: "medium", ...}

// 显示反馈信息
window.HomePageModule.showFeedback('操作成功！', 'success');

// 监听设置变更事件
document.addEventListener('gradeChanged', (event) => {
    console.log('年级变更:', event.detail.grade);
});

document.addEventListener('difficultyChanged', (event) => {
    console.log('难度变更:', event.detail.difficulty);
});
```

## 🎨 定制指南

### 修改游戏主题
```css
/* 修改主色调 */
:root {
    --primary-green: #YOUR_COLOR;
    --gradient-main: linear-gradient(135deg, #COLOR1, #COLOR2);
}
```

### 自定义年级范围
```javascript
// 在 script.js 中修改年级选项
const gradeOptions = [
    {value: '1', label: '初级 (Basic)'},
    {value: '2', label: '中级 (Intermediate)'},
    // ... 添加更多选项
];
```

### 替换装饰元素
- **蛇头图标**: 修改 `.snake-icon` 的 `background-image`
- **浮动单词**: 在 HTML 中更改 `.floating-word` 内容
- **背景效果**: 调整 `.stars-background` 样式

## 📱 响应式支持

- ✅ 移动端优化（320px+）
- ✅ 平板适配（768px+）
- ✅ 桌面端支持（1024px+）
- ✅ 高分辨率屏幕优化

## 🔧 技术实现

### 文件结构
```
HomePage/
├── index.html      # 主页面结构
├── style.css       # 模块专用样式
├── script.js       # 交互逻辑
└── README.md       # 使用说明
```

### 依赖关系
- `CoreStyles/variables.css` - CSS变量系统
- `CoreStyles/styles.css` - 基础样式
- `CoreStyles/animations.css` - 动画效果库

### 兼容性
- Chrome 60+
- Safari 12+
- Firefox 60+
- Edge 79+

## 🎯 复用建议

### 适用场景
- 🎮 各类小游戏入口页
- 📚 教育应用主界面
- 🏆 竞技游戏菜单页
- 👶 儿童应用首页

### 快速改造
1. **更换图标** - 修改蛇头SVG为其他游戏元素
2. **调整设置** - 改变年级为其他分类选项
3. **修改文案** - 更新标题和说明文字
4. **替换按钮** - 调整菜单按钮功能和样式

---

**💡 提示**: 这个模块已经实现了完整的设置管理和事件系统，可以很容易地集成到任何游戏项目中。