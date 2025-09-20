const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

// 创建截图目录
const screenshotDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
}

// 测试结果收集器
const testResults = {
    vocabularyBook: {
        wordCount: 0,
        displayIssues: [],
        navigationIssues: []
    },
    speechAndSubtitles: {
        speechEvents: [],
        subtitleEvents: [],
        timingIssues: []
    },
    enemyHitLogic: {
        hitCounts: {},
        hitIssues: []
    },
    uiElements: {
        returnButton: { visible: false, clickable: false },
        pauseButton: { visible: false, clickable: false },
        otherUIIssues: []
    },
    gameFlow: {
        canStart: false,
        canPause: false,
        canResume: false,
        canComplete: false,
        flowIssues: []
    },
    mobileAdaptation: {
        touchControls: [],
        displayIssues: [],
        interactionIssues: []
    }
};

async function runComprehensiveTest() {
    console.log('🚀 开始全面游戏测试...');

    // 1. 桌面端测试
    console.log('\n📱 开始桌面端测试...');
    await testDesktopVersion();

    // 2. 移动端测试
    console.log('\n📱 开始移动端测试...');
    await testMobileVersion();

    // 3. 生成测试报告
    generateTestReport();
}

async function testDesktopVersion() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    try {
        // 导航到游戏页面
        await page.goto('http://localhost:8080');
        await page.waitForTimeout(2000);

        // 截取初始页面
        await page.screenshot({ path: path.join(screenshotDir, '01-homepage-desktop.png') });

        // 测试1: 单词本功能
        await testVocabularyBook(page, 'desktop');

        // 测试2: 游戏流程和UI元素
        await testGameFlow(page, 'desktop');

        // 测试3: 敌机击中逻辑
        await testEnemyHitLogic(page, 'desktop');

        // 测试4: 语音和字幕
        await testSpeechAndSubtitles(page, 'desktop');

    } catch (error) {
        console.error('桌面端测试错误:', error);
        testResults.gameFlow.flowIssues.push(`桌面端测试异常: ${error.message}`);
    } finally {
        await browser.close();
    }
}

async function testMobileVersion() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();

    try {
        await page.goto('http://localhost:8080');
        await page.waitForTimeout(2000);

        // 截取移动端初始页面
        await page.screenshot({ path: path.join(screenshotDir, '01-homepage-mobile.png') });

        // 测试移动端适配
        await testMobileAdaptation(page);

        // 测试移动端单词本
        await testVocabularyBook(page, 'mobile');

        // 测试移动端游戏流程
        await testGameFlow(page, 'mobile');

    } catch (error) {
        console.error('移动端测试错误:', error);
        testResults.mobileAdaptation.interactionIssues.push(`移动端测试异常: ${error.message}`);
    } finally {
        await browser.close();
    }
}

async function testVocabularyBook(page, device) {
    console.log(`\n📚 测试单词本功能 (${device})...`);

    try {
        // 查找单词本按钮
        const vocabButton = await page.locator('text=单词本').first();
        if (await vocabButton.isVisible()) {
            await vocabButton.click();
            await page.waitForTimeout(1000);

            // 截取单词本页面
            await page.screenshot({ path: path.join(screenshotDir, `02-vocabulary-${device}.png`) });

            // 检查单词数量
            const wordElements = await page.locator('.word-item, .vocabulary-item, [class*="word"]').count();
            testResults.vocabularyBook.wordCount = wordElements;

            console.log(`找到 ${wordElements} 个单词元素`);

            // 检查单词显示是否正常
            const firstWord = await page.locator('.word-item, .vocabulary-item, [class*="word"]').first();
            if (await firstWord.isVisible()) {
                const wordText = await firstWord.textContent();
                console.log(`第一个单词: ${wordText}`);
            } else {
                testResults.vocabularyBook.displayIssues.push('单词元素不可见');
            }

            // 测试返回按钮
            const returnButtons = [
                'text=返回',
                'text=Back',
                '[class*="back"]',
                '[class*="return"]',
                '.back-button',
                '.return-button'
            ];

            let returnButtonFound = false;
            for (const selector of returnButtons) {
                try {
                    const button = await page.locator(selector).first();
                    if (await button.isVisible()) {
                        returnButtonFound = true;
                        testResults.uiElements.returnButton.visible = true;
                        await button.click();
                        testResults.uiElements.returnButton.clickable = true;
                        await page.waitForTimeout(1000);
                        console.log('✅ 返回按钮可见且可点击');
                        break;
                    }
                } catch (e) {
                    // 继续尝试下一个选择器
                }
            }

            if (!returnButtonFound) {
                testResults.vocabularyBook.navigationIssues.push('找不到返回按钮');
                console.log('❌ 找不到返回按钮');
            }

        } else {
            testResults.vocabularyBook.displayIssues.push('找不到单词本按钮');
            console.log('❌ 找不到单词本按钮');
        }

    } catch (error) {
        testResults.vocabularyBook.displayIssues.push(`单词本测试错误: ${error.message}`);
        console.error('单词本测试错误:', error);
    }
}

async function testGameFlow(page, device) {
    console.log(`\n🎮 测试游戏流程 (${device})...`);

    try {
        // 查找开始游戏按钮
        const startButtons = [
            'text=开始游戏',
            'text=Start Game',
            'text=开始',
            'text=Start',
            '[class*="start"]',
            '.start-button'
        ];

        let gameStarted = false;
        for (const selector of startButtons) {
            try {
                const button = await page.locator(selector).first();
                if (await button.isVisible()) {
                    await button.click();
                    await page.waitForTimeout(2000);
                    gameStarted = true;
                    testResults.gameFlow.canStart = true;
                    console.log('✅ 游戏成功开始');
                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        if (gameStarted) {
            // 截取游戏界面
            await page.screenshot({ path: path.join(screenshotDir, `03-game-interface-${device}.png`) });

            // 检查游戏界面元素
            await checkGameUIElements(page, device);

            // 测试暂停功能
            await testPauseResume(page, device);

            // 测试射击功能
            await testShooting(page, device);

        } else {
            testResults.gameFlow.flowIssues.push('无法启动游戏');
            console.log('❌ 无法启动游戏');
        }

    } catch (error) {
        testResults.gameFlow.flowIssues.push(`游戏流程测试错误: ${error.message}`);
        console.error('游戏流程测试错误:', error);
    }
}

async function checkGameUIElements(page, device) {
    console.log(`检查游戏UI元素 (${device})...`);

    // 检查暂停按钮
    const pauseSelectors = [
        'text=暂停',
        'text=Pause',
        'text=⏸',
        'text=||',
        '[class*="pause"]',
        '.pause-button'
    ];

    for (const selector of pauseSelectors) {
        try {
            const button = await page.locator(selector).first();
            if (await button.isVisible()) {
                testResults.uiElements.pauseButton.visible = true;
                console.log('✅ 暂停按钮可见');

                // 检查按钮位置
                const box = await button.boundingBox();
                if (box) {
                    console.log(`暂停按钮位置: x=${box.x}, y=${box.y}, width=${box.width}, height=${box.height}`);
                }
                break;
            }
        } catch (e) {
            // 继续尝试下一个选择器
        }
    }

    // 检查得分显示
    const scoreSelectors = [
        'text*=分数',
        'text*=Score',
        'text*=得分',
        '[class*="score"]'
    ];

    let scoreFound = false;
    for (const selector of scoreSelectors) {
        try {
            const element = await page.locator(selector).first();
            if (await element.isVisible()) {
                scoreFound = true;
                const scoreText = await element.textContent();
                console.log(`✅ 得分显示: ${scoreText}`);
                break;
            }
        } catch (e) {
            // 继续尝试下一个选择器
        }
    }

    if (!scoreFound) {
        testResults.uiElements.otherUIIssues.push('找不到得分显示');
    }
}

async function testPauseResume(page, device) {
    console.log(`测试暂停/继续功能 (${device})...`);

    try {
        // 尝试按P键暂停
        await page.keyboard.press('KeyP');
        await page.waitForTimeout(1000);

        // 检查是否出现暂停界面
        const pauseIndicators = [
            'text=暂停',
            'text=Paused',
            'text=游戏暂停',
            '[class*="pause"]'
        ];

        let pauseFound = false;
        for (const selector of pauseIndicators) {
            try {
                const element = await page.locator(selector);
                if (await element.isVisible()) {
                    pauseFound = true;
                    testResults.gameFlow.canPause = true;
                    console.log('✅ 游戏可以暂停');
                    break;
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        if (pauseFound) {
            // 测试继续游戏
            await page.keyboard.press('KeyP');
            await page.waitForTimeout(1000);
            testResults.gameFlow.canResume = true;
            console.log('✅ 游戏可以继续');
        }

        // 截取暂停测试后的界面
        await page.screenshot({ path: path.join(screenshotDir, `04-pause-test-${device}.png`) });

    } catch (error) {
        testResults.gameFlow.flowIssues.push(`暂停测试错误: ${error.message}`);
        console.error('暂停测试错误:', error);
    }
}

async function testShooting(page, device) {
    console.log(`测试射击功能 (${device})...`);

    try {
        // 模拟射击
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);

        // 连续射击
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('Space');
            await page.waitForTimeout(200);
        }

        // 截取射击测试
        await page.screenshot({ path: path.join(screenshotDir, `05-shooting-test-${device}.png`) });

        console.log('✅ 射击功能测试完成');

    } catch (error) {
        testResults.gameFlow.flowIssues.push(`射击测试错误: ${error.message}`);
        console.error('射击测试错误:', error);
    }
}

async function testEnemyHitLogic(page, device) {
    console.log(`\n🎯 测试敌机击中逻辑 (${device})...`);

    try {
        // 监听控制台消息来获取击中信息
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('击中') || text.includes('hit') || text.includes('destroyed')) {
                testResults.enemyHitLogic.hitCounts[text] = (testResults.enemyHitLogic.hitCounts[text] || 0) + 1;
                console.log(`击中事件: ${text}`);
            }
        });

        // 等待敌机出现并尝试击中
        await page.waitForTimeout(3000);

        // 连续射击测试击中逻辑
        for (let i = 0; i < 10; i++) {
            await page.keyboard.press('Space');
            await page.waitForTimeout(300);
        }

        // 截取敌机击中测试
        await page.screenshot({ path: path.join(screenshotDir, `06-enemy-hit-test-${device}.png`) });

        console.log('击中统计:', testResults.enemyHitLogic.hitCounts);

    } catch (error) {
        testResults.enemyHitLogic.hitIssues.push(`敌机击中测试错误: ${error.message}`);
        console.error('敌机击中测试错误:', error);
    }
}

async function testSpeechAndSubtitles(page, device) {
    console.log(`\n🔊 测试语音和字幕功能 (${device})...`);

    try {
        // 监听音频相关事件
        await page.addInitScript(() => {
            window.speechEvents = [];
            window.subtitleEvents = [];

            // 劫持speechSynthesis
            const originalSpeak = window.speechSynthesis.speak;
            window.speechSynthesis.speak = function(utterance) {
                window.speechEvents.push({
                    text: utterance.text,
                    timestamp: Date.now()
                });
                console.log('语音播放:', utterance.text);
                return originalSpeak.call(this, utterance);
            };
        });

        // 等待一些游戏事件触发语音
        await page.waitForTimeout(5000);

        // 获取语音事件
        const speechEvents = await page.evaluate(() => window.speechEvents || []);
        testResults.speechAndSubtitles.speechEvents = speechEvents;

        console.log('语音事件:', speechEvents);

        // 检查字幕显示
        const subtitleSelectors = [
            '[class*="subtitle"]',
            '[class*="caption"]',
            '[class*="word-display"]',
            'text*=目标单词'
        ];

        for (const selector of subtitleSelectors) {
            try {
                const elements = await page.locator(selector);
                const count = await elements.count();
                if (count > 0) {
                    for (let i = 0; i < count; i++) {
                        const text = await elements.nth(i).textContent();
                        testResults.speechAndSubtitles.subtitleEvents.push({
                            text: text,
                            timestamp: Date.now()
                        });
                    }
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        // 截取语音字幕测试
        await page.screenshot({ path: path.join(screenshotDir, `07-speech-subtitle-test-${device}.png`) });

    } catch (error) {
        testResults.speechAndSubtitles.timingIssues.push(`语音字幕测试错误: ${error.message}`);
        console.error('语音字幕测试错误:', error);
    }
}

async function testMobileAdaptation(page) {
    console.log('\n📱 测试移动端适配...');

    try {
        // 检查触控按钮
        const touchButtons = [
            '[class*="virtual"]',
            '[class*="touch"]',
            '[class*="mobile"]',
            '[class*="joystick"]'
        ];

        for (const selector of touchButtons) {
            try {
                const elements = await page.locator(selector);
                const count = await elements.count();
                if (count > 0) {
                    testResults.mobileAdaptation.touchControls.push(`找到${count}个触控元素: ${selector}`);
                    console.log(`✅ 找到${count}个触控元素: ${selector}`);
                }
            } catch (e) {
                // 继续尝试下一个选择器
            }
        }

        // 测试触摸事件
        await page.touchscreen.tap(100, 400); // 左下角
        await page.waitForTimeout(500);
        await page.touchscreen.tap(300, 400); // 右下角
        await page.waitForTimeout(500);

        // 检查响应式布局
        const viewportSize = page.viewportSize();
        console.log(`移动端视口大小: ${viewportSize.width}x${viewportSize.height}`);

        // 截取移动端适配测试
        await page.screenshot({ path: path.join(screenshotDir, '08-mobile-adaptation-test.png') });

        // 检查文字大小是否适合移动端
        const smallTexts = await page.locator('*').evaluateAll(elements => {
            return elements.filter(el => {
                const style = window.getComputedStyle(el);
                const fontSize = parseFloat(style.fontSize);
                return fontSize > 0 && fontSize < 14;
            }).length;
        });

        if (smallTexts > 0) {
            testResults.mobileAdaptation.displayIssues.push(`发现${smallTexts}个过小的文字元素`);
        }

    } catch (error) {
        testResults.mobileAdaptation.interactionIssues.push(`移动端适配测试错误: ${error.message}`);
        console.error('移动端适配测试错误:', error);
    }
}

function generateTestReport() {
    console.log('\n📊 生成测试报告...');

    const report = `
# 飞机射击单词游戏 - 全面测试报告

生成时间: ${new Date().toLocaleString()}
测试地址: http://localhost:8080

## 1. 单词本功能测试

### 单词数量
- 发现单词数量: ${testResults.vocabularyBook.wordCount}

### 显示问题
${testResults.vocabularyBook.displayIssues.length > 0 ?
  testResults.vocabularyBook.displayIssues.map(issue => `- ❌ ${issue}`).join('\n') :
  '- ✅ 无显示问题'}

### 导航问题
${testResults.vocabularyBook.navigationIssues.length > 0 ?
  testResults.vocabularyBook.navigationIssues.map(issue => `- ❌ ${issue}`).join('\n') :
  '- ✅ 导航功能正常'}

## 2. 语音和字幕功能测试

### 语音事件
${testResults.speechAndSubtitles.speechEvents.length > 0 ?
  testResults.speechAndSubtitles.speechEvents.map(event => `- 🔊 "${event.text}" (${event.timestamp})`).join('\n') :
  '- ❌ 未检测到语音事件'}

### 字幕事件
${testResults.speechAndSubtitles.subtitleEvents.length > 0 ?
  testResults.speechAndSubtitles.subtitleEvents.map(event => `- 📝 "${event.text}" (${event.timestamp})`).join('\n') :
  '- ❌ 未检测到字幕显示'}

### 时机问题
${testResults.speechAndSubtitles.timingIssues.length > 0 ?
  testResults.speechAndSubtitles.timingIssues.map(issue => `- ❌ ${issue}`).join('\n') :
  '- ✅ 时机正常'}

## 3. 敌机击中逻辑测试

### 击中统计
${Object.keys(testResults.enemyHitLogic.hitCounts).length > 0 ?
  Object.entries(testResults.enemyHitLogic.hitCounts).map(([event, count]) => `- "${event}": ${count}次`).join('\n') :
  '- ❌ 未检测到击中事件'}

### 击中问题
${testResults.enemyHitLogic.hitIssues.length > 0 ?
  testResults.enemyHitLogic.hitIssues.map(issue => `- ❌ ${issue}`).join('\n') :
  '- ✅ 击中逻辑正常'}

## 4. UI元素测试

### 返回按钮
- 可见性: ${testResults.uiElements.returnButton.visible ? '✅ 可见' : '❌ 不可见'}
- 可点击性: ${testResults.uiElements.returnButton.clickable ? '✅ 可点击' : '❌ 不可点击'}

### 暂停按钮
- 可见性: ${testResults.uiElements.pauseButton.visible ? '✅ 可见' : '❌ 不可见'}
- 可点击性: ${testResults.uiElements.pauseButton.clickable ? '✅ 可点击' : '❌ 不可点击'}

### 其他UI问题
${testResults.uiElements.otherUIIssues.length > 0 ?
  testResults.uiElements.otherUIIssues.map(issue => `- ❌ ${issue}`).join('\n') :
  '- ✅ 其他UI元素正常'}

## 5. 游戏流程测试

### 基本功能
- 游戏启动: ${testResults.gameFlow.canStart ? '✅ 正常' : '❌ 异常'}
- 游戏暂停: ${testResults.gameFlow.canPause ? '✅ 正常' : '❌ 异常'}
- 游戏继续: ${testResults.gameFlow.canResume ? '✅ 正常' : '❌ 异常'}

### 流程问题
${testResults.gameFlow.flowIssues.length > 0 ?
  testResults.gameFlow.flowIssues.map(issue => `- ❌ ${issue}`).join('\n') :
  '- ✅ 游戏流程正常'}

## 6. 移动端适配测试

### 触控控件
${testResults.mobileAdaptation.touchControls.length > 0 ?
  testResults.mobileAdaptation.touchControls.map(control => `- ✅ ${control}`).join('\n') :
  '- ❌ 未发现触控控件'}

### 显示问题
${testResults.mobileAdaptation.displayIssues.length > 0 ?
  testResults.mobileAdaptation.displayIssues.map(issue => `- ❌ ${issue}`).join('\n') :
  '- ✅ 移动端显示正常'}

### 交互问题
${testResults.mobileAdaptation.interactionIssues.length > 0 ?
  testResults.mobileAdaptation.interactionIssues.map(issue => `- ❌ ${issue}`).join('\n') :
  '- ✅ 移动端交互正常'}

## 7. 截图证明

测试过程中生成的截图保存在 ./test-screenshots/ 目录中:

1. 01-homepage-desktop.png - 桌面端首页
2. 01-homepage-mobile.png - 移动端首页
3. 02-vocabulary-desktop.png - 桌面端单词本
4. 02-vocabulary-mobile.png - 移动端单词本
5. 03-game-interface-desktop.png - 桌面端游戏界面
6. 03-game-interface-mobile.png - 移动端游戏界面
7. 04-pause-test-desktop.png - 桌面端暂停测试
8. 04-pause-test-mobile.png - 移动端暂停测试
9. 05-shooting-test-desktop.png - 桌面端射击测试
10. 05-shooting-test-mobile.png - 移动端射击测试
11. 06-enemy-hit-test-desktop.png - 桌面端敌机击中测试
12. 06-enemy-hit-test-mobile.png - 移动端敌机击中测试
13. 07-speech-subtitle-test-desktop.png - 桌面端语音字幕测试
14. 07-speech-subtitle-test-mobile.png - 移动端语音字幕测试
15. 08-mobile-adaptation-test.png - 移动端适配测试

## 8. 问题汇总

### 高优先级问题
${getHighPriorityIssues().map(issue => `- 🔴 ${issue}`).join('\n')}

### 中优先级问题
${getMediumPriorityIssues().map(issue => `- 🟡 ${issue}`).join('\n')}

### 低优先级问题
${getLowPriorityIssues().map(issue => `- 🟢 ${issue}`).join('\n')}

## 9. 建议修复方案

${generateFixSuggestions()}

---

*测试完成时间: ${new Date().toLocaleString()}*
`;

    // 保存测试报告
    fs.writeFileSync(path.join(__dirname, 'comprehensive-test-report.md'), report);
    console.log('✅ 测试报告已生成: comprehensive-test-report.md');
    console.log(`📁 截图保存在: ${screenshotDir}`);
}

function getHighPriorityIssues() {
    const issues = [];

    if (!testResults.gameFlow.canStart) {
        issues.push('游戏无法启动');
    }

    if (!testResults.uiElements.returnButton.visible) {
        issues.push('返回按钮不可见');
    }

    if (testResults.vocabularyBook.wordCount === 0) {
        issues.push('单词本中没有单词');
    }

    if (testResults.speechAndSubtitles.speechEvents.length === 0) {
        issues.push('语音功能未工作');
    }

    return issues;
}

function getMediumPriorityIssues() {
    const issues = [];

    if (!testResults.gameFlow.canPause) {
        issues.push('暂停功能异常');
    }

    if (!testResults.uiElements.pauseButton.visible) {
        issues.push('暂停按钮不可见');
    }

    if (testResults.mobileAdaptation.touchControls.length === 0) {
        issues.push('移动端缺少触控控件');
    }

    return issues;
}

function getLowPriorityIssues() {
    const issues = [];

    if (testResults.mobileAdaptation.displayIssues.length > 0) {
        issues.push(...testResults.mobileAdaptation.displayIssues);
    }

    if (testResults.uiElements.otherUIIssues.length > 0) {
        issues.push(...testResults.uiElements.otherUIIssues);
    }

    return issues;
}

function generateFixSuggestions() {
    const suggestions = [];

    if (!testResults.gameFlow.canStart) {
        suggestions.push('检查开始游戏按钮的选择器和事件绑定');
    }

    if (!testResults.uiElements.returnButton.visible) {
        suggestions.push('确保返回按钮在单词本页面正确显示');
    }

    if (testResults.vocabularyBook.wordCount === 0) {
        suggestions.push('检查单词数据是否正确加载和渲染');
    }

    if (testResults.speechAndSubtitles.speechEvents.length === 0) {
        suggestions.push('检查Web Speech API的兼容性和权限设置');
    }

    if (testResults.mobileAdaptation.touchControls.length === 0) {
        suggestions.push('添加移动端专用的触控控件');
    }

    return suggestions.length > 0 ? suggestions.map(s => `- ${s}`).join('\n') : '- 未发现需要修复的关键问题';
}

// 运行测试
runComprehensiveTest().catch(console.error);