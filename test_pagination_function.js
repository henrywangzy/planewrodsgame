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

    try {
        // 加载游戏页面
        const filePath = 'file://' + path.resolve('index.html').replace(/\\/g, '/');
        console.log('📱 测试翻页功能');
        console.log('设备: iPhone 12 (390x844)');
        console.log('----------------------------\n');

        await page.goto(filePath);
        await page.waitForTimeout(2000);

        // 进入单词本
        console.log('🔍 进入单词本页面');
        await page.locator('#vocabularyBtn').click();
        await page.waitForTimeout(1000);

        // 检查当前页码
        const initialPageInfo = await page.locator('#pageInfo').textContent();
        console.log('初始页码:', initialPageInfo);

        // 测试下一页按钮
        console.log('\n🔍 测试下一页按钮');
        const nextBtn = page.locator('#nextPage');

        // 检查按钮是否可点击
        const nextBtnEnabled = await nextBtn.isEnabled();
        console.log('下一页按钮可点击:', nextBtnEnabled);

        if (nextBtnEnabled) {
            // 点击下一页
            await nextBtn.click();
            await page.waitForTimeout(1000);

            const newPageInfo = await page.locator('#pageInfo').textContent();
            console.log('点击后页码:', newPageInfo);

            // 测试上一页按钮
            console.log('\n🔍 测试上一页按钮');
            const prevBtn = page.locator('#prevPage');
            const prevBtnEnabled = await prevBtn.isEnabled();
            console.log('上一页按钮可点击:', prevBtnEnabled);

            if (prevBtnEnabled) {
                await prevBtn.click();
                await page.waitForTimeout(1000);

                const backPageInfo = await page.locator('#pageInfo').textContent();
                console.log('返回后页码:', backPageInfo);
            }
        }

        // 详细检查按钮样式
        console.log('\n🔍 详细检查按钮样式');
        const nextBtnRect = await nextBtn.boundingBox();
        console.log('下一页按钮位置:', nextBtnRect);

        const nextBtnStyles = await nextBtn.evaluate(el => {
            const styles = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return {
                backgroundColor: styles.backgroundColor,
                color: styles.color,
                border: styles.border,
                borderColor: styles.borderColor,
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight,
                visibility: styles.visibility,
                display: styles.display,
                position: styles.position,
                zIndex: styles.zIndex,
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                right: rect.right,
                isVisible: rect.width > 0 && rect.height > 0
            };
        });
        console.log('下一页按钮详细样式:', nextBtnStyles);

        // 测试按钮可见性
        const nextBtnVisible = await nextBtn.isVisible();
        console.log('下一页按钮是否可见:', nextBtnVisible);

        // 截图
        await page.screenshot({
            path: 'pagination_function_test.png',
            fullPage: false
        });
        console.log('\n📸 截图已保存: pagination_function_test.png');

        console.log('\n=============================');
        console.log('✅ 翻页功能测试完成！');
        console.log('=============================');

    } catch (error) {
        console.error('测试失败:', error);
    }

    await page.waitForTimeout(3000);
    await browser.close();
})();