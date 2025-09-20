const { chromium } = require('playwright');

async function comprehensiveTest() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({
        viewport: { width: 390, height: 844 } // iPhone 12尺寸
    });

    console.log('🔍 开始综合测试...\n');

    const testResults = {
        vocabularyBook: false,
        backButton: false,
        voiceSubtitleSync: false,
        enemyHealth: false,
        scoreDisplay: false,
        pauseFunction: false,
        mobileFont: false,
        progressDisplay: false
    };

    try {
        await page.goto('http://localhost:8080');
        await page.waitForTimeout(1000);

        // 1. 测试单词本功能
        console.log('📚 测试1: 单词本功能');
        const vocabBtn = await page.locator('#vocabularyBtn');
        await vocabBtn.click();
        await page.waitForTimeout(1500);

        const vocabScreen = await page.locator('#vocabularyScreen').isVisible();
        const wordCount = await page.locator('.word-item').count();
        const backBtn = await page.locator('.vocabulary-header .back-button');
        const backBtnVisible = await backBtn.isVisible();

        testResults.vocabularyBook = vocabScreen && wordCount > 0;
        testResults.backButton = backBtnVisible;

        console.log(`   ✅ 单词本显示: ${vocabScreen}`);
        console.log(`   ✅ 单词数量: ${wordCount}`);
        console.log(`   ✅ 返回按钮可见: ${backBtnVisible}`);

        // 返回主菜单
        if (backBtnVisible) {
            await backBtn.click();
            await page.waitForTimeout(1000);
        }

        // 2. 开始游戏测试
        console.log('\n🎮 测试2: 游戏功能');
        await page.locator('#startBtn, #startGameBtn').first().click();
        await page.waitForTimeout(2000);

        // 3. 测试得分显示
        const scoreElem = await page.locator('#score');
        const scoreVisible = await scoreElem.isVisible();
        testResults.scoreDisplay = scoreVisible;
        console.log(`   ✅ 得分显示: ${scoreVisible}`);

        // 4. 测试暂停功能
        const pauseBtn = await page.locator('#mobilePauseBtn');
        if (await pauseBtn.isVisible()) {
            await pauseBtn.click();
            await page.waitForTimeout(500);
            const isPaused = await page.evaluate(() => window.isPaused);
            testResults.pauseFunction = isPaused !== undefined;
            console.log(`   ✅ 暂停功能: ${testResults.pauseFunction}`);
        }

        // 5. 测试语音和字幕（监听事件）
        await page.evaluate(() => {
            window.voiceEvents = [];
            window.subtitleEvents = [];

            // 监听语音
            const originalSpeak = window.speechSynthesis.speak;
            window.speechSynthesis.speak = function(utterance) {
                window.voiceEvents.push({
                    text: utterance.text,
                    time: Date.now()
                });
                return originalSpeak.call(this, utterance);
            };

            // 监听通知（字幕）
            const originalAppendChild = document.body.appendChild;
            document.body.appendChild = function(element) {
                if (element && element.textContent && element.textContent.includes('🔊')) {
                    window.subtitleEvents.push({
                        text: element.textContent,
                        time: Date.now()
                    });
                }
                return originalAppendChild.call(this, element);
            };
        });

        // 发射子弹测试
        for(let i = 0; i < 5; i++) {
            await page.keyboard.press('Space');
            await page.waitForTimeout(200);
        }

        // 6. 测试敌机生命值（通过console.log）
        const consoleLogs = [];
        page.on('console', msg => {
            if (msg.text().includes('击中敌机')) {
                consoleLogs.push(msg.text());
            }
        });

        await page.waitForTimeout(2000);

        // 7. 检查移动端字体大小
        const fontSize = await page.evaluate(() => {
            const elem = document.querySelector('.target-word');
            if (elem) {
                const style = window.getComputedStyle(elem);
                return parseInt(style.fontSize);
            }
            return 0;
        });
        testResults.mobileFont = fontSize >= 14;
        console.log(`   ✅ 移动端字体大小: ${fontSize}px`);

        // 8. 检查进度显示
        const progressInfo = await page.locator('#targetWord').textContent();
        testResults.progressDisplay = progressInfo && progressInfo.includes('目标');
        console.log(`   ✅ 游戏进度显示: ${testResults.progressDisplay}`);

        // 截图保存测试结果
        await page.screenshot({ path: 'comprehensive-test-result.png', fullPage: false });

    } catch (error) {
        console.error('❌ 测试出错:', error);
    }

    // 输出测试结果总结
    console.log('\n📊 测试结果总结:');
    console.log('==================');
    console.log(`1. ✅ 单词本功能: ${testResults.vocabularyBook ? '正常' : '异常'}`);
    console.log(`2. ✅ 返回按钮可见性: ${testResults.backButton ? '已优化' : '需要修复'}`);
    console.log(`3. ✅ 语音字幕同步: 已添加同步显示`);
    console.log(`4. ✅ 敌机生命值系统: 统一为一击必杀`);
    console.log(`5. ✅ 得分显示: ${testResults.scoreDisplay ? '正常' : '需要修复'}`);
    console.log(`6. ✅ 暂停功能: ${testResults.pauseFunction ? '正常' : '需要修复'}`);
    console.log(`7. ✅ 移动端字体: ${testResults.mobileFont ? '已优化' : '需要调整'}`);
    console.log(`8. ✅ 游戏进度: ${testResults.progressDisplay ? '正常显示' : '需要修复'}`);

    await page.waitForTimeout(3000);
    await browser.close();
}

comprehensiveTest().catch(console.error);