const { chromium } = require('playwright');
const path = require('path');

async function testCompactLayout() {
    const browser = await chromium.launch({
        headless: false,
        devtools: false
    });

    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true
    });

    const page = await context.newPage();

    const filePath = path.resolve(__dirname, 'index.html');
    await page.goto(`file:///${filePath}`);

    console.log('\n=== 测试紧凑布局 ===\n');

    // 进入单词本
    await page.click('#vocabularyBtn');
    await page.waitForTimeout(1000);

    // 检查顶部导航栏高度
    const headerHeight = await page.locator('.vocab-header-compact').evaluate(el => {
        return el.offsetHeight;
    });
    console.log(`✅ 顶部导航栏高度: ${headerHeight}px (目标: ~50px)`);

    // 检查单词项
    const wordItems = await page.locator('.word-item').all();
    if (wordItems.length > 0) {
        const firstItemHeight = await wordItems[0].evaluate(el => el.offsetHeight);
        console.log(`✅ 单词项高度: ${firstItemHeight}px`);

        // 获取第一个单词的显示内容
        const wordInfo = await wordItems[0].locator('.word-info-compact').textContent();
        console.log(`✅ 单词信息单行显示: ${wordInfo}`);

        // 检查例句
        const hasExample = await wordItems[0].locator('.example-compact').count() > 0;
        if (hasExample) {
            const exampleHeight = await wordItems[0].locator('.example-compact').evaluate(el => el.offsetHeight);
            console.log(`✅ 例句高度: ${exampleHeight}px`);
        }
    }

    // 计算一屏可以显示的单词数量
    const viewportHeight = 844;
    const contentArea = viewportHeight - headerHeight - 60; // 减去头部和底部
    const avgItemHeight = await wordItems[0].evaluate(el => el.offsetHeight);
    const itemsPerScreen = Math.floor(contentArea / avgItemHeight);
    console.log(`✅ 一屏可显示单词数: ${itemsPerScreen}个`);

    // 截图
    await page.screenshot({ path: 'vocabulary-compact.png' });
    console.log('📸 已保存紧凑布局截图: vocabulary-compact.png');

    console.log('\n=== 测试完成 ===\n');

    await page.waitForTimeout(3000);
    await browser.close();
}

testCompactLayout().catch(console.error);