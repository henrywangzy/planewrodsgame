// 单词本模块JavaScript

// 模拟单词数据库
const WORD_DATABASE = {
    1: [
        { word: 'Cat', chinese: '猫', pronunciation: '/kæt/', example: 'The cat is cute. 这只猫很可爱。' },
        { word: 'Dog', chinese: '狗', pronunciation: '/dɔːɡ/', example: 'My dog is friendly. 我的狗很友好。' },
        { word: 'Bird', chinese: '鸟', pronunciation: '/bɜːrd/', example: 'Birds can fly. 鸟会飞。' },
        { word: 'Fish', chinese: '鱼', pronunciation: '/fɪʃ/', example: 'Fish can swim. 鱼会游泳。' },
        { word: 'Apple', chinese: '苹果', pronunciation: '/ˈæp.əl/', example: 'I eat an apple every day. 我每天吃一个苹果。' },
        { word: 'Book', chinese: '书', pronunciation: '/bʊk/', example: 'I love reading books. 我喜欢读书。' },
        { word: 'Car', chinese: '汽车', pronunciation: '/kɑːr/', example: 'The car is red. 这辆车是红色的。' },
        { word: 'House', chinese: '房子', pronunciation: '/haʊs/', example: 'My house is big. 我的房子很大。' },
        { word: 'Tree', chinese: '树', pronunciation: '/triː/', example: 'The tree is tall. 这棵树很高。' },
        { word: 'Water', chinese: '水', pronunciation: '/ˈwɔː.tər/', example: 'I drink water every day. 我每天喝水。' }
    ],
    2: [
        { word: 'School', chinese: '学校', pronunciation: '/skuːl/', example: 'I go to school every day. 我每天去上学。' },
        { word: 'Teacher', chinese: '老师', pronunciation: '/ˈtiː.tʃər/', example: 'My teacher is kind. 我的老师很和蔼。' },
        { word: 'Friend', chinese: '朋友', pronunciation: '/frend/', example: 'She is my best friend. 她是我最好的朋友。' },
        { word: 'Happy', chinese: '开心的', pronunciation: '/ˈhæp.i/', example: 'I am happy today. 我今天很开心。' },
        { word: 'Beautiful', chinese: '美丽的', pronunciation: '/ˈbjuː.tɪ.fəl/', example: 'The flower is beautiful. 这朵花很美丽。' },
        { water: 'Computer', chinese: '电脑', pronunciation: '/kəmˈpjuː.tər/', example: 'I use a computer for work. 我用电脑工作。' },
        { word: 'Music', chinese: '音乐', pronunciation: '/ˈmjuː.zɪk/', example: 'I like listening to music. 我喜欢听音乐。' },
        { word: 'Family', chinese: '家庭', pronunciation: '/ˈfæm.ə.li/', example: 'I love my family. 我爱我的家庭。' },
        { word: 'Color', chinese: '颜色', pronunciation: '/ˈkʌl.ər/', example: 'What color do you like? 你喜欢什么颜色？' },
        { word: 'Number', chinese: '数字', pronunciation: '/ˈnʌm.bər/', example: 'Can you count the numbers? 你能数这些数字吗？' }
    ],
    3: [
        { word: 'Adventure', chinese: '冒险', pronunciation: '/ədˈven.tʃər/', example: 'Life is an adventure. 生活是一场冒险。' },
        { word: 'Knowledge', chinese: '知识', pronunciation: '/ˈnɑː.lɪdʒ/', example: 'Knowledge is power. 知识就是力量。' },
        { word: 'Discovery', chinese: '发现', pronunciation: '/dɪˈskʌv.ər.i/', example: 'Science leads to new discoveries. 科学带来新发现。' },
        { word: 'Creative', chinese: '创造性的', pronunciation: '/kriˈeɪ.tɪv/', example: 'She is very creative. 她很有创造力。' },
        { word: 'Important', chinese: '重要的', pronunciation: '/ɪmˈpɔːr.tənt/', example: 'Education is important. 教育很重要。' },
        { word: 'Environment', chinese: '环境', pronunciation: '/ɪnˈvaɪ.rən.mənt/', example: 'We must protect the environment. 我们必须保护环境。' },
        { word: 'Technology', chinese: '技术', pronunciation: '/tekˈnɑː.lə.dʒi/', example: 'Technology changes our lives. 技术改变我们的生活。' },
        { word: 'Communication', chinese: '交流', pronunciation: '/kəˌmjuː.nəˈkeɪ.ʃən/', example: 'Good communication is essential. 良好的交流很重要。' },
        { word: 'Responsibility', chinese: '责任', pronunciation: '/rɪˌspɑːn.səˈbɪl.ə.ti/', example: 'We have a responsibility to help others. 我们有责任帮助他人。' },
        { word: 'Achievement', chinese: '成就', pronunciation: '/əˈtʃiːv.mənt/', example: 'Hard work leads to achievement. 努力工作带来成就。' }
    ]
};

// 全局变量
let currentVocabGrade = 3;
let currentWordList = [];
let filteredWordList = [];
let currentPage = 1;
let wordsPerPage = 8;
let currentFilter = 'all';
let wordProgress = {};
let currentDetailWord = null;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initVocabularyBook();
});

// 初始化单词本
function initVocabularyBook() {
    console.log('📚 单词本模块初始化开始');
    
    // 通知音频管理器进入单词本页面
    if (window.GlobalAudioManager) {
        window.GlobalAudioManager.onPageEnter('VocabularyBook');
    }
    
    // 加载保存的进度数据
    loadWordProgress();
    
    // 加载保存的年级设置
    loadSavedGrade();
    
    // 初始加载单词
    loadWords();
    
    // 添加键盘快捷键
    addKeyboardShortcuts();
    
    console.log('✅ 单词本模块初始化完成');
}

// 加载单词进度数据
function loadWordProgress() {
    const saved = localStorage.getItem('wordProgress');
    if (saved) {
        try {
            wordProgress = JSON.parse(saved);
            console.log('📊 已加载学习进度数据');
        } catch (e) {
            console.error('进度数据解析失败:', e);
            wordProgress = {};
        }
    }
}

// 保存单词进度数据
function saveWordProgress() {
    localStorage.setItem('wordProgress', JSON.stringify(wordProgress));
    console.log('💾 学习进度已保存');
}

// 加载保存的年级设置
function loadSavedGrade() {
    const savedGrade = localStorage.getItem('selectedGrade') || '3';
    currentVocabGrade = parseInt(savedGrade);
    
    const gradeSelect = document.getElementById('vocabGradeSelect');
    if (gradeSelect) {
        gradeSelect.value = currentVocabGrade.toString();
    }
}

// 切换年级
function changeVocabGrade() {
    const gradeSelect = document.getElementById('vocabGradeSelect');
    currentVocabGrade = parseInt(gradeSelect.value);
    
    // 保存设置
    localStorage.setItem('selectedGrade', currentVocabGrade.toString());
    
    // 重新加载单词
    loadWords();
    
    console.log(`📚 切换到${currentVocabGrade}年级单词`);
    showFeedback(`已切换到${currentVocabGrade}年级单词`, 'success');
}

// 加载当前年级的单词
function loadWords() {
    currentWordList = WORD_DATABASE[currentVocabGrade] || [];
    
    // 重置搜索和筛选
    const searchInput = document.getElementById('vocabSearch');
    if (searchInput) {
        searchInput.value = '';
    }
    
    currentFilter = 'all';
    updateFilterButtons();
    
    // 应用筛选
    applyFilter();
    
    // 重置到第一页
    currentPage = 1;
    
    // 渲染单词列表
    renderWordList();
    updateStatistics();
    updatePagination();
}

// 搜索单词
function searchWords() {
    const searchInput = document.getElementById('vocabSearch');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        applyFilter();
    } else {
        filteredWordList = currentWordList.filter(word => 
            word.word.toLowerCase().includes(searchTerm) ||
            word.chinese.includes(searchTerm)
        );
    }
    
    currentPage = 1;
    renderWordList();
    updatePagination();
    
    console.log(`🔍 搜索: "${searchTerm}", 找到 ${filteredWordList.length} 个结果`);
}

// 筛选单词
function filterWords(filter) {
    currentFilter = filter;
    updateFilterButtons();
    applyFilter();
    currentPage = 1;
    renderWordList();
    updatePagination();
    
    console.log(`🔧 筛选: ${filter}, 结果数量: ${filteredWordList.length}`);
}

// 应用筛选规则
function applyFilter() {
    switch (currentFilter) {
        case 'learned':
            filteredWordList = currentWordList.filter(word => 
                getWordStatus(word.word) === 'learned'
            );
            break;
        case 'learning':
            filteredWordList = currentWordList.filter(word => 
                getWordStatus(word.word) === 'learning'
            );
            break;
        default:
            filteredWordList = [...currentWordList];
    }
}

// 更新筛选按钮状态
function updateFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('active');
        }
    });
}

// 渲染单词列表
function renderWordList() {
    const wordListContainer = document.getElementById('wordList');
    
    if (!filteredWordList.length) {
        wordListContainer.innerHTML = createEmptyState();
        return;
    }
    
    const startIndex = (currentPage - 1) * wordsPerPage;
    const endIndex = Math.min(startIndex + wordsPerPage, filteredWordList.length);
    const currentWords = filteredWordList.slice(startIndex, endIndex);
    
    wordListContainer.innerHTML = currentWords.map(word => 
        createWordItem(word)
    ).join('');
    
    // 添加动画效果
    const wordItems = wordListContainer.querySelectorAll('.word-item');
    wordItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('animate-slideInUp');
    });
}

// 创建单词项HTML
function createWordItem(word) {
    const status = getWordStatus(word.word);
    const statusClass = status;
    
    return `
        <div class="word-item ${statusClass}" onclick="showWordDetail('${word.word}')">
            <div class="word-item-header">
                <div class="word-main">
                    <div class="word-text">${word.word}</div>
                    <div class="word-pronunciation">${word.pronunciation}</div>
                </div>
                <div class="word-controls">
                    <button class="play-button hover-scale" onclick="event.stopPropagation(); playWord('${word.word}')" title="朗读单词">🔊</button>
                </div>
            </div>
            <div class="chinese-text">${word.chinese}</div>
            <div class="example-text">${word.example}</div>
            <div class="progress-indicator"></div>
        </div>
    `;
}

// 创建空状态HTML
function createEmptyState() {
    let message, hint;
    
    if (currentFilter === 'learned') {
        message = '还没有学会的单词';
        hint = '点击单词可以标记学习进度';
    } else if (currentFilter === 'learning') {
        message = '还没有正在学习的单词';
        hint = '点击单词开始学习吧';
    } else {
        message = '没有找到匹配的单词';
        hint = '试试搜索其他关键词';
    }
    
    return `
        <div class="empty-state animate-fadeIn">
            <div class="empty-state-icon">📚</div>
            <div class="empty-state-text">${message}</div>
            <div class="empty-state-hint">${hint}</div>
        </div>
    `;
}

// 获取单词学习状态
function getWordStatus(word) {
    return wordProgress[`${currentVocabGrade}-${word}`] || 'new';
}

// 设置单词学习状态
function setWordProgress(status) {
    if (!currentDetailWord) return;
    
    const key = `${currentVocabGrade}-${currentDetailWord.word}`;
    wordProgress[key] = status;
    
    // 保存到本地存储
    saveWordProgress();
    
    // 更新弹窗中的按钮状态
    updateProgressButtons(status);
    
    // 重新渲染列表
    renderWordList();
    updateStatistics();
    
    console.log(`📝 单词 ${currentDetailWord.word} 状态设置为: ${status}`);
    showFeedback(`已将"${currentDetailWord.word}"标记为${getStatusLabel(status)}`, 'success');
}

// 获取状态标签
function getStatusLabel(status) {
    const labels = {
        'new': '未学',
        'learning': '学习中',
        'learned': '已掌握'
    };
    return labels[status] || '未知';
}

// 显示单词详情
function showWordDetail(wordText) {
    const word = filteredWordList.find(w => w.word === wordText);
    if (!word) return;
    
    currentDetailWord = word;
    
    // 填充详情内容
    document.getElementById('detailWord').textContent = word.word;
    document.getElementById('detailPronunciation').textContent = word.pronunciation;
    document.getElementById('detailChinese').textContent = word.chinese;
    document.getElementById('detailExample').textContent = word.example;
    
    // 更新进度按钮
    const status = getWordStatus(word.word);
    updateProgressButtons(status);
    
    // 显示弹窗
    const modal = document.getElementById('wordDetailModal');
    modal.classList.add('active');
    
    console.log(`👁️ 查看单词详情: ${word.word}`);
}

// 更新进度按钮状态
function updateProgressButtons(activeStatus) {
    document.querySelectorAll('.progress-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.status === activeStatus) {
            btn.classList.add('active');
        }
    });
}

// 关闭单词详情
function closeWordDetail() {
    const modal = document.getElementById('wordDetailModal');
    modal.classList.remove('active');
    currentDetailWord = null;
}

// 播放单词发音（完整朗读：英文单词 -> 中文释义 -> 英文例句 -> 中文翻译）
function playWord(wordText) {
    const word = currentWordList.find(w => w.word === wordText);
    if (!word) return;
    
    // 使用全局音频管理器进行朗读
    if (window.GlobalAudioManager) {
        showSpeechFeedback(`正在朗读完整信息...`);
        
        // 分解例句（英文例句和中文翻译）
        const exampleParts = word.example.split('.');
        const englishExample = exampleParts[0] + '.'; // 英文例句部分
        const chineseTranslation = exampleParts[1] ? exampleParts[1].trim() : ''; // 中文翻译部分
        
        // 创建朗读序列数据
        const wordData = {
            word: word.word,
            chinese: word.chinese,
            example: {
                english: englishExample,
                chinese: chineseTranslation
            }
        };
        
        // 使用音频管理器的朗读序列功能
        window.GlobalAudioManager.speakWordSequence(wordData);
        
        // 监听朗读完成（简化实现，可以根据需要优化）
        setTimeout(() => {
            hideSpeechFeedback();
        }, 8000); // 预估8秒完成朗读
    } else {
        // 降级到原有实现
        showSpeechFeedback(`正在朗读完整信息...`);
        
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            
            const exampleParts = word.example.split('.');
            const englishExample = exampleParts[0] + '.';
            const chineseTranslation = exampleParts[1] ? exampleParts[1].trim() : '';
            
            playWordSequence([
                { text: word.word, lang: 'en-US', description: '英文单词' },
                { text: word.chinese, lang: 'zh-CN', description: '中文释义' },
                { text: englishExample, lang: 'en-US', description: '英文例句' },
                { text: chineseTranslation, lang: 'zh-CN', description: '中文翻译' }
            ]);
        }
    }
    
    console.log(`🔊 完整朗读单词: ${word.word}`);
}

// 播放朗读序列
function playWordSequence(sequence, index = 0) {
    if (index >= sequence.length) {
        hideSpeechFeedback();
        return;
    }
    
    const current = sequence[index];
    if (!current.text) {
        // 如果文本为空，跳过到下一个
        playWordSequence(sequence, index + 1);
        return;
    }
    
    showSpeechFeedback(`正在朗读${current.description}: ${current.text}`);
    
    const utterance = new SpeechSynthesisUtterance(current.text);
    utterance.lang = current.lang;
    utterance.rate = current.lang === 'zh-CN' ? 0.9 : 0.8;
    utterance.pitch = current.lang === 'zh-CN' ? 1.1 : 1.0;
    
    utterance.onend = () => {
        // 短暂停顿后播放下一段
        setTimeout(() => {
            playWordSequence(sequence, index + 1);
        }, 500);
    };
    
    utterance.onerror = () => {
        console.error('朗读失败，跳过到下一段');
        playWordSequence(sequence, index + 1);
    };
    
    speechSynthesis.speak(utterance);
}

// 播放当前详情单词（完整版）
function playCurrentWord() {
    if (currentDetailWord) {
        playWord(currentDetailWord.word);
    }
}

// 单独播放英文例句
function playCurrentExample() {
    if (!currentDetailWord) return;
    
    const exampleText = currentDetailWord.example.split('.')[0] + '.'; // 只读英文部分
    showSpeechFeedback(`正在朗读例句: ${exampleText}`);
    
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel(); // 停止当前播放
        const utterance = new SpeechSynthesisUtterance(exampleText);
        utterance.lang = 'en-US';
        utterance.rate = 0.7;
        utterance.onend = hideSpeechFeedback;
        speechSynthesis.speak(utterance);
    }
    
    console.log(`🔊 朗读例句: ${exampleText}`);
}

// 单独播放中文释义
function playChineseMeaning() {
    if (!currentDetailWord) return;
    
    showSpeechFeedback(`正在朗读中文释义: ${currentDetailWord.chinese}`);
    
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel(); // 停止当前播放
        const utterance = new SpeechSynthesisUtterance(currentDetailWord.chinese);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.onend = hideSpeechFeedback;
        speechSynthesis.speak(utterance);
    }
    
    console.log(`🔊 朗读中文释义: ${currentDetailWord.chinese}`);
}

// 停止朗读
function stopSpeech() {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        hideSpeechFeedback();
    }
}

// 显示朗读反馈
function showSpeechFeedback(text) {
    const feedback = document.getElementById('speechFeedback');
    feedback.querySelector('.speech-text').textContent = text;
    feedback.classList.add('active');
}

// 隐藏朗读反馈
function hideSpeechFeedback() {
    const feedback = document.getElementById('speechFeedback');
    feedback.classList.remove('active');
}

// 更新统计信息
function updateStatistics() {
    const totalCount = currentWordList.length;
    const learnedCount = currentWordList.filter(word => 
        getWordStatus(word.word) === 'learned'
    ).length;
    
    document.getElementById('vocabCount').textContent = `总数: ${totalCount}`;
    document.getElementById('learnedCount').textContent = `已学: ${learnedCount}`;
}

// 更新分页信息
function updatePagination() {
    const totalPages = Math.ceil(filteredWordList.length / wordsPerPage);
    
    document.getElementById('pageInfo').textContent = `${currentPage} / ${totalPages}`;
    
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
}

// 翻页
function changePage(direction) {
    const totalPages = Math.ceil(filteredWordList.length / wordsPerPage);
    
    if (direction === 1 && currentPage < totalPages) {
        currentPage++;
    } else if (direction === -1 && currentPage > 1) {
        currentPage--;
    }
    
    renderWordList();
    updatePagination();
    
    // 滚动到顶部
    document.querySelector('.vocabulary-content').scrollTop = 0;
}

// 返回首页
function backToHome() {
    showFeedback('即将返回首页...', 'info');
    
    // 触发返回事件
    document.dispatchEvent(new CustomEvent('vocabularyExit', {
        detail: { 
            totalWords: currentWordList.length,
            learnedWords: currentWordList.filter(word => 
                getWordStatus(word.word) === 'learned'
            ).length
        }
    }));
}

// 添加键盘快捷键
function addKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // ESC 关闭弹窗
        if (event.key === 'Escape') {
            closeWordDetail();
        }
        
        // 左右箭头翻页
        if (!document.getElementById('wordDetailModal').classList.contains('active')) {
            if (event.key === 'ArrowLeft') {
                changePage(-1);
            } else if (event.key === 'ArrowRight') {
                changePage(1);
            }
        }
    });
}

// 显示反馈信息
function showFeedback(message, type = 'info') {
    // 简单的控制台反馈，可以扩展为UI反馈
    console.log(`📢 ${message}`);
    
    // 如果有全局反馈组件，可以调用
    if (window.HomePageModule && window.HomePageModule.showFeedback) {
        window.HomePageModule.showFeedback(message, type);
    }
}

// 导出模块功能
window.VocabularyModule = {
    getCurrentGrade: () => currentVocabGrade,
    getWordList: () => currentWordList,
    getFilteredWords: () => filteredWordList,
    getWordProgress: () => wordProgress,
    setWordProgress,
    playWord,
    searchWords,
    filterWords
};

console.log('📦 单词本模块加载完成，可通过 window.VocabularyModule 访问');