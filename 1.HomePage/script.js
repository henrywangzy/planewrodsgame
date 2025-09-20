// 首页模块JavaScript

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initHomePage();
});

// 初始化首页
function initHomePage() {
    console.log('🏠 首页模块初始化完成');
    
    // 添加设置变更监听
    const gradeSelect = document.getElementById('grade');
    const difficultySelect = document.getElementById('difficulty');
    
    if (gradeSelect) {
        gradeSelect.addEventListener('change', handleGradeChange);
    }
    
    if (difficultySelect) {
        difficultySelect.addEventListener('change', handleDifficultyChange);
    }
    
    // 加载保存的设置
    loadSavedSettings();
    
    // 初始化音频控制
    initAudioControls();
    
    // 添加动画效果
    addInteractionEffects();
}

// 处理年级选择变更
function handleGradeChange(event) {
    const selectedGrade = event.target.value;
    console.log(`📚 选择年级: ${selectedGrade}`);
    
    // 保存设置到localStorage
    localStorage.setItem('selectedGrade', selectedGrade);
    
    // 显示反馈
    showFeedback(`已选择 ${getGradeName(selectedGrade)} 单词`, 'success');
    
    // 触发自定义事件（供其他模块监听）
    dispatchCustomEvent('gradeChanged', { grade: selectedGrade });
}

// 处理难度选择变更
function handleDifficultyChange(event) {
    const selectedDifficulty = event.target.value;
    console.log(`⚡ 选择难度: ${selectedDifficulty}`);
    
    // 保存设置到localStorage
    localStorage.setItem('selectedDifficulty', selectedDifficulty);
    
    // 显示反馈
    showFeedback(`已选择 ${getDifficultyName(selectedDifficulty)} 难度`, 'success');
    
    // 触发自定义事件
    dispatchCustomEvent('difficultyChanged', { difficulty: selectedDifficulty });
}

// 开始游戏
function startGame() {
    console.log('🎮 开始游戏');
    
    const settings = getCurrentSettings();
    console.log('当前设置:', settings);
    
    // 显示游戏启动反馈
    showFeedback('游戏即将开始...', 'info');
    
    // 模拟游戏启动过程
    setTimeout(() => {
        showFeedback('这是首页模块演示，实际游戏需要集成到完整项目中', 'info');
    }, 1000);
    
    // 触发游戏开始事件
    dispatchCustomEvent('gameStarted', settings);
}

// 显示单词本
function showVocabularyBook() {
    console.log('📚 打开单词本');
    
    const settings = getCurrentSettings();
    
    // 显示反馈
    showFeedback('单词本即将打开...', 'info');
    
    // 模拟单词本打开
    setTimeout(() => {
        showFeedback('这是首页模块演示，实际单词本需要集成到完整项目中', 'info');
    }, 1000);
    
    // 触发单词本打开事件
    dispatchCustomEvent('vocabularyOpened', settings);
}

// 获取当前设置
function getCurrentSettings() {
    const gradeSelect = document.getElementById('grade');
    const difficultySelect = document.getElementById('difficulty');
    
    return {
        grade: gradeSelect ? gradeSelect.value : '3',
        difficulty: difficultySelect ? difficultySelect.value : 'medium',
        gradeName: getGradeName(gradeSelect ? gradeSelect.value : '3'),
        difficultyName: getDifficultyName(difficultySelect ? difficultySelect.value : 'medium')
    };
}

// 加载保存的设置
function loadSavedSettings() {
    const savedGrade = localStorage.getItem('selectedGrade');
    const savedDifficulty = localStorage.getItem('selectedDifficulty');
    
    if (savedGrade) {
        const gradeSelect = document.getElementById('grade');
        if (gradeSelect) {
            gradeSelect.value = savedGrade;
        }
    }
    
    if (savedDifficulty) {
        const difficultySelect = document.getElementById('difficulty');
        if (difficultySelect) {
            difficultySelect.value = savedDifficulty;
        }
    }
    
    console.log('⚙️ 已加载保存的设置');
}

// 获取年级名称
function getGradeName(grade) {
    const gradeNames = {
        '1': '一年级',
        '2': '二年级',
        '3': '三年级',
        '4': '四年级',
        '5': '五年级',
        '6': '六年级'
    };
    return gradeNames[grade] || '三年级';
}

// 获取难度名称
function getDifficultyName(difficulty) {
    const difficultyNames = {
        'low': '简单',
        'medium': '中等',
        'high': '困难'
    };
    return difficultyNames[difficulty] || '中等';
}

// 显示反馈信息
function showFeedback(message, type = 'info') {
    // 移除现有的弹窗
    const existingPopup = document.querySelector('.feedback-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // 创建新的反馈弹窗
    const popup = document.createElement('div');
    popup.className = 'feedback-popup';
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    
    popup.innerHTML = `
        <h3>${icon} 提示</h3>
        <p>${message}</p>
        <button onclick="closeFeedback()">确定</button>
    `;
    
    document.body.appendChild(popup);
    
    // 3秒后自动关闭
    setTimeout(() => {
        closeFeedback();
    }, 3000);
}

// 关闭反馈弹窗
function closeFeedback() {
    const popup = document.querySelector('.feedback-popup');
    if (popup) {
        popup.style.animation = 'fadeOut 0.3s ease-in-out';
        setTimeout(() => {
            popup.remove();
        }, 300);
    }
}

// 添加交互效果
function addInteractionEffects() {
    // 为按钮添加点击波纹效果
    const buttons = document.querySelectorAll('.primary-button');
    buttons.forEach(button => {
        button.addEventListener('click', createRippleEffect);
    });
    
    // 为选择框添加焦点效果
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('focus', () => {
            select.parentElement.style.transform = 'scale(1.02)';
        });
        
        select.addEventListener('blur', () => {
            select.parentElement.style.transform = 'scale(1)';
        });
    });
}

// 创建波纹效果
function createRippleEffect(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    // 添加波纹动画样式
    if (!document.querySelector('#ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// 触发自定义事件
function dispatchCustomEvent(eventName, detail) {
    const event = new CustomEvent(eventName, {
        detail: detail,
        bubbles: true,
        cancelable: true
    });
    document.dispatchEvent(event);
}

// 初始化音频控制
function initAudioControls() {
    // 通知音频管理器进入首页
    if (window.GlobalAudioManager) {
        window.GlobalAudioManager.onPageEnter('HomePage');
        updateMusicButtonState();
    }
    
    // 用户首次点击时启用音频上下文
    document.addEventListener('click', enableAudioContext, { once: true });
    document.addEventListener('touchstart', enableAudioContext, { once: true });
}

// 启用音频上下文（需要用户交互）
function enableAudioContext() {
    if (window.GlobalAudioManager) {
        // 尝试播放背景音乐
        setTimeout(() => {
            if (window.GlobalAudioManager.isMusicEnabled) {
                window.GlobalAudioManager.playBackgroundMusic();
            }
        }, 1000); // 延迟1秒，让用户看到页面
    }
}

// 切换背景音乐
function toggleBackgroundMusic() {
    if (!window.GlobalAudioManager) {
        console.warn('音频管理器未加载');
        return;
    }
    
    const newState = !window.GlobalAudioManager.isMusicEnabled;
    window.GlobalAudioManager.setMusicEnabled(newState);
    
    updateMusicButtonState();
    
    // 显示反馈
    const message = newState ? '🎵 背景音乐已开启' : '🔇 背景音乐已关闭';
    showFeedback(message, 'success');
}

// 更新音乐按钮状态
function updateMusicButtonState() {
    if (!window.GlobalAudioManager) return;
    
    const musicBtn = document.getElementById('musicToggle');
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

// 页面离开时处理
function onPageLeave() {
    if (window.GlobalAudioManager) {
        window.GlobalAudioManager.pauseBackgroundMusic();
    }
}

// 监听页面可见性变化
document.addEventListener('visibilitychange', function() {
    if (window.GlobalAudioManager) {
        if (document.hidden) {
            window.GlobalAudioManager.pauseBackgroundMusic();
        } else {
            // 页面重新可见时，如果音乐开启则播放
            if (window.GlobalAudioManager.isMusicEnabled && !window.GlobalAudioManager.isAllAudioMuted) {
                setTimeout(() => {
                    window.GlobalAudioManager.playBackgroundMusic();
                }, 100);
            }
        }
    }
});

// 导出模块功能（供其他模块使用）
window.HomePageModule = {
    getCurrentSettings,
    showFeedback,
    loadSavedSettings,
    getGradeName,
    getDifficultyName,
    toggleBackgroundMusic,
    onPageLeave
};

// 模块加载完成通知
console.log('📦 首页模块加载完成，可通过 window.HomePageModule 访问');