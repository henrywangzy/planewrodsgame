const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 300
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
        if (msg.type() === 'error') {
            console.error('页面错误:', msg.text());
        }
    });
    page.on('pageerror', error => console.error('JavaScript错误:', error.message));

    try {
        // 加载游戏页面
        const filePath = 'file://' + path.resolve('index.html').replace(/\\/g, '/');
        console.log('📱 测试手机端单词本显示');
        console.log('设备: iPhone 12 (390x844)');
        console.log('----------------------------\n');

        await page.goto(filePath);
        await page.waitForTimeout(2000);

        // 测试1: 检查主页是否正确显示
        console.log('🔍 测试1: 检查主页显示');
        const startScreenVisible = await page.locator('#startScreen').isVisible();
        console.log('主页面可见:', startScreenVisible);

        if (!startScreenVisible) {
            console.error('❌ 错误：主页面未显示');
            // 查看当前活动页面
            const screens = await page.locator('.screen').all();
            for (let screen of screens) {
                const id = await screen.getAttribute('id');
                const isActive = await screen.evaluate(el => el.classList.contains('active'));
                if (isActive) {
                    console.log(`当前活动页面: ${id}`);
                }
            }
        }

        // 测试2: 点击进入单词本
        console.log('\n🔍 测试2: 进入单词本页面');
        const vocabularyBtn = page.locator('#vocabularyBtn');

        if (await vocabularyBtn.isVisible()) {
            await vocabularyBtn.click();
            await page.waitForTimeout(1000);

            const vocabScreenVisible = await page.locator('#vocabularyScreen').isVisible();
            console.log('单词本页面可见:', vocabScreenVisible);

            if (vocabScreenVisible) {
                // 测试3: 检查页面布局
                console.log('\n🔍 测试3: 检查页面布局');

                // 检查头部
                const header = await page.locator('.vocab-header-compact').isVisible();
                console.log('头部导航栏可见:', header);

                // 检查单词列表
                const wordCards = await page.locator('.word-card').count();
                console.log('单词卡片数量:', wordCards);

                // 检查分页按钮
                const pagination = await page.locator('.pagination').isVisible();
                console.log('分页控件可见:', pagination);

                // 测试4: 检查边距和布局
                console.log('\n🔍 测试4: 检查边距设置');

                // 检查vocabulary-content的padding
                const contentPadding = await page.locator('.vocabulary-content').evaluate(el => {
                    const styles = window.getComputedStyle(el);
                    return {
                        paddingLeft: styles.paddingLeft,
                        paddingRight: styles.paddingRight,
                        paddingTop: styles.paddingTop,
                        paddingBottom: styles.paddingBottom
                    };
                });
                console.log('内容区域padding:', contentPadding);

                // 检查word-list的padding
                const listPadding = await page.locator('.word-list').evaluate(el => {
                    const styles = window.getComputedStyle(el);
                    return {
                        paddingLeft: styles.paddingLeft,
                        paddingRight: styles.paddingRight
                    };
                });
                console.log('单词列表左右padding:', listPadding);

                // 检查分页按钮位置
                const paginationPosition = await page.locator('.pagination').evaluate(el => {
                    const styles = window.getComputedStyle(el);
                    const rect = el.getBoundingClientRect();
                    return {
                        position: styles.position,
                        bottom: styles.bottom,
                        left: styles.left,
                        right: styles.right,
                        zIndex: styles.zIndex,
                        rectBottom: rect.bottom,
                        viewportHeight: window.innerHeight
                    };
                });
                console.log('分页按钮定位:', paginationPosition);

                // 测试5: 测试分页功能
                console.log('\n🔍 测试5: 测试分页功能');
                const nextBtn = page.locator('#nextPage');
                if (await nextBtn.isVisible()) {
                    console.log('下一页按钮可见: true');

                    // 检查按钮是否被遮挡
                    const btnClickable = await nextBtn.evaluate(el => {
                        const rect = el.getBoundingClientRect();
                        const elementAtPoint = document.elementFromPoint(
                            rect.left + rect.width / 2,
                            rect.top + rect.height / 2
                        );
                        return el === elementAtPoint || el.contains(elementAtPoint);
                    });
                    console.log('按钮可点击（未被遮挡）:', btnClickable);

                    if (btnClickable) {
                        await nextBtn.click();
                        await page.waitForTimeout(500);

                        const pageInfo = await page.locator('#pageInfo').textContent();
                        console.log('当前页码:', pageInfo);
                    }
                }

                // 截图保存
                await page.screenshot({
                    path: 'mobile_vocabulary_test.png',
                    fullPage: false
                });
                console.log('\n📸 截图已保存: mobile_vocabulary_test.png');
            }
        } else {
            console.error('❌ 单词本按钮不可见');
        }

        console.log('\n=============================');
        console.log('✅ 单词本手机端测试完成！');
        console.log('=============================');

    } catch (error) {
        console.error('测试失败:', error);
    }

    await page.waitForTimeout(3000);
    await browser.close();
})();