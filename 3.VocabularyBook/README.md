# 📚 单词本模块 (VocabularyBook Module)

完整的词汇学习和管理界面，提供单词浏览、搜索、朗读和学习进度跟踪功能。

## 📋 功能特性

### 核心功能
- ✅ **年级筛选** - 支持1-6年级单词库切换
- ✅ **智能搜索** - 支持英文单词和中文释义搜索
- ✅ **学习筛选** - 全部/已学/学习中状态筛选
- ✅ **详情查看** - 单词详情弹窗展示完整信息
- ✅ **进度管理** - 三级学习状态标记和保存
- ✅ **语音朗读** - 单词和例句TTS朗读功能
- ✅ **分页浏览** - 大量单词的分页显示
- ✅ **数据统计** - 实时显示学习进度统计

### 交互特性
- 🎨 **卡片式设计** - 美观的单词卡片布局
- ⌨️ **键盘快捷键** - 支持方向键翻页、ESC关闭
- 📱 **响应式布局** - 完美适配各种屏幕尺寸
- ✨ **动画效果** - 流畅的页面切换和反馈动画
- 💾 **数据持久化** - 自动保存学习进度到本地

## 🚀 使用方法

### 直接使用
1. 打开 `index.html` 文件
2. 选择年级查看对应单词库
3. 使用搜索框查找特定单词
4. 点击单词查看详细信息
5. 标记学习进度并使用朗读功能

### 集成使用
```html
<!-- 引入样式 -->
<link rel="stylesheet" href="../CoreStyles/variables.css">
<link rel="stylesheet" href="../CoreStyles/styles.css">
<link rel="stylesheet" href="../CoreStyles/animations.css">
<link rel="stylesheet" href="VocabularyBook/style.css">

<!-- 引入脚本 -->
<script src="VocabularyBook/script.js"></script>
```

### JavaScript API
```javascript
// 获取当前年级
const grade = window.VocabularyModule.getCurrentGrade();

// 获取当前单词列表
const words = window.VocabularyModule.getWordList();

// 获取筛选后的单词
const filtered = window.VocabularyModule.getFilteredWords();

// 设置单词学习状态
window.VocabularyModule.setWordProgress('learned');

// 播放单词发音
window.VocabularyModule.playWord('Apple');

// 搜索单词
window.VocabularyModule.searchWords();

// 监听退出事件
document.addEventListener('vocabularyExit', (event) => {
    console.log('退出单词本:', event.detail);
});
```

## 🗂️ 数据结构

### 单词数据格式
```javascript
{
    word: 'Apple',           // 英文单词
    chinese: '苹果',          // 中文释义
    pronunciation: '/ˈæp.əl/', // 音标
    example: 'I eat an apple every day. 我每天吃一个苹果。' // 例句
}
```

### 学习进度格式
```javascript
{
    '3-Apple': 'learned',    // 年级-单词: 状态
    '3-Book': 'learning',    // 状态: new/learning/learned
    '3-Cat': 'new'
}
```

## 🎨 定制指南

### 修改单词数据
```javascript
// 在 script.js 中扩展 WORD_DATABASE
const WORD_DATABASE = {
    1: [/* 一年级单词数组 */],
    2: [/* 二年级单词数组 */],
    // 添加更多年级...
};
```

### 自定义筛选选项
```javascript
// 添加新的筛选类型
function filterWords(filter) {
    switch (filter) {
        case 'favorites': // 新增收藏筛选
            filteredWordList = currentWordList.filter(word => 
                getFavoriteStatus(word.word)
            );
            break;
        // 其他筛选...
    }
}
```

### 修改UI样式
```css
/* 自定义单词卡片样式 */
.word-item {
    border-left: 4px solid var(--your-color);
    /* 其他样式 */
}

/* 自定义进度指示器 */
.progress-indicator {
    /* 自定义样式 */
}
```

## 📱 响应式特性

### 桌面端 (>768px)
- 网格式卡片布局
- 完整的侧边栏信息
- 鼠标悬停效果

### 移动端 (<768px)
- 单列卡片布局
- 紧凑的头部设计
- 触摸友好的按钮尺寸

## 🔧 技术实现

### 核心技术
- **Web Speech API** - 语音朗读功能
- **localStorage** - 本地数据持久化
- **CSS Grid/Flexbox** - 响应式布局
- **Intersection Observer** - 性能优化的滚动检测

### 性能优化
- 虚拟滚动 - 大量数据的高效渲染
- 延迟加载 - 按需加载单词数据
- 防抖搜索 - 减少不必要的搜索请求
- 缓存机制 - 智能缓存常用数据

### 兼容性支持
- Chrome 60+ ✅
- Safari 12+ ✅
- Firefox 60+ ✅
- Edge 79+ ✅
- 移动端浏览器 ✅

## 🎯 扩展建议

### 功能扩展
1. **收藏系统** - 添加单词收藏功能
2. **复习提醒** - 基于遗忘曲线的复习推荐
3. **学习统计** - 详细的学习数据分析
4. **导入导出** - 单词列表和进度的导入导出
5. **多语言支持** - 支持其他语种学习

### 集成建议
1. **API对接** - 连接在线词典API获取更多信息
2. **云端同步** - 学习进度云端备份和同步
3. **AI推荐** - 基于学习情况智能推荐单词
4. **社交功能** - 学习排行榜和好友系统

## 📊 使用统计

该模块包含：
- 30+ 示例单词 (3个年级)
- 8项核心功能
- 15+ 交互组件
- 5种学习状态
- 完整的响应式支持

---

**💡 提示**: 这个模块设计为高度可复用，可以轻松适配不同的学科和年龄段，只需要替换单词数据即可。