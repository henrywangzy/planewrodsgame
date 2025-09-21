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
        console.log('📱 测试手机端单词本布局');
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
            return;
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
                // 测试3: 检查头部布局
                console.log('\n🔍 测试3: 检查头部布局');

                const header = await page.locator('.vocab-header').isVisible();
                console.log('头部导航栏可见:', header);

                const backBtn = await page.locator('.back-btn').isVisible();
                console.log('返回按钮可见:', backBtn);

                const gradeSelect = await page.locator('#vocabGradeSelect').isVisible();
                console.log('年级选择器可见:', gradeSelect);

                const searchInput = await page.locator('#vocabSearch').isVisible();
                console.log('搜索框可见:', searchInput);

                // 测试4: 检查单词列表
                console.log('\n🔍 测试4: 检查单词列表');

                await page.waitForTimeout(1000); // 等待单词加载

                const wordItems = await page.locator('.word-item').count();
                console.log('单词项数量:', wordItems);

                const wordListContainer = await page.locator('#wordList').isVisible();
                console.log('单词列表容器可见:', wordListContainer);

                // 测试5: 检查分页按钮布局
                console.log('\n🔍 测试5: 检查分页按钮');

                const pagination = await page.locator('.pagination').isVisible();
                console.log('分页容器可见:', pagination);

                if (pagination) {
                    // 检查分页按钮位置
                    const paginationRect = await page.locator('.pagination').boundingBox();
                    const viewportHeight = 844; // iPhone 12 height

                    console.log('分页按钮位置:');
                    console.log('  top:', paginationRect.y);
                    console.log('  bottom:', paginationRect.y + paginationRect.height);
                    console.log('  width:', paginationRect.width);
                    console.log('  在屏幕内:', (paginationRect.y + paginationRect.height) <= viewportHeight);

                    // 检查分页按钮
                    const prevBtn = await page.locator('#prevPage').isVisible();
                    const nextBtn = await page.locator('#nextPage').isVisible();
                    const pageInfo = await page.locator('#pageInfo').isVisible();

                    console.log('上一页按钮可见:', prevBtn);
                    console.log('下一页按钮可见:', nextBtn);
                    console.log('页码信息可见:', pageInfo);

                    // 检查按钮样式
                    const prevBtnStyles = await page.locator('#prevPage').evaluate(el => {
                        const styles = window.getComputedStyle(el);
                        return {
                            backgroundColor: styles.backgroundColor,
                            color: styles.color,
                            border: styles.border,
                            opacity: styles.opacity
                        };
                    });
                    console.log('上一页按钮样式:', prevBtnStyles);
                }

                // 测试6: 检查整体边距
                console.log('\n🔍 测试6: 检查页面边距');

                const vocabularyScreenStyles = await page.locator('#vocabularyScreen').evaluate(el => {
                    const styles = window.getComputedStyle(el);
                    return {
                        padding: styles.padding,
                        margin: styles.margin,
                        width: styles.width
                    };
                });
                console.log('单词本页面样式:', vocabularyScreenStyles);

                const wordListStyles = await page.locator('#wordList').evaluate(el => {
                    const styles = window.getComputedStyle(el);
                    return {
                        padding: styles.padding,
                        margin: styles.margin
                    };
                });
                console.log('单词列表样式:', wordListStyles);

                // 截图保存
                await page.screenshot({
                    path: 'vocabulary_layout_test.png',
                    fullPage: false
                });
                console.log('\n📸 截图已保存: vocabulary_layout_test.png');
            }
        } else {
            console.error('❌ 单词本按钮不可见');
        }

        console.log('\n=============================');
        console.log('✅ 单词本布局测试完成！');
        console.log('=============================');

    } catch (error) {
        console.error('测试失败:', error);
    }

    await page.waitForTimeout(3000);
    await browser.close();
})();