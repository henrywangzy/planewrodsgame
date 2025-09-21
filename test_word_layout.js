const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 200
    });

    // 模拟iPhone 12设备
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        isMobile: true,
        hasTouch: true
    });

    const page = await context.newPage();

    try {
        // 加载游戏页面
        const filePath = 'file://' + path.resolve('index.html').replace(/\\/g, '/');
        console.log('📱 测试单词布局显示');
        console.log('设备: iPhone 12 (390x844)');
        console.log('----------------------------\n');

        await page.goto(filePath);
        await page.waitForTimeout(2000);

        // 进入单词本
        console.log('🔍 进入单词本页面');
        await page.locator('#vocabularyBtn').click();
        await page.waitForTimeout(1500);

        // 检查单词项数量
        const wordItems = await page.locator('.word-item').count();
        console.log('单词项数量:', wordItems);

        if (wordItems > 0) {
            // 获取第一个单词项的内容
            console.log('\n🔍 检查单词布局结构');

            for (let i = 0; i < Math.min(3, wordItems); i++) {
                const wordItem = page.locator('.word-item').nth(i);

                const wordMainText = await wordItem.locator('.word-main').textContent();
                console.log(`第${i+1}个单词主要信息:`, wordMainText.trim());

                const exampleText = await wordItem.locator('.word-example-text').textContent().catch(() => '无例句');
                if (exampleText !== '无例句') {
                    console.log(`第${i+1}个单词例句:`, exampleText.trim());
                }

                console.log('---');
            }
        }

        // 截图保存
        await page.screenshot({
            path: 'word_layout_test.png',
            fullPage: false
        });
        console.log('\n📸 截图已保存: word_layout_test.png');

        console.log('\n=============================');
        console.log('✅ 单词布局测试完成！');
        console.log('=============================');

    } catch (error) {
        console.error('测试失败:', error);
    }

    await page.waitForTimeout(3000);
    await browser.close();
})();