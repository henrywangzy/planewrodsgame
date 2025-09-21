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
        console.log('📱 测试翻页按钮精确位置');
        console.log('设备: iPhone 12 (390x844)');
        console.log('----------------------------\n');

        await page.goto(filePath);
        await page.waitForTimeout(2000);

        // 进入单词本
        console.log('🔍 进入单词本页面');
        await page.locator('#vocabularyBtn').click();
        await page.waitForTimeout(1500);

        // 检查分页容器位置和样式
        console.log('\n🔍 检查分页容器位置和样式');
        const paginationStyles = await page.locator('.pagination').evaluate(el => {
            const styles = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return {
                position: styles.position,
                bottom: styles.bottom,
                left: styles.left,
                right: styles.right,
                width: styles.width,
                background: styles.background,
                borderRadius: styles.borderRadius,
                rectTop: rect.top,
                rectBottom: rect.bottom,
                rectLeft: rect.left,
                rectRight: rect.right,
                rectWidth: rect.width,
                rectHeight: rect.height
            };
        });
        console.log('分页容器样式和位置:', paginationStyles);

        // 检查按钮是否在容器内
        const prevBtnRect = await page.locator('#prevPage').boundingBox();
        const nextBtnRect = await page.locator('#nextPage').boundingBox();
        const pageInfoRect = await page.locator('#pageInfo').boundingBox();

        console.log('\n🔍 检查各元素位置');
        console.log('上一页按钮:', prevBtnRect);
        console.log('下一页按钮:', nextBtnRect);
        console.log('页码信息:', pageInfoRect);

        // 验证是否在屏幕底部的合理位置
        const viewportHeight = 844;
        const isInGoodPosition =
            paginationStyles.rectBottom <= viewportHeight &&
            paginationStyles.rectBottom >= viewportHeight - 100; // 距离底部不超过100px

        console.log('\n🔍 位置验证');
        console.log('容器底部位置:', paginationStyles.rectBottom);
        console.log('屏幕高度:', viewportHeight);
        console.log('位置合理:', isInGoodPosition);

        // 检查背景颜色是否为橙色渐变
        const hasOrangeBackground = paginationStyles.background.includes('255, 107, 53') ||
                                  paginationStyles.background.includes('linear-gradient');
        console.log('橙色背景:', hasOrangeBackground);

        // 截图保存
        await page.screenshot({
            path: 'pagination_position_test.png',
            fullPage: false
        });
        console.log('\n📸 截图已保存: pagination_position_test.png');

        console.log('\n=============================');
        if (isInGoodPosition && hasOrangeBackground) {
            console.log('✅ 翻页按钮位置和样式完美！');
        } else {
            console.log('❌ 翻页按钮需要调整');
        }
        console.log('=============================');

    } catch (error) {
        console.error('测试失败:', error);
    }

    await page.waitForTimeout(3000);
    await browser.close();
})();