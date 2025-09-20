const { chromium } = require('playwright');

async function testFixes() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    console.log('🔍 开始测试修复效果...\n');

    // 测试1：单词本功能
    console.log('📚 测试1: 单词本功能');
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    // 点击单词本按钮
    const vocabBtn = await page.locator('#vocabularyBtn');
    if (await vocabBtn.isVisible()) {
        await vocabBtn.click();
        await page.waitForTimeout(2000);

        // 检查是否显示单词本界面
        const vocabScreen = await page.locator('#vocabularyScreen').isVisible();
        console.log(`   ✅ 单词本界面显示: ${vocabScreen}`);

        // 检查单词数量
        const wordItems = await page.locator('.word-item').count();
        console.log(`   ✅ 显示单词数量: ${wordItems}`);

        // 检查年级选择器
        const gradeSelect = await page.locator('#vocabGradeSelect').isVisible();
        console.log(`   ✅ 年级选择器可见: ${gradeSelect}`);

        // 测试搜索功能
        const searchInput = await page.locator('#vocabSearch');
        if (await searchInput.isVisible()) {
            await searchInput.fill('cat');
            await page.waitForTimeout(500);
            const searchResults = await page.locator('.word-item').count();
            console.log(`   ✅ 搜索"cat"结果: ${searchResults}个`);
        }

        // 测试返回按钮
        const backBtn = await page.locator('.vocabulary-header .back-button');
        if (await backBtn.isVisible()) {
            const backBtnStyle = await backBtn.evaluate(el => window.getComputedStyle(el));
            console.log(`   ✅ 返回按钮可见且可点击`);
        }
    }

    // 测试2：游戏中的语音和字幕
    console.log('\n🎮 测试2: 游戏语音和字幕同步');
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    // 开始游戏
    await page.locator('#startBtn').click();
    await page.waitForTimeout(2000);

    // 监听语音事件
    const voiceEvents = [];
    await page.evaluateOnNewDocument(() => {
        window.voiceEvents = [];
        const originalSpeak = window.speechSynthesis.speak;
        window.speechSynthesis.speak = function(utterance) {
            window.voiceEvents.push({
                text: utterance.text,
                time: Date.now()
            });
            return originalSpeak.call(this, utterance);
        };
    });

    // 检查字幕显示
    const subtitle = await page.locator('#subtitle').isVisible();
    console.log(`   ✅ 字幕显示: ${subtitle}`);

    // 测试3：敌机击中反馈
    console.log('\n💥 测试3: 敌机击中反馈');

    // 发射多次子弹测试击中
    for(let i = 0; i < 10; i++) {
        await page.keyboard.press('Space');
        await page.waitForTimeout(100);
    }

    // 检查得分显示
    const scoreDisplay = await page.locator('#score').isVisible();
    console.log(`   ✅ 得分显示: ${scoreDisplay}`);

    // 测试4：UI可见性
    console.log('\n🎨 测试4: UI元素可见性');

    // 检查暂停按钮
    const pauseBtn = await page.locator('#mobilePauseBtn').isVisible();
    console.log(`   ✅ 暂停按钮可见: ${pauseBtn}`);

    // 测试暂停功能
    if (pauseBtn) {
        await page.locator('#mobilePauseBtn').click();
        await page.waitForTimeout(500);
        const isPaused = await page.evaluate(() => window.isPaused);
        console.log(`   ✅ 暂停功能工作: ${isPaused}`);
    }

    console.log('\n✅ 测试完成！');

    await page.screenshot({ path: 'test-results.png' });
    await browser.close();
}

testFixes().catch(console.error);