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

    // 监控控制台错误
    page.on('console', msg => {
        if (msg.type() === 'error' && !msg.text().includes('play()')) {
            console.error('页面错误:', msg.text());
        }
    });

    try {
        // 加载游戏页面
        const filePath = 'file://' + path.resolve('index.html').replace(/\\/g, '/');
        console.log('📱 测试手机端主页面显示');
        console.log('设备: iPhone 12 (390x844)');
        console.log('----------------------------\n');

        await page.goto(filePath);
        await page.waitForTimeout(2000);

        // 测试1: 检查主页是否正确显示
        console.log('🔍 测试1: 检查主页显示');
        const startScreenVisible = await page.locator('#startScreen').isVisible();
        const startScreenActive = await page.locator('#startScreen').evaluate(el => el.classList.contains('active'));

        console.log('主页面可见:', startScreenVisible);
        console.log('主页面激活状态:', startScreenActive);

        // 检查主页面的display样式
        const startScreenDisplay = await page.locator('#startScreen').evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
                display: styles.display,
                visibility: styles.visibility,
                position: styles.position
            };
        });
        console.log('主页面样式:', startScreenDisplay);

        // 测试2: 检查主页面元素
        console.log('\n🔍 测试2: 检查主页面元素');

        const title = await page.locator('.game-title').isVisible();
        console.log('游戏标题可见:', title);

        const startBtn = await page.locator('#startGameBtn').isVisible();
        console.log('开始游戏按钮可见:', startBtn);

        const vocabularyBtn = await page.locator('#vocabularyBtn').isVisible();
        console.log('单词本按钮可见:', vocabularyBtn);

        const instructionsBtn = await page.locator('#instructionsBtn').isVisible();
        console.log('游戏说明按钮可见:', instructionsBtn);

        // 测试3: 检查选择器
        console.log('\n🔍 测试3: 检查游戏设置');

        const gradeSelect = await page.locator('#gradeSelect').isVisible();
        console.log('年级选择器可见:', gradeSelect);

        const difficultySelect = await page.locator('#difficultySelect').isVisible();
        console.log('难度选择器可见:', difficultySelect);

        // 测试4: 测试单词本切换
        console.log('\n🔍 测试4: 测试页面切换');

        if (vocabularyBtn) {
            await page.locator('#vocabularyBtn').click();
            await page.waitForTimeout(1000);

            const vocabVisible = await page.locator('#vocabularyScreen').isVisible();
            console.log('单词本页面切换成功:', vocabVisible);

            // 返回主页
            const backBtn = page.locator('.back-btn-compact');
            if (await backBtn.isVisible()) {
                await backBtn.click();
                await page.waitForTimeout(1000);

                const backToMain = await page.locator('#startScreen').isVisible();
                console.log('返回主页成功:', backToMain);
            }
        }

        // 截图保存
        await page.screenshot({
            path: 'mobile_main_page.png',
            fullPage: false
        });
        console.log('\n📸 截图已保存: mobile_main_page.png');

        console.log('\n=============================');
        if (startScreenVisible && startBtn && vocabularyBtn) {
            console.log('✅ 主页面显示正常！');
        } else {
            console.log('❌ 主页面存在显示问题！');
        }
        console.log('=============================');

    } catch (error) {
        console.error('测试失败:', error);
    }

    await page.waitForTimeout(3000);
    await browser.close();
})();