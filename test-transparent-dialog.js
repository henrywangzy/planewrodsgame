const { chromium } = require('playwright');
const path = require('path');

async function testTransparentDialog() {
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

    console.log('\n=== 测试透明单词弹窗 ===\n');

    // 开始游戏
    await page.click('#startGameBtn');
    await page.waitForTimeout(2000);

    // 等待弹窗出现
    await page.waitForTimeout(2000);

    // 查找统一弹窗
    const unifiedDialog = await page.locator('.unified-word-dialog').first();

    if (await unifiedDialog.count() > 0) {
        const dialogStyle = await unifiedDialog.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                background: computed.background,
                backgroundColor: computed.backgroundColor,
                opacity: computed.opacity
            };
        });

        console.log('弹窗样式检查:');
        console.log(`  背景: ${dialogStyle.background}`);
        console.log(`  背景色: ${dialogStyle.backgroundColor}`);
        console.log(`  透明度: ${dialogStyle.opacity}`);

        const isTransparent = dialogStyle.background.includes('transparent') ||
                             dialogStyle.backgroundColor === 'rgba(0, 0, 0, 0)' ||
                             dialogStyle.backgroundColor === 'transparent';

        console.log(`  ${isTransparent ? '✅' : '❌'} 背景${isTransparent ? '透明' : '不透明'}`);

        // 截图游戏画面
        await page.screenshot({ path: 'game-transparent-dialog.png' });
        console.log('\n📸 已保存透明弹窗截图: game-transparent-dialog.png');
    } else {
        console.log('❌ 未找到弹窗');
    }

    console.log('\n=== 测试完成 ===\n');

    await page.waitForTimeout(3000);
    await browser.close();
}

testTransparentDialog().catch(console.error);