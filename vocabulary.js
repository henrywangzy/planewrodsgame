// 单词本功能 - 从snackwordsgame整合
let currentVocabGrade = 1;
let currentWordIndex = 0;
let filteredWords = [];
let wordProgress = {};
let isGameResultMode = false;
const wordsPerPage = 10;

// 显示单词本
function showVocabularyBook() {
    console.log('📚 显示单词本界面（从vocabulary.js）');
    
    // 确保vocabularyWords已初始化
    if (typeof initializeVocabularyWords === 'function') {
        initializeVocabularyWords();
    }
    
    // 隐藏其他屏幕，显示单词本
    if (typeof switchScreen === 'function') {
        switchScreen('vocabularyScreen');
    } else {
        hideAllScreens();
        document.getElementById('vocabularyScreen').classList.add('active');
    }
    
    // 初始化单词本（主页模式）
    isGameResultMode = false;
    currentVocabGrade = 1;
    currentWordIndex = 0;
    
    // 使用全局的filteredWords
    if (typeof vocabularyWords !== 'undefined') {
        filteredWords = vocabularyWords.filter(word => word.grade == currentVocabGrade);
    }
    
    loadWordProgress();
    displayVocabularyWords(); // 使用不同的函数名避免冲突
}

// 返回主菜单
function backToMenu() {
    hideAllScreens();
    document.getElementById('startScreen').classList.add('active');
}

// 切换年级
function changeVocabGrade() {
    const gradeSelect = document.getElementById('vocabGradeSelect');
    currentVocabGrade = parseInt(gradeSelect.value);
    currentWordIndex = 0;
    updateVocabularyDisplay();
}

// 更新单词本显示
function updateVocabularyDisplay() {
    const searchTerm = document.getElementById('vocabSearch').value.toLowerCase();
    filterVocabularyWords(searchTerm);
    displayVocabularyWords();
    updateVocabularyPagination();
    updateVocabularyStats();
}

// 筛选单词
function filterVocabularyWords(searchTerm) {
    const gradeWords = words[currentVocabGrade] || [];
    
    if (!searchTerm) {
        filteredWords = [...gradeWords];
    } else {
        filteredWords = gradeWords.filter(word => 
            word.word.toLowerCase().includes(searchTerm) ||
            word.chinese.includes(searchTerm)
        );
    }
}

// 显示单词列表
function displayVocabularyWords() {
    const wordList = document.getElementById('wordList');
    
    // 固定每页显示10个单词
    const endIndex = currentWordIndex + wordsPerPage;
    const pageWords = filteredWords.slice(currentWordIndex, endIndex);

    wordList.innerHTML = '';

    pageWords.forEach(wordData => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        
        // 获取学习状态
        const progress = wordProgress[wordData.word] || { encounters: 0, learned: false };
        if (progress.encounters >= 3) {
            wordItem.classList.add('learned');
        } else if (progress.encounters >= 1) {
            wordItem.classList.add('familiar');
        }

        wordItem.innerHTML = `
            <div class="learned-status"></div>
            <div class="word-header">
                <div class="word-info">
                    <div class="word-line">
                        <span class="word-text">${wordData.word}</span>
                        <span class="pronunciation">${wordData.pronunciation}</span>
                        <span class="chinese-text">${wordData.chinese}</span>
                    </div>
                </div>
                <button class="play-button" onclick="playVocabWord('${wordData.word}')">🔊</button>
            </div>
            <div class="example-text">${wordData.example}</div>
        `;

        wordList.appendChild(wordItem);
    });
}

// 更新分页
function updateVocabularyPagination() {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    
    if (prevButton) prevButton.disabled = currentWordIndex <= 0;
    if (nextButton) nextButton.disabled = currentWordIndex >= filteredWords.length - wordsPerPage;
    
    // 计算当前页码
    const currentPage = Math.floor(currentWordIndex / wordsPerPage) + 1;
    const totalPages = Math.ceil(filteredWords.length / wordsPerPage);
    if (pageInfo) pageInfo.textContent = `${currentPage} / ${totalPages}`;
}

// 更新统计
function updateVocabularyStats() {
    const totalWords = filteredWords.length;
    const vocabCount = document.getElementById('vocabCount');
    if (vocabCount) {
        vocabCount.textContent = `总数: ${totalWords}`;
    }
}

// 翻页
function changePage(direction) {
    const newIndex = currentWordIndex + (direction * wordsPerPage);
    
    if (newIndex >= 0 && newIndex < filteredWords.length) {
        currentWordIndex = newIndex;
        displayVocabularyWords();
        updateVocabularyPagination();
    }
}

// 搜索单词
function searchWords() {
    currentWordIndex = 0;
    updateVocabularyDisplay();
}

// 播放单词发音
function playVocabWord(word) {
    if ('speechSynthesis' in window) {
        // 取消任何正在进行的语音
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        window.speechSynthesis.speak(utterance);
    }
}

// 加载单词学习进度
function loadWordProgress() {
    const saved = localStorage.getItem('wordProgress');
    if (saved) {
        wordProgress = JSON.parse(saved);
    } else {
        wordProgress = {};
    }
}

// 保存单词学习进度
function saveWordProgress() {
    localStorage.setItem('wordProgress', JSON.stringify(wordProgress));
}

// 隐藏所有屏幕
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}