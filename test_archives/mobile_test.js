const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    // 模拟iPhone 12设备
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
        isMobile: true,
        hasTouch: true
    });

    const page = await context.newPage();

    // 监控控制台错误
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error('页面错误:', msg.text());
        }
    });
    page.on('pageerror', error => console.error('JavaScript错误:', error.message));

    try {
        // 加载游戏页面
        const filePath = 'file://' + path.resolve('index.html').replace(/\\/g, '/');
        console.log('📱 模拟手机端访问游戏:', filePath);
        console.log('设备: iPhone 12 (390x844)');
        console.log('----------------------------');

        await page.goto(filePath);
        await page.waitForTimeout(3000);

        // 测试1: 检查当前显示的页面
        console.log('\n🔍 测试1: 检查当前显示的页面');

        // 检查主页是否可见
        const startScreenVisible = await page.locator('#startScreen').isVisible();
        const vocabularyScreenVisible = await page.locator('#vocabularyScreen').isVisible();

        console.log('主页面可见:', startScreenVisible);
        console.log('单词本页面可见:', vocabularyScreenVisible);

        if (!startScreenVisible) {
            console.error('❌ 错误：主页面没有显示！');

            // 尝试找出哪个页面在显示
            const allScreens = await page.locator('.screen').all();
            for (let screen of allScreens) {
                const id = await screen.getAttribute('id');
                const isActive = await screen.evaluate(el => el.classList.contains('active'));
                const isVisible = await screen.isVisible();
                console.log(`页面 ${id}: active=${isActive}, visible=${isVisible}`);
            }
        } else {
            console.log('✅ 主页面正常显示');
        }

        // 测试2: 检查页面元素
        console.log('\n🔍 测试2: 检查主页面元素');

        if (startScreenVisible) {
            const title = await page.locator('.game-title').textContent();
            console.log('游戏标题:', title);

            const startBtn = await page.locator('#startGameBtn').isVisible();
            console.log('开始按钮可见:', startBtn);

            const musicBtn = await page.locator('#musicToggleBtn').isVisible();
            console.log('音乐按钮可见:', musicBtn);
        }

        // 测试3: 检查CSS样式
        console.log('\n🔍 测试3: 检查CSS样式');

        const startScreenStyle = await page.locator('#startScreen').evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
                display: styles.display,
                visibility: styles.visibility,
                zIndex: styles.zIndex,
                position: styles.position
            };
        });
        console.log('主页面样式:', startScreenStyle);

        const vocabularyScreenStyle = await page.locator('#vocabularyScreen').evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
                display: styles.display,
                visibility: styles.visibility,
                zIndex: styles.zIndex,
                position: styles.position
            };
        });
        console.log('单词本页面样式:', vocabularyScreenStyle);

        // 截图保存
        await page.screenshot({
            path: 'mobile_test_screenshot.png',
            fullPage: true
        });
        console.log('\n📸 截图已保存: mobile_test_screenshot.png');

        console.log('\n===================');
        console.log('测试完成');
        console.log('===================');

    } catch (error) {
        console.error('测试失败:', error);
    }

    await page.waitForTimeout(5000);
    await browser.close();
})();