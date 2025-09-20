const { chromium } = require('playwright');
const path = require('path');

async function testMargins() {
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

    console.log('\n=== 测试边距统一性 ===\n');

    // 进入单词本
    await page.click('#vocabularyBtn');
    await page.waitForTimeout(1000);

    // 检查容器边距
    const containerPadding = await page.locator('.vocabulary-content').evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
            left: computed.paddingLeft,
            right: computed.paddingRight,
            top: computed.paddingTop,
            bottom: computed.paddingBottom
        };
    });
    console.log(`容器内边距: 左=${containerPadding.left} 右=${containerPadding.right}`);

    // 检查单词项边距
    const wordItems = await page.locator('.word-item').all();
    if (wordItems.length > 0) {
        const firstItem = wordItems[0];
        const itemMetrics = await firstItem.evaluate(el => {
            const rect = el.getBoundingClientRect();
            const computed = window.getComputedStyle(el);
            const parent = el.parentElement.getBoundingClientRect();
            return {
                width: rect.width,
                left: rect.left - parent.left,
                right: parent.right - rect.right,
                marginLeft: computed.marginLeft,
                marginRight: computed.marginRight,
                paddingLeft: computed.paddingLeft,
                paddingRight: computed.paddingRight
            };
        });

        console.log(`\n单词卡片边距:`);
        console.log(`  外边距: 左=${itemMetrics.marginLeft} 右=${itemMetrics.marginRight}`);
        console.log(`  内边距: 左=${itemMetrics.paddingLeft} 右=${itemMetrics.paddingRight}`);
        console.log(`  距容器: 左=${itemMetrics.left.toFixed(1)}px 右=${itemMetrics.right.toFixed(1)}px`);
        console.log(`  卡片宽度: ${itemMetrics.width.toFixed(1)}px`);

        // 检查左右是否对称
        const isSymmetric = Math.abs(itemMetrics.left - itemMetrics.right) < 2;
        console.log(`  ${isSymmetric ? '✅' : '❌'} 左右边距${isSymmetric ? '对称' : '不对称'}`);
    }

    // 截图
    await page.screenshot({ path: 'vocabulary-margins.png' });
    console.log('\n📸 已保存边距测试截图: vocabulary-margins.png');

    console.log('\n=== 测试完成 ===\n');

    await page.waitForTimeout(2000);
    await browser.close();
}

testMargins().catch(console.error);