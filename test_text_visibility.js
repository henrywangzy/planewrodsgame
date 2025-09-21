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
        console.log('📱 测试主页面文字可见性');
        console.log('设备: iPhone 12 (390x844)');
        console.log('----------------------------\n');

        await page.goto(filePath);
        await page.waitForTimeout(2000);

        // 测试标题文字样式
        console.log('🔍 测试主标题文字样式');
        const titleStyles = await page.locator('.game-title').evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
                color: styles.color,
                textShadow: styles.textShadow,
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight
            };
        });
        console.log('游戏标题样式:', titleStyles);

        // 测试副标题文字样式
        console.log('\n🔍 测试副标题文字样式');
        const subtitleStyles = await page.locator('.fun-facts').evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
                color: styles.color,
                textShadow: styles.textShadow,
                fontSize: styles.fontSize
            };
        });
        console.log('副标题样式:', subtitleStyles);

        // 测试设置标签文字样式
        console.log('\n🔍 测试设置标签文字样式');
        const labelStyles = await page.locator('.setting-group label').first().evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
                color: styles.color,
                textShadow: styles.textShadow,
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight
            };
        });
        console.log('设置标签样式:', labelStyles);

        // 获取实际文字内容
        console.log('\n🔍 检查文字内容');
        const titleText = await page.locator('.game-title').textContent();
        const subtitleText = await page.locator('.fun-facts').textContent();
        const label1Text = await page.locator('.setting-group label').first().textContent();
        const label2Text = await page.locator('.setting-group label').nth(1).textContent();

        console.log('游戏标题:', titleText);
        console.log('副标题:', subtitleText);
        console.log('第一个标签:', label1Text);
        console.log('第二个标签:', label2Text);

        // 截图保存
        await page.screenshot({
            path: 'text_visibility_test.png',
            fullPage: false
        });
        console.log('\n📸 截图已保存: text_visibility_test.png');

        console.log('\n=============================');
        console.log('✅ 文字可见性测试完成！');
        console.log('=============================');

    } catch (error) {
        console.error('测试失败:', error);
    }

    await page.waitForTimeout(3000);
    await browser.close();
})();