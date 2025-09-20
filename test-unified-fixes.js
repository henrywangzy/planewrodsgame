const { chromium } = require('playwright');
const path = require('path');

async function testUnifiedFixes() {
    const browser = await chromium.launch({
        headless: false,
        devtools: true
    });

    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true
    });

    const page = await context.newPage();

    // 监听控制台消息
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('显示统一单词学习弹窗') || text.includes('📚') || text.includes('单词')) {
            console.log(`📝 控制台: ${text}`);
        }
    });

    const filePath = path.resolve(__dirname, 'index.html');
    await page.goto(`file:///${filePath}`);

    console.log('\n=== 测试统一单词学习弹窗 ===\n');

    // 1. 测试游戏中的单词学习弹窗
    console.log('1️⃣ 测试游戏中的统一单词学习弹窗...');

    // 点击开始游戏
    await page.click('#startGameBtn');
    await page.waitForTimeout(1000);

    // 设置测试模式
    await page.evaluate(() => {
        window.testMode = true;
        window.audioEnabled = false; // 关闭音频以加快测试

        // 模拟击中目标敌机
        if (window.game && window.game.currentWordData) {
            console.log('🎯 测试：触发统一单词学习弹窗');
            window.game.startCompleteWordReading(window.game.currentWordData);
        }
    });

    await page.waitForTimeout(2000);

    // 检查统一弹窗是否显示
    const unifiedDialog = await page.locator('.unified-word-dialog').first();
    if (await unifiedDialog.isVisible()) {
        console.log('✅ 统一单词学习弹窗显示成功');

        // 获取弹窗内容
        const dialogContent = await unifiedDialog.innerHTML();
        console.log('📋 弹窗内容结构检查:');

        if (dialogContent.includes('font-size: 24px')) {
            console.log('  ✅ 单词显示正确（大字体）');
        }
        if (dialogContent.includes('color: #FFD700')) {
            console.log('  ✅ 中文释义显示正确（金色）');
        }
        if (dialogContent.includes('color: #E3F2FD')) {
            console.log('  ✅ 英文例句显示正确');
        }
        if (dialogContent.includes('color: #FFF9C4')) {
            console.log('  ✅ 中文翻译显示正确');
        }

        // 截图
        await unifiedDialog.screenshot({ path: 'unified-word-dialog.png' });
        console.log('📸 已保存弹窗截图: unified-word-dialog.png');
    } else {
        console.log('❌ 统一单词学习弹窗未显示');
    }

    await page.waitForTimeout(3000);

    // 2. 测试单词本布局
    console.log('\n2️⃣ 测试单词本布局修复...');

    // 返回主菜单
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.click('#backToMenuBtn');
    await page.waitForTimeout(500);

    // 进入单词本
    await page.click('#vocabularyBtn');
    await page.waitForTimeout(1000);

    // 检查单词本布局
    const wordItems = await page.locator('.word-item').all();
    if (wordItems.length > 0) {
        console.log(`✅ 单词本显示 ${wordItems.length} 个单词`);

        // 检查第一个单词的布局
        const firstItem = wordItems[0];
        const wordLine = await firstItem.locator('.word-line').first();
        const chineseLine = await firstItem.locator('.chinese-line').first();

        if (await wordLine.isVisible()) {
            console.log('  ✅ 单词行（word + 音标）显示正确');
        }
        if (await chineseLine.isVisible()) {
            console.log('  ✅ 中文释义行显示正确');
        }

        // 检查例句部分
        const exampleSection = await firstItem.locator('.example-section').first();
        if (await exampleSection.count() > 0 && await exampleSection.isVisible()) {
            console.log('  ✅ 例句部分显示正确（分行显示）');
        }

        // 截图单词本
        await page.screenshot({ path: 'vocabulary-layout.png' });
        console.log('📸 已保存单词本截图: vocabulary-layout.png');
    } else {
        console.log('❌ 单词本无法显示单词');
    }

    // 3. 检查返回按钮
    console.log('\n3️⃣ 检查返回按钮样式...');
    const backButton = await page.locator('.vocabulary-header .back-button').first();
    if (await backButton.isVisible()) {
        const buttonStyle = await backButton.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                background: computed.background,
                color: computed.color,
                text: el.textContent
            };
        });

        console.log(`  ✅ 返回按钮显示: "${buttonStyle.text}"`);
        if (buttonStyle.background.includes('linear-gradient')) {
            console.log('  ✅ 返回按钮有渐变背景');
        }
    }

    // 4. 测试整体交互
    console.log('\n4️⃣ 测试整体交互...');

    // 测试搜索功能
    await page.fill('#vocabSearch', 'cat');
    await page.waitForTimeout(500);
    const searchResults = await page.locator('.word-item').count();
    console.log(`  ✅ 搜索"cat"显示 ${searchResults} 个结果`);

    // 清空搜索
    await page.fill('#vocabSearch', '');
    await page.waitForTimeout(500);

    console.log('\n=== 测试完成 ===\n');

    // 保持浏览器开启几秒以便观察
    await page.waitForTimeout(3000);
    await browser.close();
}

testUnifiedFixes().catch(console.error);