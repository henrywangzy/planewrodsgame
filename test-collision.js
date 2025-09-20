const { chromium } = require('playwright');
const path = require('path');

async function testCollision() {
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
        if (text.includes('💥') || text.includes('击中敌机')) {
            console.log(`💥 ${text}`);
        }
    });

    const filePath = path.resolve(__dirname, 'index.html');
    await page.goto(`file:///${filePath}`);

    console.log('\n=== 测试碰撞检测 ===\n');

    // 开始游戏
    await page.click('#startGameBtn');
    await page.waitForTimeout(2000);

    // 注入测试代码
    await page.evaluate(() => {
        window.collisionTestMode = true;
        let hitCount = 0;

        // 覆盖原有的碰撞检测函数，添加日志
        const originalIsColliding = window.game.isColliding;
        if (window.game) {
            // 监听碰撞
            const originalCheckCollisions = window.game.checkCollisions;
            window.game.checkCollisions = function() {
                const result = originalCheckCollisions.apply(this, arguments);

                // 统计击中
                const enemies = window.game.enemies || [];
                const bullets = window.game.bullets || [];

                if (enemies.length > 0 && bullets.length > 0) {
                    console.log(`当前: ${enemies.length}个敌机, ${bullets.length}颗子弹`);
                }

                return result;
            };
        }

        console.log('✅ 碰撞检测测试模式已启用');
    });

    console.log('开始模拟射击测试...\n');

    // 模拟移动和射击
    for (let i = 0; i < 5; i++) {
        // 移动到屏幕中间
        await page.evaluate(() => {
            if (window.game && window.game.player) {
                window.game.player.x = window.game.canvasWidth / 2;
            }
        });

        // 发射子弹
        await page.keyboard.press('Space');
        await page.waitForTimeout(100);

        // 向左移动
        await page.keyboard.down('ArrowLeft');
        await page.waitForTimeout(200);
        await page.keyboard.up('ArrowLeft');

        // 再次射击
        await page.keyboard.press('Space');
        await page.waitForTimeout(100);

        // 向右移动
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(200);
        await page.keyboard.up('ArrowRight');

        // 射击
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);
    }

    // 获取统计信息
    const stats = await page.evaluate(() => {
        if (window.game) {
            return {
                score: window.game.score || 0,
                enemiesHit: window.game.enemiesHitCount || 0,
                correctWords: window.game.correctWordsCount || 0
            };
        }
        return null;
    });

    if (stats) {
        console.log('\n统计信息:');
        console.log(`  得分: ${stats.score}`);
        console.log(`  击中敌机数: ${stats.enemiesHit}`);
        console.log(`  正确单词数: ${stats.correctWords}`);
    }

    // 截图
    await page.screenshot({ path: 'collision-test.png' });
    console.log('\n📸 已保存测试截图: collision-test.png');

    console.log('\n=== 测试完成 ===\n');

    await page.waitForTimeout(3000);
    await browser.close();
}

testCollision().catch(console.error);