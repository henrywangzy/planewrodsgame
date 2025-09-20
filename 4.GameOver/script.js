// 游戏结束模块JavaScript

// 游戏数据
let gameResult = {
    score: 1250,
    level: 3,
    wordsLearned: 18,
    accuracy: 85,
    gameTime: '05:32',
    learnedWords: [],
    difficultWords: [],
    achievements: []
};

// 模拟单词数据
const SAMPLE_WORDS = [
    { word: 'Apple', chinese: '苹果', pronunciation: '/ˈæp.əl/', example: 'I eat an apple every day. 我每天吃一个苹果。', mastered: true },
    { word: 'Book', chinese: '书', pronunciation: '/bʊk/', example: 'I love reading books. 我喜欢读书。', mastered: true },
    { word: 'Cat', chinese: '猫', pronunciation: '/kæt/', example: 'The cat is cute. 这只猫很可爱。', mastered: false },
    { word: 'Dog', chinese: '狗', pronunciation: '/dɔːɡ/', example: 'My dog is friendly. 我的狗很友好。', mastered: true },
    { word: 'Fish', chinese: '鱼', pronunciation: '/fɪʃ/', example: 'Fish can swim. 鱼会游泳。', mastered: false },
    { word: 'House', chinese: '房子', pronunciation: '/haʊs/', example: 'My house is big. 我的房子很大。', mastered: true },
    { word: 'Water', chinese: '水', pronunciation: '/ˈwɔː.tər/', example: 'I drink water every day. 我每天喝水。', mastered: true },
    { word: 'School', chinese: '学校', pronunciation: '/skuːl/', example: 'I go to school every day. 我每天去上学。', mastered: false },
    { word: 'Friend', chinese: '朋友', pronunciation: '/frend/', example: 'She is my best friend. 她是我最好的朋友。', mastered: true },
    { word: 'Happy', chinese: '开心的', pronunciation: '/ˈhæp.i/', example: 'I am happy today. 我今天很开心。', mastered: true }
];

// 成就定义
const ACHIEVEMENTS = [
    { id: 'first_win', name: '初次胜利', desc: '完成第一关', icon: '🏆', condition: (data) => data.level >= 1 },
    { id: 'word_master', name: '单词达人', desc: '学会10个单词', icon: '📚', condition: (data) => data.wordsLearned >= 10 },
    { id: 'accuracy_master', name: '精准射手', desc: '正确率超过80%', icon: '🎯', condition: (data) => data.accuracy >= 80 },
    { id: 'speed_runner', name: '闪电快手', desc: '5分钟内完成', icon: '⚡', condition: (data) => parseTimeToSeconds(data.gameTime) <= 300 },
    { id: 'high_scorer', name: '高分选手', desc: '得分超过1000', icon: '⭐', condition: (data) => data.score >= 1000 }
];

let currentReviewType = 'learned';
let currentModalWord = null;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initGameOverScreen();
});

// 初始化游戏结束界面
function initGameOverScreen() {
    console.log('🏁 游戏结束模块初始化');
    
    // 加载游戏数据（实际使用时从其他模块传入）
    loadGameResult();
    
    // 准备单词数据
    prepareWordData();
    
    // 计算成就
    calculateAchievements();
    
    // 更新UI显示
    updateGameResultUI();
    updateWordReview();
    updateAchievements();
    
    // 添加动画延迟
    addAnimationDelays();
    
    console.log('✅ 游戏结束界面初始化完成');
}

// 加载游戏结果（模拟数据，实际使用时从localStorage或传参获取）
function loadGameResult() {
    // 尝试从localStorage加载
    const saved = localStorage.getItem('lastGameResult');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            gameResult = {...gameResult, ...data};
        } catch (e) {
            console.log('使用默认游戏结果数据');
        }
    }
    
    // 也可以从URL参数加载
    const params = new URLSearchParams(window.location.search);
    if (params.get('score')) {
        gameResult.score = parseInt(params.get('score'));
        gameResult.level = parseInt(params.get('level') || gameResult.level);
        gameResult.wordsLearned = parseInt(params.get('words') || gameResult.wordsLearned);
    }
}

// 准备单词数据
function prepareWordData() {
    // 分离已学会和待加强的单词
    gameResult.learnedWords = SAMPLE_WORDS.filter(word => word.mastered);
    gameResult.difficultWords = SAMPLE_WORDS.filter(word => !word.mastered);
    
    // 更新统计数据
    gameResult.wordsLearned = gameResult.learnedWords.length;
    gameResult.accuracy = Math.round((gameResult.learnedWords.length / SAMPLE_WORDS.length) * 100);
}

// 计算成就
function calculateAchievements() {
    gameResult.achievements = ACHIEVEMENTS.filter(achievement => 
        achievement.condition(gameResult)
    );
    
    console.log(`🏆 获得${gameResult.achievements.length}个成就`);
}

// 更新游戏结果UI
function updateGameResultUI() {
    // 更新结果标题
    const titles = ['太棒了！', '恭喜完成！', '游戏结束', '继续努力！'];
    const subtitles = [
        '你的表现非常出色！',
        '继续努力，你一定可以的！', 
        '每一次游戏都是进步！',
        '熟能生巧，加油！'
    ];
    
    const titleIndex = Math.min(Math.floor(gameResult.accuracy / 25), titles.length - 1);
    document.getElementById('resultTitle').textContent = titles[titleIndex];
    document.getElementById('resultSubtitle').textContent = subtitles[titleIndex];
    
    // 更新分数和统计
    document.getElementById('finalScore').textContent = gameResult.score.toLocaleString();
    document.getElementById('wordsLearned').textContent = gameResult.wordsLearned;
    document.getElementById('accuracy').textContent = gameResult.accuracy + '%';
    document.getElementById('maxLevel').textContent = gameResult.level;
    document.getElementById('gameTime').textContent = gameResult.gameTime;
    
    // 更新摘要
    document.getElementById('learnedCount').textContent = gameResult.wordsLearned;
}

// 切换回顾类型
function switchReviewType(type) {
    currentReviewType = type;
    
    // 更新按钮状态
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
    
    // 更新单词列表
    updateWordReview();
    
    console.log(`📋 切换到${type === 'learned' ? '已学会' : '待加强'}单词`);
}

// 更新单词回顾
function updateWordReview() {
    const wordList = document.getElementById('wordReviewList');
    const reviewSummary = document.getElementById('reviewSummary');
    
    let words = currentReviewType === 'learned' ? gameResult.learnedWords : gameResult.difficultWords;
    
    if (words.length === 0) {
        wordList.innerHTML = createEmptyReview();
        reviewSummary.style.display = 'none';
        return;
    }
    
    reviewSummary.style.display = 'block';
    
    // 生成单词列表
    wordList.innerHTML = words.map(word => createWordReviewItem(word)).join('');
    
    // 更新摘要文字
    const summaryText = currentReviewType === 'learned' 
        ? `恭喜！你已经掌握了 <span class="highlight">${words.length}</span> 个新单词`
        : `还有 <span class="highlight">${words.length}</span> 个单词需要加强练习`;
    
    reviewSummary.innerHTML = `<div class="summary-text">${summaryText}</div>`;
}

// 创建单词回顾项
function createWordReviewItem(word) {
    const statusClass = word.mastered ? 'learned' : 'difficult';
    const statusText = word.mastered ? '✓ 已掌握' : '! 待加强';
    
    return `
        <div class="review-word-item" onclick="showWordDetail('${word.word}')">
            <div class="word-info">
                <div class="word-english">${word.word}</div>
                <div class="word-chinese">${word.chinese}</div>
            </div>
            <div class="word-status">
                <span class="status-badge ${statusClass}">${statusText}</span>
                <button class="play-word-btn" onclick="event.stopPropagation(); playReviewWord('${word.word}')" title="朗读单词">🔊</button>
            </div>
        </div>
    `;
}

// 创建空回顾状态
function createEmptyReview() {
    const message = currentReviewType === 'learned' 
        ? { icon: '📚', text: '还没有学会的单词', hint: '继续游戏来学习更多单词吧' }
        : { icon: '🎉', text: '太棒了！没有困难单词', hint: '你已经掌握了所有单词' };
    
    return `
        <div class="empty-review">
            <div class="empty-icon">${message.icon}</div>
            <div class="empty-text">${message.text}</div>
            <div class="empty-hint">${message.hint}</div>
        </div>
    `;
}

// 更新成就显示
function updateAchievements() {
    const badgeList = document.getElementById('badgeList');
    
    if (gameResult.achievements.length === 0) {
        badgeList.innerHTML = `
            <div class="empty-achievement">
                <div class="empty-icon">🏆</div>
                <div class="empty-text">继续努力获得成就吧！</div>
            </div>
        `;
        return;
    }
    
    badgeList.innerHTML = gameResult.achievements.map((achievement, index) => `
        <div class="achievement-badge" style="--animation-delay: ${index * 0.2}s">
            <div class="badge-icon">${achievement.icon}</div>
            <div class="badge-name">${achievement.name}</div>
            <div class="badge-desc">${achievement.desc}</div>
        </div>
    `).join('');
}

// 显示单词详情
function showWordDetail(wordText) {
    const word = SAMPLE_WORDS.find(w => w.word === wordText);
    if (!word) return;
    
    currentModalWord = word;
    
    // 填充弹窗内容
    document.getElementById('modalWord').textContent = word.word;
    document.getElementById('modalPronunciation').textContent = word.pronunciation;
    document.getElementById('modalChinese').textContent = word.chinese;
    document.getElementById('modalExample').textContent = word.example;
    
    // 更新掌握状态
    const masteryStatus = document.getElementById('modalMastery');
    const statusClass = word.mastered ? 'learned' : 'difficult';
    const statusText = word.mastered ? '✓ 已掌握' : '! 待加强';
    masteryStatus.innerHTML = `<span class="status-badge ${statusClass}">${statusText}</span>`;
    
    // 显示弹窗
    document.getElementById('wordDetailModal').classList.add('active');
    
    console.log(`👁️ 查看单词详情: ${word.word}`);
}

// 关闭单词弹窗
function closeWordModal() {
    document.getElementById('wordDetailModal').classList.remove('active');
    currentModalWord = null;
}

// 播放弹窗中的单词
function playModalWord() {
    if (currentModalWord) {
        playWordComplete(currentModalWord);
    }
}

// 播放回顾中的单词
function playReviewWord(wordText) {
    const word = SAMPLE_WORDS.find(w => w.word === wordText);
    if (word) {
        playWordComplete(word);
    }
}

// 完整播放单词
function playWordComplete(word) {
    if (!('speechSynthesis' in window)) {
        console.log('浏览器不支持语音合成');
        return;
    }
    
    // 停止当前播放
    speechSynthesis.cancel();
    
    console.log(`🔊 完整朗读单词: ${word.word}`);
    
    // 分解例句
    const exampleParts = word.example.split('.');
    const englishExample = exampleParts[0] + '.';
    const chineseTranslation = exampleParts[1] ? exampleParts[1].trim() : '';
    
    // 创建朗读序列
    const sequence = [
        { text: word.word, lang: 'en-US' },
        { text: word.chinese, lang: 'zh-CN' },
        { text: englishExample, lang: 'en-US' },
        { text: chineseTranslation, lang: 'zh-CN' }
    ];
    
    playWordSequence(sequence, 0);
}

// 播放单词序列
function playWordSequence(sequence, index) {
    if (index >= sequence.length) {
        return;
    }
    
    const current = sequence[index];
    if (!current.text) {
        playWordSequence(sequence, index + 1);
        return;
    }
    
    const utterance = new SpeechSynthesisUtterance(current.text);
    utterance.lang = current.lang;
    utterance.rate = current.lang === 'zh-CN' ? 0.9 : 0.8;
    utterance.pitch = current.lang === 'zh-CN' ? 1.1 : 1.0;
    
    utterance.onend = () => {
        setTimeout(() => {
            playWordSequence(sequence, index + 1);
        }, 500);
    };
    
    utterance.onerror = () => {
        console.error('朗读失败，跳过');
        playWordSequence(sequence, index + 1);
    };
    
    speechSynthesis.speak(utterance);
}

// 重新开始游戏
function restartGame() {
    document.getElementById('restartModal').classList.add('active');
}

// 确认重新开始
function confirmRestart() {
    document.getElementById('restartModal').classList.remove('active');
    
    console.log('🔄 重新开始游戏');
    
    // 清除游戏数据
    localStorage.removeItem('lastGameResult');
    
    // 触发重新开始事件
    document.dispatchEvent(new CustomEvent('gameRestart', {
        detail: { fromGameOver: true }
    }));
    
    // 显示反馈
    showToast('游戏即将重新开始...', 'info');
}

// 取消重新开始
function cancelRestart() {
    document.getElementById('restartModal').classList.remove('active');
}

// 查看单词本
function reviewWords() {
    console.log('📚 打开单词本');
    
    // 触发查看单词本事件
    document.dispatchEvent(new CustomEvent('openVocabulary', {
        detail: { 
            fromGameOver: true,
            learnedWords: gameResult.learnedWords,
            difficultWords: gameResult.difficultWords
        }
    }));
    
    showToast('即将打开单词本...', 'info');
}

// 返回主界面
function backToHome() {
    console.log('🏠 返回主界面');
    
    // 触发返回主界面事件
    document.dispatchEvent(new CustomEvent('backToHome', {
        detail: { 
            fromGameOver: true,
            gameResult: gameResult
        }
    }));
    
    showToast('即将返回主界面...', 'info');
}

// 分享结果
function shareResult(type) {
    console.log(`📤 分享结果: ${type}`);
    
    switch (type) {
        case 'copy':
            copyShareText();
            break;
        case 'image':
            generateShareImage();
            break;
        case 'social':
            showShareModal();
            break;
    }
}

// 显示分享弹窗
function showShareModal() {
    // 更新分享内容
    document.getElementById('shareScore').textContent = gameResult.score;
    document.getElementById('shareWords').textContent = gameResult.wordsLearned;
    
    document.getElementById('shareModal').classList.add('active');
}

// 关闭分享弹窗
function closeShareModal() {
    document.getElementById('shareModal').classList.remove('active');
}

// 复制分享文本
function copyShareText() {
    const shareText = `我在贪吃蛇单词游戏中得了${gameResult.score}分，学会了${gameResult.wordsLearned}个单词！正确率${gameResult.accuracy}%，最高到达第${gameResult.level}关！`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('分享文本已复制到剪贴板', 'success');
            closeShareModal();
        }).catch(() => {
            showToast('复制失败，请手动复制', 'error');
        });
    } else {
        // 降级处理
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            showToast('分享文本已复制', 'success');
            closeShareModal();
        } catch (err) {
            showToast('复制失败，请手动复制', 'error');
        }
        
        document.body.removeChild(textArea);
    }
}

// 生成分享图片
function generateShareImage() {
    showToast('图片分享功能开发中...', 'info');
    // TODO: 实现Canvas截图分享功能
}

// 添加动画延迟
function addAnimationDelays() {
    // 为统计项添加动画延迟
    document.querySelectorAll('.stat-item').forEach((item, index) => {
        item.style.setProperty('--animation-delay', `${index * 0.1}s`);
    });
    
    // 为成就徽章添加动画延迟
    document.querySelectorAll('.achievement-badge').forEach((badge, index) => {
        badge.style.setProperty('--animation-delay', `${index * 0.2}s`);
    });
}

// 显示提示消息
function showToast(message, type = 'info') {
    // 简单的Toast实现，也可以使用全局Toast组件
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '25px',
        zIndex: '1000',
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        animation: 'slideInDown 0.3s ease-out'
    });
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-in forwards';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 工具函数：时间字符串转秒数
function parseTimeToSeconds(timeStr) {
    const parts = timeStr.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

// 键盘快捷键
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // 关闭所有弹窗
        document.querySelectorAll('.modal-content').forEach(modal => {
            modal.closest('.word-detail-modal, .confirm-modal, .share-modal').classList.remove('active');
        });
    } else if (event.key === 'r' && event.ctrlKey) {
        // Ctrl+R 重新开始
        event.preventDefault();
        restartGame();
    } else if (event.key === 'h' && event.ctrlKey) {
        // Ctrl+H 返回主页
        event.preventDefault();
        backToHome();
    }
});

// 导出模块功能
window.GameOverModule = {
    initWithResult: (result) => {
        gameResult = {...gameResult, ...result};
        initGameOverScreen();
    },
    updateGameResult: (result) => {
        gameResult = {...gameResult, ...result};
        updateGameResultUI();
        updateWordReview();
        updateAchievements();
    },
    getGameResult: () => gameResult,
    showWordDetail,
    switchReviewType,
    playWordComplete
};

console.log('📦 游戏结束模块加载完成，可通过 window.GameOverModule 访问');