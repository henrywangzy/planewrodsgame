const { chromium } = require('playwright');
const path = require('path');

async function testCollisionSimple() {
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

    // 监听控制台消息
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('💥 击中敌机')) {
            console.log(`✅ ${text}`);
        }
    });

    const filePath = path.resolve(__dirname, 'index.html');
    await page.goto(`file:///${filePath}`);

    console.log('\n=== 测试碰撞检测改进 ===\n');

    // 开始游戏
    await page.click('#startGameBtn');
    await page.waitForTimeout(2000);

    console.log('开始射击测试...\n');

    // 连续射击测试
    for (let i = 0; i < 10; i++) {
        // 射击
        await page.keyboard.press('Space');
        await page.waitForTimeout(100);

        // 左右移动并射击
        if (i % 2 === 0) {
            await page.keyboard.press('ArrowLeft');
            await page.waitForTimeout(50);
        } else {
            await page.keyboard.press('ArrowRight');
            await page.waitForTimeout(50);
        }

        await page.keyboard.press('Space');
        await page.waitForTimeout(200);
    }

    await page.waitForTimeout(2000);

    // 获取游戏统计
    const stats = await page.evaluate(() => {
        const scoreEl = document.querySelector('#scoreDisplay');
        const score = scoreEl ? scoreEl.textContent : '0';
        return { score };
    });

    console.log(`\n当前得分: ${stats.score}`);
    console.log('如果得分大于0，说明碰撞检测正常工作');

    // 截图
    await page.screenshot({ path: 'collision-result.png' });
    console.log('📸 已保存截图: collision-result.png');

    console.log('\n=== 测试完成 ===\n');
    console.log('请手动测试：');
    console.log('1. 子弹是否能击中敌机的整个身体（不只是尖端）');
    console.log('2. 一颗子弹是否能消灭一个敌机');

    await page.waitForTimeout(5000);
    await browser.close();
}

testCollisionSimple().catch(console.error);