const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

// 创建详细测试截图目录
const screenshotDir = path.join(__dirname, 'detailed-test-screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
}

async function runDetailedIssueTest() {
    console.log('🔍 开始详细问题分析测试...');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    try {
        // 1. 测试单词本页面跳转问题
        await testVocabularyNavigation(page);

        // 2. 测试游戏中的语音和字幕
        await testGameSpeechAndSubtitles(page);

        // 3. 测试敌机击中逻辑
        await testEnemyHitDetails(page);

        // 4. 测试UI元素可见性
        await testUIElementDetails(page);

        // 5. 测试返回按钮问题
        await testReturnButtonIssue(page);

    } catch (error) {
        console.error('详细测试错误:', error);
    } finally {
        await browser.close();
    }
}

async function testVocabularyNavigation(page) {
    console.log('\n📚 详细测试单词本导航...');

    await page.goto('http://localhost:8080');
    await page.waitForTimeout(2000);

    // 截取首页
    await page.screenshot({ path: path.join(screenshotDir, '01-homepage.png') });

    // 查找并点击单词本按钮
    console.log('查找单词本按钮...');
    const vocabButton = await page.locator('text=单词本').first();

    if (await vocabButton.isVisible()) {
        console.log('✅ 找到单词本按钮');
        await vocabButton.click();
        await page.waitForTimeout(2000);

        // 截取点击后的页面
        await page.screenshot({ path: path.join(screenshotDir, '02-after-vocab-click.png') });

        // 检查URL是否改变
        const currentUrl = page.url();
        console.log('当前URL:', currentUrl);

        // 检查页面内容
        const pageTitle = await page.title();
        console.log('页面标题:', pageTitle);

        // 查找单词本特有的元素
        const vocabElements = [
            '.vocabulary-container',
            '.word-list',
            '.vocabulary-book',
            '.word-item',
            '[data-page="vocabulary"]'
        ];

        let vocabPageFound = false;
        for (const selector of vocabElements) {
            try {
                const element = await page.locator(selector).first();
                if (await element.isVisible()) {
                    vocabPageFound = true;
                    console.log(`✅ 找到单词本页面元素: ${selector}`);
                    break;
                }
            } catch (e) {
                // 继续尝试
            }
        }

        if (!vocabPageFound) {
            console.log('❌ 单词本页面跳转失败，可能还在首页');

            // 检查是否有模态框或弹出层
            const modalSelectors = [
                '.modal',
                '.popup',
                '.overlay',
                '.vocabulary-modal',
                '[style*="z-index"]'
            ];

            for (const selector of modalSelectors) {
                try {
                    const element = await page.locator(selector);
                    const count = await element.count();
                    if (count > 0) {
                        console.log(`找到可能的模态框: ${selector} (${count}个)`);
                        await page.screenshot({ path: path.join(screenshotDir, '03-modal-check.png') });
                    }
                } catch (e) {
                    // 继续尝试
                }
            }
        }

        // 查找返回按钮
        await testReturnButtonVisibility(page);

    } else {
        console.log('❌ 找不到单词本按钮');
    }
}

async function testReturnButtonVisibility(page) {
    console.log('\n🔙 测试返回按钮可见性...');

    const returnSelectors = [
        'text=返回',
        'text=Back',
        'text=←',
        '.back-btn',
        '.return-btn',
        '[class*="back"]',
        '[class*="return"]',
        '[onclick*="back"]',
        '[onclick*="return"]'
    ];

    let returnButtonFound = false;
    for (const selector of returnSelectors) {
        try {
            const elements = await page.locator(selector);
            const count = await elements.count();

            if (count > 0) {
                console.log(`找到${count}个可能的返回按钮: ${selector}`);

                for (let i = 0; i < count; i++) {
                    const element = elements.nth(i);
                    const isVisible = await element.isVisible();
                    const isClickable = await element.isEnabled();
                    const box = await element.boundingBox();

                    console.log(`  返回按钮 ${i+1}: 可见=${isVisible}, 可点击=${isClickable}`);
                    if (box) {
                        console.log(`  位置: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);
                    }

                    if (isVisible) {
                        returnButtonFound = true;
                        // 测试点击
                        try {
                            await element.click();
                            await page.waitForTimeout(1000);
                            console.log('✅ 返回按钮点击成功');
                            await page.screenshot({ path: path.join(screenshotDir, '04-after-return-click.png') });
                        } catch (e) {
                            console.log('❌ 返回按钮点击失败:', e.message);
                        }
                        break;
                    }
                }
            }
        } catch (e) {
            // 继续尝试
        }
    }

    if (!returnButtonFound) {
        console.log('❌ 没有找到可见的返回按钮');
    }
}

async function testGameSpeechAndSubtitles(page) {
    console.log('\n🔊 详细测试游戏中的语音和字幕...');

    // 回到首页并开始游戏
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(2000);

    // 开始游戏
    const startButton = await page.locator('text=开始游戏').first();
    if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForTimeout(3000);

        // 截取游戏界面
        await page.screenshot({ path: path.join(screenshotDir, '05-game-started.png') });

        // 监听控制台消息
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push(msg.text());
            console.log('控制台:', msg.text());
        });

        // 注入脚本监听语音事件
        await page.addInitScript(() => {
            window.speechEvents = [];
            window.gameEvents = [];

            // 劫持speechSynthesis.speak
            if (window.speechSynthesis) {
                const originalSpeak = window.speechSynthesis.speak;
                window.speechSynthesis.speak = function(utterance) {
                    window.speechEvents.push({
                        text: utterance.text,
                        timestamp: Date.now(),
                        lang: utterance.lang
                    });
                    console.log('🔊 语音播放:', utterance.text);
                    return originalSpeak.call(this, utterance);
                };
            }

            // 监听游戏事件
            const originalLog = console.log;
            console.log = function(...args) {
                window.gameEvents.push(args.join(' '));
                return originalLog.apply(console, args);
            };
        });

        // 等待游戏运行一段时间
        console.log('等待游戏事件...');
        await page.waitForTimeout(10000);

        // 获取语音事件
        const speechEvents = await page.evaluate(() => window.speechEvents || []);
        console.log('语音事件数量:', speechEvents.length);
        speechEvents.forEach(event => {
            console.log(`  语音: "${event.text}" (${event.lang || 'no-lang'})`);
        });

        // 检查字幕显示
        const subtitleSelectors = [
            '[class*="subtitle"]',
            '[class*="word"]',
            '[class*="target"]',
            '.current-word',
            '.target-word'
        ];

        for (const selector of subtitleSelectors) {
            try {
                const elements = await page.locator(selector);
                const count = await elements.count();
                if (count > 0) {
                    console.log(`找到${count}个可能的字幕元素: ${selector}`);
                    for (let i = 0; i < Math.min(count, 3); i++) {
                        const text = await elements.nth(i).textContent();
                        console.log(`  字幕内容: "${text}"`);
                    }
                }
            } catch (e) {
                // 继续尝试
            }
        }

        // 截取语音测试结果
        await page.screenshot({ path: path.join(screenshotDir, '06-speech-test-result.png') });
    }
}

async function testEnemyHitDetails(page) {
    console.log('\n🎯 详细测试敌机击中逻辑...');

    // 确保在游戏界面
    const gameCanvas = await page.locator('canvas').first();
    if (await gameCanvas.isVisible()) {
        console.log('✅ 找到游戏画布');

        // 注入脚本监听击中事件
        await page.evaluate(() => {
            window.hitEvents = [];
            window.enemyInfo = [];

            // 劫持可能的击中方法
            if (window.game && window.game.enemies) {
                const originalPush = Array.prototype.push;

                // 监听敌机数组变化
                window.game.enemies.push = function(...args) {
                    window.enemyInfo.push(`新敌机: ${args.length}个`);
                    return originalPush.apply(this, args);
                };
            }
        });

        // 连续射击测试
        console.log('开始连续射击测试...');
        for (let i = 0; i < 20; i++) {
            await page.keyboard.press('Space');
            await page.waitForTimeout(200);

            // 每5发检查一次状态
            if (i % 5 === 0) {
                await page.screenshot({
                    path: path.join(screenshotDir, `07-shooting-${i}.png`)
                });
            }
        }

        // 检查击中结果
        const hitEvents = await page.evaluate(() => window.hitEvents || []);
        const enemyInfo = await page.evaluate(() => window.enemyInfo || []);

        console.log('击中事件:', hitEvents);
        console.log('敌机信息:', enemyInfo);

        // 截取最终状态
        await page.screenshot({ path: path.join(screenshotDir, '08-final-shooting-state.png') });
    }
}

async function testUIElementDetails(page) {
    console.log('\n🖼️ 详细测试UI元素...');

    // 检查所有可能的UI元素
    const uiSelectors = [
        '.score',
        '.lives',
        '.weapon',
        '.pause',
        '.target',
        '[class*="score"]',
        '[class*="life"]',
        '[class*="hp"]',
        '[class*="pause"]',
        '[class*="button"]'
    ];

    for (const selector of uiSelectors) {
        try {
            const elements = await page.locator(selector);
            const count = await elements.count();

            if (count > 0) {
                console.log(`找到UI元素 ${selector}: ${count}个`);

                for (let i = 0; i < Math.min(count, 3); i++) {
                    const element = elements.nth(i);
                    const isVisible = await element.isVisible();
                    const text = await element.textContent();
                    const box = await element.boundingBox();

                    console.log(`  元素${i+1}: 可见=${isVisible}, 文本="${text}"`);
                    if (box) {
                        console.log(`    位置: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);
                    }
                }
            }
        } catch (e) {
            // 继续尝试
        }
    }

    // 截取UI分析结果
    await page.screenshot({ path: path.join(screenshotDir, '09-ui-analysis.png') });
}

async function testReturnButtonIssue(page) {
    console.log('\n🔍 深入分析返回按钮问题...');

    // 检查页面的所有按钮元素
    const allButtons = await page.locator('button, [role="button"], .btn, [class*="button"]').all();

    console.log(`找到${allButtons.length}个按钮元素`);

    for (let i = 0; i < allButtons.length; i++) {
        try {
            const button = allButtons[i];
            const text = await button.textContent();
            const isVisible = await button.isVisible();
            const isEnabled = await button.isEnabled();
            const classes = await button.getAttribute('class');
            const onclick = await button.getAttribute('onclick');
            const box = await button.boundingBox();

            console.log(`按钮${i+1}:`);
            console.log(`  文本: "${text}"`);
            console.log(`  可见: ${isVisible}`);
            console.log(`  可用: ${isEnabled}`);
            console.log(`  类名: ${classes}`);
            console.log(`  点击事件: ${onclick}`);
            if (box) {
                console.log(`  位置: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);
            }
            console.log('---');
        } catch (e) {
            console.log(`按钮${i+1}: 检查失败 - ${e.message}`);
        }
    }

    // 截取按钮分析结果
    await page.screenshot({ path: path.join(screenshotDir, '10-button-analysis.png') });
}

// 运行详细测试
runDetailedIssueTest().catch(console.error);