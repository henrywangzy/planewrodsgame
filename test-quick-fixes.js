const { chromium } = require('playwright');
const path = require('path');

async function testQuickFixes() {
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
        if (text.includes('显示统一单词学习弹窗') || text.includes('📚')) {
            console.log(`📝 控制台: ${text}`);
        }
    });

    const filePath = path.resolve(__dirname, 'index.html');
    await page.goto(`file:///${filePath}`);

    console.log('\n=== 快速测试修复 ===\n');

    // 1. 测试单词本布局
    console.log('1️⃣ 测试单词本布局...');

    // 直接进入单词本
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
            const wordText = await wordLine.locator('.word-text').textContent();
            const pronunciation = await wordLine.locator('.word-pronunciation').textContent();
            console.log(`  ✅ 第一行: ${wordText} ${pronunciation}`);
        }

        if (await chineseLine.isVisible()) {
            const chinese = await chineseLine.locator('.chinese-text').textContent();
            console.log(`  ✅ 第二行: ${chinese}`);
        }

        // 检查例句部分
        const exampleSection = await firstItem.locator('.example-section').first();
        if (await exampleSection.count() > 0 && await exampleSection.isVisible()) {
            const hasEnExample = await exampleSection.locator('.example-en').count() > 0;
            const hasCnExample = await exampleSection.locator('.example-cn').count() > 0;
            console.log(`  ✅ 例句部分: 英文=${hasEnExample} 中文=${hasCnExample}`);
        }

        // 截图单词本
        await page.screenshot({ path: 'vocabulary-final.png' });
        console.log('📸 已保存单词本截图: vocabulary-final.png');
    }

    // 2. 检查返回按钮
    console.log('\n2️⃣ 检查返回按钮...');
    const backButton = await page.locator('.vocabulary-header .back-button').first();
    if (await backButton.isVisible()) {
        const buttonText = await backButton.textContent();
        const buttonStyle = await backButton.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                background: computed.background.substring(0, 50), // 截取部分背景样式
                border: computed.border
            };
        });

        console.log(`  ✅ 返回按钮: "${buttonText.trim()}"`);
        if (buttonStyle.background.includes('gradient')) {
            console.log('  ✅ 按钮有渐变背景');
        }
    }

    // 3. 测试游戏中的统一弹窗
    console.log('\n3️⃣ 测试游戏统一弹窗...');

    // 返回主菜单
    await page.click('.vocabulary-header .back-button');
    await page.waitForTimeout(500);

    // 开始游戏
    await page.click('#startGameBtn');
    await page.waitForTimeout(2000);

    // 等待并截图游戏画面（应该会自动显示统一弹窗）
    await page.waitForTimeout(2000);

    // 查找统一弹窗
    const unifiedDialog = await page.locator('.unified-word-dialog').first();
    if (await unifiedDialog.count() > 0 && await unifiedDialog.isVisible()) {
        console.log('  ✅ 统一单词学习弹窗已显示');
        await unifiedDialog.screenshot({ path: 'game-unified-dialog.png' });
        console.log('  📸 已保存游戏弹窗截图: game-unified-dialog.png');
    }

    console.log('\n=== 测试完成 ===\n');

    await page.waitForTimeout(3000);
    await browser.close();
}

testQuickFixes().catch(console.error);