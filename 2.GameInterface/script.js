// 游戏界面模块JavaScript

// 游戏状态变量
let gameRunning = false;
let gamePaused = false;
let gameLoop = null;
let score = 0;
let level = 1;
let wordsEaten = 0;
let wordsTotal = 10;

// 游戏对象
let snake = [];
let currentDirection = 'right';
let nextDirection = 'right';
let currentTargetWord = null;
let distractorFoods = [];

// 游戏设置
let gameSpeed = 300;
let gridSize = 20;
let canvasWidth = 350;
let canvasHeight = 400;

// 音效设置
let musicEnabled = true;
let soundEnabled = true;

// 示例单词数据
const GAME_WORDS = {
    1: [
        { word: 'Cat', chinese: '猫', pronunciation: '/kæt/', example: 'The cat is cute. 这只猫很可爱。' },
        { word: 'Dog', chinese: '狗', pronunciation: '/dɔːɡ/', example: 'My dog is friendly. 我的狗很友好。' },
        { word: 'Apple', chinese: '苹果', pronunciation: '/ˈæp.əl/', example: 'I eat an apple every day. 我每天吃一个苹果。' },
        { word: 'Book', chinese: '书', pronunciation: '/bʊk/', example: 'I love reading books. 我喜欢读书。' },
        { word: 'Water', chinese: '水', pronunciation: '/ˈwɔː.tər/', example: 'I drink water every day. 我每天喝水。' }
    ],
    2: [
        { word: 'School', chinese: '学校', pronunciation: '/skuːl/', example: 'I go to school every day. 我每天去上学。' },
        { word: 'Friend', chinese: '朋友', pronunciation: '/frend/', example: 'She is my best friend. 她是我最好的朋友。' },
        { word: 'Happy', chinese: '开心的', pronunciation: '/ˈhæp.i/', example: 'I am happy today. 我今天很开心。' },
        { word: 'Beautiful', chinese: '美丽的', pronunciation: '/ˈbjuː.tɪ.fəl/', example: 'The flower is beautiful. 这朵花很美丽。' }
    ],
    3: [
        { word: 'Adventure', chinese: '冒险', pronunciation: '/ədˈven.tʃər/', example: 'Life is an adventure. 生活是一场冒险。' },
        { word: 'Knowledge', chinese: '知识', pronunciation: '/ˈnɑː.lɪdʒ/', example: 'Knowledge is power. 知识就是力量。' },
        { word: 'Creative', chinese: '创造性的', pronunciation: '/kriˈeɪ.tɪv/', example: 'She is very creative. 她很有创造力。' }
    ]
};

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initGameInterface();
});

// 初始化游戏界面
function initGameInterface() {
    console.log('🎮 游戏界面模块初始化');
    
    // 初始化音频系统
    initAudioSystem();
    
    // 初始化蛇身
    initSnake();
    
    // 生成目标单词
    generateTargetWord();
    
    // 生成干扰食物
    generateDistractorFoods();
    
    // 更新UI
    updateGameUI();
    
    // 添加键盘控制
    addKeyboardControls();
    
    // 开始游戏演示模式
    startDemoMode();
    
    console.log('✅ 游戏界面初始化完成');
}

// 初始化蛇身
function initSnake() {
    snake = [
        { x: 100, y: 100 },
        { x: 80, y: 100 },
        { x: 60, y: 100 }
    ];
    
    currentDirection = 'right';
    nextDirection = 'right';
    
    updateSnakeDisplay();
}

// 更新蛇身显示
function updateSnakeDisplay() {
    const snakeContainer = document.getElementById('snakeContainer');
    
    // 清除现有蛇身
    snakeContainer.innerHTML = '';
    
    // 创建蛇身段
    snake.forEach((segment, index) => {
        const segmentElement = document.createElement('div');
        segmentElement.className = index === 0 ? 'snake-segment snake-head' : 'snake-segment';
        segmentElement.style.left = segment.x + 'px';
        segmentElement.style.top = segment.y + 'px';
        
        if (index === 0) {
            // 添加眼睛
            segmentElement.innerHTML = `
                <div class="eye left-eye"></div>
                <div class="eye right-eye"></div>
            `;
            segmentElement.id = 'snakeHead';
        }
        
        snakeContainer.appendChild(segmentElement);
    });
}

// 生成目标单词
function generateTargetWord() {
    const currentGrade = getCurrentGrade();
    const wordList = GAME_WORDS[currentGrade] || GAME_WORDS[1];
    
    currentTargetWord = wordList[Math.floor(Math.random() * wordList.length)];
    
    // 更新UI显示
    updateTargetWordUI();
    
    // 在游戏区域显示目标食物
    displayTargetFood();
}

// 更新目标单词UI
function updateTargetWordUI() {
    if (!currentTargetWord) return;
    
    document.getElementById('targetWord').textContent = currentTargetWord.word;
    document.getElementById('targetChinese').textContent = currentTargetWord.chinese;
}

// 显示目标食物
function displayTargetFood() {
    const targetFood = document.getElementById('targetFood');
    
    if (currentTargetWord) {
        targetFood.querySelector('.word-english').textContent = currentTargetWord.word;
        targetFood.querySelector('.word-chinese').textContent = currentTargetWord.chinese;
        
        // 随机位置
        const x = Math.random() * (canvasWidth - 100) + 50;
        const y = Math.random() * (canvasHeight - 100) + 50;
        
        targetFood.style.left = x + 'px';
        targetFood.style.top = y + 'px';
        targetFood.style.display = 'flex';
    }
}

// 生成干扰食物
function generateDistractorFoods() {
    const foodContainer = document.getElementById('foodContainer');
    const currentGrade = getCurrentGrade();
    const wordList = GAME_WORDS[currentGrade] || GAME_WORDS[1];
    
    // 清除现有干扰食物（保留目标食物）
    const existingFoods = foodContainer.querySelectorAll('.food-item:not(#targetFood)');
    existingFoods.forEach(food => food.remove());
    
    // 生成2-3个干扰食物
    const distractorCount = Math.floor(Math.random() * 2) + 2;
    
    for (let i = 0; i < distractorCount; i++) {
        const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
        
        // 确保不是目标单词
        if (randomWord === currentTargetWord) continue;
        
        const foodElement = document.createElement('div');
        foodElement.className = 'food-item animate-fadeIn';
        foodElement.innerHTML = `
            <div class="word-english">${randomWord.word}</div>
            <div class="word-chinese">${randomWord.chinese}</div>
        `;
        
        // 随机位置（避免与目标食物重叠）
        const x = Math.random() * (canvasWidth - 100) + 50;
        const y = Math.random() * (canvasHeight - 100) + 50;
        
        foodElement.style.left = x + 'px';
        foodElement.style.top = y + 'px';
        
        // 点击事件（演示用）
        foodElement.onclick = () => handleFoodClick(randomWord, false);
        
        foodContainer.appendChild(foodElement);
    }
    
    // 为目标食物添加点击事件
    document.getElementById('targetFood').onclick = () => handleFoodClick(currentTargetWord, true);
}

// 处理食物点击
function handleFoodClick(word, isTarget) {
    if (isTarget) {
        // 正确答案
        eatTargetFood(word);
    } else {
        // 错误答案
        showGameStatus('❌ 不是目标单词！', 2000);
        playErrorSound();
    }
}

// 吃到目标食物
function eatTargetFood(word) {
    console.log(`🎯 吃到目标单词: ${word.word}`);
    
    // 播放成功音效
    playSuccessSound();
    
    // 显示食物被吃的动画
    const targetFood = document.getElementById('targetFood');
    targetFood.classList.add('food-eaten');
    
    // 更新分数和进度
    score += 10 + (level * 5);
    wordsEaten++;
    
    // 显示字幕
    showSubtitle(word);
    
    // 朗读单词信息
    speakWordInfo(word);
    
    // 蛇身增长动画
    growSnake();
    
    // 更新UI
    updateGameUI();
    
    setTimeout(() => {
        // 检查是否升级
        if (wordsEaten >= wordsTotal) {
            levelUp();
        } else {
            // 生成新的目标单词
            generateTargetWord();
            generateDistractorFoods();
        }
    }, 1000);
}

// 蛇身增长
function growSnake() {
    const head = document.getElementById('snakeHead');
    if (head) {
        head.classList.add('eating');
        setTimeout(() => {
            head.classList.remove('eating');
        }, 300);
    }
    
    // 添加新的身体段
    snake.push({...snake[snake.length - 1]});
    updateSnakeDisplay();
}

// 显示字幕
function showSubtitle(word) {
    const subtitleContainer = document.getElementById('subtitleContainer');
    const englishElement = document.getElementById('subtitleEnglish');
    const chineseElement = document.getElementById('subtitleChinese');
    
    // 分解例句
    const parts = word.example.split('.');
    const englishExample = parts[0] + '.';
    const chineseTranslation = parts[1] ? parts[1].trim() : '';
    
    englishElement.textContent = englishExample;
    chineseElement.textContent = chineseTranslation;
    
    subtitleContainer.classList.add('active');
    
    // 5秒后自动隐藏
    setTimeout(() => {
        hideSubtitle();
    }, 5000);
}

// 隐藏字幕
function hideSubtitle() {
    document.getElementById('subtitleContainer').classList.remove('active');
}

// 朗读单词信息
function speakWordInfo(word) {
    if (!soundEnabled) return;
    
    showSoundFeedback();
    
    if (window.GlobalAudioManager) {
        // 使用全局音频管理器进行队列化朗读
        const parts = word.example.split('.');
        const englishExample = parts[0] + '.';
        const chineseTranslation = parts[1] ? parts[1].trim() : '';
        
        const wordData = {
            word: word.word,
            chinese: word.chinese,
            example: {
                english: englishExample,
                chinese: chineseTranslation
            }
        };
        
        window.GlobalAudioManager.speakWordSequence(wordData);
        
        // 监听朗读完成事件
        const stopHandler = () => {
            hideSoundFeedback();
            document.removeEventListener('speechQueueEmpty', stopHandler);
        };
        document.addEventListener('speechQueueEmpty', stopHandler);
    } else {
        // 降级到原有的朗读方式
        const parts = word.example.split('.');
        const englishExample = parts[0] + '.';
        const chineseTranslation = parts[1] ? parts[1].trim() : '';
        
        const sequence = [
            { text: word.word, lang: 'en-US' },
            { text: word.chinese, lang: 'zh-CN' },
            { text: englishExample, lang: 'en-US' },
            { text: chineseTranslation, lang: 'zh-CN' }
        ];
        
        speakSequence(sequence, 0);
    }
}

// 朗读序列
function speakSequence(sequence, index) {
    if (index >= sequence.length) {
        hideSoundFeedback();
        return;
    }
    
    const current = sequence[index];
    if (!current.text) {
        speakSequence(sequence, index + 1);
        return;
    }
    
    const utterance = new SpeechSynthesisUtterance(current.text);
    utterance.lang = current.lang;
    utterance.rate = current.lang === 'zh-CN' ? 0.9 : 0.8;
    
    utterance.onend = () => {
        setTimeout(() => {
            speakSequence(sequence, index + 1);
        }, 500);
    };
    
    speechSynthesis.speak(utterance);
}

// 升级
function levelUp() {
    level++;
    score += 100; // 升级奖励
    wordsEaten = 0;
    wordsTotal = Math.min(wordsTotal + 2, 20); // 增加难度
    
    // 播放升级音效
    if (window.GlobalAudioManager) {
        window.GlobalAudioManager.playLevelUpSound();
    }
    
    showLevelUpModal();
    updateGameUI();
    
    console.log(`🎉 升级到第${level}关`);
}

// 显示升级弹窗
function showLevelUpModal() {
    document.getElementById('newLevel').textContent = level;
    document.getElementById('bonusScore').textContent = '100';
    document.getElementById('levelUpModal').classList.add('active');
}

// 继续升级后的游戏
function continueLevelUp() {
    document.getElementById('levelUpModal').classList.remove('active');
    
    // 生成新的目标单词
    generateTargetWord();
    generateDistractorFoods();
}

// 更新游戏UI
function updateGameUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('wordsEaten').textContent = wordsEaten;
    document.getElementById('wordsTotal').textContent = wordsTotal;
    
    // 更新进度条
    const progress = (wordsEaten / wordsTotal) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

// 方向控制
function changeDirection(direction) {
    if (gamePaused) return;
    
    // 防止反向移动
    const opposites = {
        'up': 'down',
        'down': 'up',
        'left': 'right',
        'right': 'left'
    };
    
    if (opposites[direction] !== currentDirection) {
        nextDirection = direction;
        console.log(`🕹️ 改变方向: ${direction}`);
    }
    
    // 按钮反馈效果
    const btn = document.getElementById(`btn-${direction}`);
    if (btn) {
        btn.style.background = 'rgba(76, 175, 80, 0.8)';
        setTimeout(() => {
            btn.style.background = '';
        }, 150);
    }
}

// 切换暂停
function togglePause() {
    gamePaused = !gamePaused;
    
    const pauseBtn = document.getElementById('btn-pause');
    const pauseModal = document.getElementById('pauseModal');
    
    if (gamePaused) {
        // 暂停时停止所有音频
        if (window.GlobalAudioManager) {
            window.GlobalAudioManager.setAllAudioMuted(true);
        }
        
        // 更新中间暂停按钮为播放图标
        if (pauseBtn) {
            pauseBtn.innerHTML = '▶';
            pauseBtn.classList.add('playing');
        }
        pauseModal.classList.add('active');
        showGameStatus('⏸️ 游戏已暂停，所有音频已停止', 0);
        hideSoundFeedback();
    } else {
        // 恢复时根据设置恢复音频
        if (window.GlobalAudioManager) {
            window.GlobalAudioManager.setAllAudioMuted(false);
        }
        
        // 更新中间暂停按钮为暂停图标
        if (pauseBtn) {
            pauseBtn.innerHTML = '❚❚';
            pauseBtn.classList.remove('playing');
        }
        pauseModal.classList.remove('active');
        hideGameStatus();
    }
    
    console.log(`⏸️ 游戏${gamePaused ? '暂停' : '继续'}`);
}

// 继续游戏
function resumeGame() {
    gamePaused = false;
    document.getElementById('pauseModal').classList.remove('active');
    
    // 恢复音频状态
    if (window.GlobalAudioManager) {
        window.GlobalAudioManager.setAllAudioMuted(false);
    }
    
    // 更新中间暂停按钮为暂停图标
    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) {
        pauseBtn.innerHTML = '❚❚';
        pauseBtn.classList.remove('playing');
    }
    
    hideGameStatus();
}

// 切换音乐
function toggleMusic() {
    if (window.GlobalAudioManager) {
        const newState = !window.GlobalAudioManager.isMusicEnabled;
        window.GlobalAudioManager.setMusicEnabled(newState);
        
        updateMusicButtonState();
        
        const message = newState ? '🎵 背景音乐已开启' : '🔇 背景音乐已关闭';
        showGameStatus(message, 2000);
    } else {
        // 降级处理
        musicEnabled = !musicEnabled;
        const musicIcon = document.getElementById('musicIcon');
        musicIcon.textContent = musicEnabled ? '🎵' : '🔇';
        
        console.log(`🎵 音乐${musicEnabled ? '开启' : '关闭'}`);
    }
}

// 返回主页
function backToHome() {
    showGameStatus('即将返回主界面...', 1000);
    
    // 通知音频管理器页面即将离开
    if (window.GlobalAudioManager) {
        window.GlobalAudioManager.onPageExit('GameInterface');
    }
    
    setTimeout(() => {
        // 触发返回事件
        document.dispatchEvent(new CustomEvent('gameExit', {
            detail: { 
                score: score, 
                level: level, 
                wordsEaten: wordsEaten 
            }
        }));
    }, 1000);
}

// 显示游戏状态
function showGameStatus(message, duration = 3000) {
    const gameStatus = document.getElementById('gameStatus');
    gameStatus.querySelector('.status-text').textContent = message;
    gameStatus.classList.add('active');
    
    if (duration > 0) {
        setTimeout(() => {
            hideGameStatus();
        }, duration);
    }
}

// 隐藏游戏状态
function hideGameStatus() {
    document.getElementById('gameStatus').classList.remove('active');
}

// 显示音效反馈
function showSoundFeedback() {
    document.getElementById('soundFeedback').classList.add('active');
}

// 隐藏音效反馈
function hideSoundFeedback() {
    document.getElementById('soundFeedback').classList.remove('active');
}

// 播放成功音效
function playSuccessSound() {
    if (!soundEnabled) return;
    
    // 使用 Web Audio API 生成简单音效
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        const audioContext = new (AudioContext || webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 523.25; // C5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
}

// 播放错误音效
function playErrorSound() {
    if (!soundEnabled) return;
    
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        const audioContext = new (AudioContext || webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 220; // A3
        oscillator.type = 'triangle';
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

// 添加键盘控制
function addKeyboardControls() {
    document.addEventListener('keydown', function(event) {
        if (gamePaused) {
            if (event.key === 'Escape' || event.key === ' ') {
                togglePause();
            }
            return;
        }
        
        switch(event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                event.preventDefault();
                changeDirection('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                event.preventDefault();
                changeDirection('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                event.preventDefault();
                changeDirection('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                event.preventDefault();
                changeDirection('right');
                break;
            case ' ': // 空格键暂停
                event.preventDefault();
                togglePause();
                break;
            case 'Escape': // ESC键返回
                backToHome();
                break;
        }
    });
}

// 开始演示模式
function startDemoMode() {
    showGameStatus('🎮 演示模式运行中 - 点击食物体验游戏', 3000);
    
    // 演示蛇的自动移动
    setInterval(() => {
        if (!gamePaused) {
            moveSnakeDemo();
        }
    }, 2000);
}

// 演示蛇的移动
function moveSnakeDemo() {
    currentDirection = nextDirection;
    
    // 计算新的头部位置
    const head = {...snake[0]};
    
    switch(currentDirection) {
        case 'up':
            head.y -= gridSize;
            break;
        case 'down':
            head.y += gridSize;
            break;
        case 'left':
            head.x -= gridSize;
            break;
        case 'right':
            head.x += gridSize;
            break;
    }
    
    // 边界检查（循环）
    if (head.x < 0) head.x = canvasWidth - gridSize;
    if (head.x >= canvasWidth) head.x = 0;
    if (head.y < 0) head.y = canvasHeight - gridSize;
    if (head.y >= canvasHeight) head.y = 0;
    
    // 更新蛇身
    snake.unshift(head);
    snake.pop();
    
    updateSnakeDisplay();
}

// 初始化音频系统
function initAudioSystem() {
    if (window.GlobalAudioManager) {
        window.GlobalAudioManager.onPageEnter('GameInterface');
        updateMusicButtonState();
        
        // 用户首次交互时启用音频上下文
        document.addEventListener('click', enableAudioContext, { once: true });
        document.addEventListener('touchstart', enableAudioContext, { once: true });
    }
}

// 启用音频上下文
function enableAudioContext() {
    if (window.GlobalAudioManager) {
        // 游戏界面不播放背景音乐，保持安静专注
        console.log('🔊 游戏界面音频上下文已启用');
    }
}

// 更新音乐按钮状态
function updateMusicButtonState() {
    if (!window.GlobalAudioManager) return;
    
    const musicBtn = document.getElementById('musicBtn');
    const musicIcon = document.getElementById('musicIcon');
    
    if (musicBtn && musicIcon) {
        const isMusicEnabled = window.GlobalAudioManager.isMusicEnabled;
        
        if (isMusicEnabled) {
            musicIcon.textContent = '🎵';
            musicBtn.classList.remove('muted');
            musicBtn.title = '点击关闭背景音乐';
        } else {
            musicIcon.textContent = '🔇';
            musicBtn.classList.add('muted');
            musicBtn.title = '点击开启背景音乐';
        }
    }
}

// 游戏结束
function gameOver(reason = 'collision') {
    gameRunning = false;
    gamePaused = false;
    
    // 播放游戏结束音效
    if (window.GlobalAudioManager) {
        window.GlobalAudioManager.playGameOverSound();
    }
    
    showGameStatus('🎮 游戏结束！', 0);
    console.log(`💀 游戏结束: ${reason}`);
    
    // 显示最终分数和统计
    setTimeout(() => {
        const finalStats = `
            最终分数: ${score}
            达到关卡: ${level}
            单词掌握: ${wordsEaten}
        `;
        showGameStatus(finalStats, 5000);
    }, 1500);
}

// 获取当前年级（从设置或默认值）
function getCurrentGrade() {
    return parseInt(localStorage.getItem('selectedGrade') || '1');
}

// 导出模块功能
window.GameInterfaceModule = {
    initGame: initGameInterface,
    changeDirection,
    togglePause,
    toggleMusic,
    getGameState: () => ({ score, level, wordsEaten, wordsTotal }),
    eatTargetFood,
    showSubtitle,
    speakWordInfo,
    gameOver,
    updateMusicButtonState,
    backToHome
};

console.log('📦 游戏界面模块加载完成，可通过 window.GameInterfaceModule 访问');