const { chromium } = require('playwright');
const path = require('path');

async function testFinalFixes() {
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

    console.log('\n=== 测试最终修复 ===\n');

    // 1. 测试单词本宽度
    console.log('1️⃣ 测试单词本宽度...');
    await page.click('#vocabularyBtn');
    await page.waitForTimeout(1000);

    const wordItem = await page.locator('.word-item').first();
    if (await wordItem.count() > 0) {
        const itemMetrics = await wordItem.evaluate(el => {
            const rect = el.getBoundingClientRect();
            const parent = el.parentElement.parentElement.getBoundingClientRect();
            return {
                width: rect.width,
                parentWidth: parent.width,
                widthRatio: (rect.width / parent.width * 100).toFixed(1)
            };
        });
        console.log(`  单词块宽度: ${itemMetrics.width.toFixed(1)}px`);
        console.log(`  容器宽度: ${itemMetrics.parentWidth.toFixed(1)}px`);
        console.log(`  宽度占比: ${itemMetrics.widthRatio}%`);
        console.log(`  ${itemMetrics.widthRatio > 95 ? '✅' : '❌'} 宽度${itemMetrics.widthRatio > 95 ? '已' : '未'}最大化`);
    }

    // 2. 测试翻页按钮
    console.log('\n2️⃣ 测试翻页按钮...');
    const pagination = await page.locator('.pagination');
    if (await pagination.isVisible()) {
        const paginationStyle = await pagination.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return {
                bottom: rect.bottom,
                height: rect.height,
                visible: rect.height > 0
            };
        });
        console.log(`  翻页栏高度: ${paginationStyle.height}px`);
        console.log(`  底部位置: ${paginationStyle.bottom}px`);
        console.log(`  ${paginationStyle.visible ? '✅' : '❌'} 翻页按钮${paginationStyle.visible ? '正常' : '异常'}显示`);
    }

    // 截图单词本
    await page.screenshot({ path: 'vocabulary-final-test.png' });
    console.log('  📸 已保存单词本截图');

    // 3. 测试弹窗层级
    console.log('\n3️⃣ 测试弹窗层级...');

    // 回到主菜单开始游戏
    await page.click('.back-btn-compact');
    await page.waitForTimeout(500);
    await page.click('#startGameBtn');
    await page.waitForTimeout(3000);

    // 检查是否有游戏弹窗
    const gameDialog = await page.locator('.unified-word-dialog').count();
    console.log(`  游戏中弹窗数: ${gameDialog}`);

    // 切换到单词本
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.click('#vocabularyBtn');
    await page.waitForTimeout(500);

    // 检查弹窗是否已清除
    const dialogAfterSwitch = await page.locator('.unified-word-dialog').count();
    console.log(`  切换后弹窗数: ${dialogAfterSwitch}`);
    console.log(`  ${dialogAfterSwitch === 0 ? '✅' : '❌'} 弹窗${dialogAfterSwitch === 0 ? '已' : '未'}清除`);

    console.log('\n=== 测试完成 ===\n');

    await page.waitForTimeout(3000);
    await browser.close();
}

testFinalFixes().catch(console.error);