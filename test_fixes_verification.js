const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 200
    });

    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        isMobile: true,
        hasTouch: true
    });

    const page = await context.newPage();

    // 监控错误
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    try {
        const filePath = 'file://' + path.resolve('index.html').replace(/\\/g, '/');
        console.log('📱 验证所有修复效果');
        console.log('设备: iPhone 12 (390x844)');
        console.log('=============================\n');

        await page.goto(filePath);
        await page.waitForTimeout(2000);

        // 测试1: 验证主页面显示正常
        console.log('✅ 测试1: 主页面显示');
        const startScreenVisible = await page.locator('#startScreen').isVisible();
        console.log('主页面正常显示:', startScreenVisible ? '✅' : '❌');

        // 测试2: 进入单词本验证布局
        console.log('\n✅ 测试2: 单词本布局');
        await page.locator('#vocabularyBtn').click();
        await page.waitForTimeout(1500);

        const vocabScreenVisible = await page.locator('#vocabularyScreen').isVisible();
        console.log('单词本页面显示:', vocabScreenVisible ? '✅' : '❌');

        // 测试3: 验证翻页按钮位置
        console.log('\n✅ 测试3: 翻页按钮位置');
        const paginationRect = await page.locator('.pagination').boundingBox();
        const inScreenBounds = paginationRect.y + paginationRect.height <= 844;
        console.log('翻页按钮在屏幕内:', inScreenBounds ? '✅' : '❌');
        console.log('  按钮容器位置: top=' + Math.round(paginationRect.y) + 'px, bottom=' + Math.round(paginationRect.y + paginationRect.height) + 'px');

        // 测试4: 验证按钮功能
        console.log('\n✅ 测试4: 翻页功能');
        const nextBtn = page.locator('#nextPage');
        const nextBtnVisible = await nextBtn.isVisible();
        const nextBtnEnabled = await nextBtn.isEnabled();
        console.log('下一页按钮可见可用:', (nextBtnVisible && nextBtnEnabled) ? '✅' : '❌');

        if (nextBtnVisible && nextBtnEnabled) {
            await nextBtn.click();
            await page.waitForTimeout(1000);
            const pageInfo = await page.locator('#pageInfo').textContent();
            console.log('翻页功能正常:', pageInfo.includes('2') ? '✅' : '❌');
            console.log('  当前页码:', pageInfo);
        }

        // 测试5: 验证JavaScript错误修复
        console.log('\n✅ 测试5: JavaScript错误检查');
        const hasJSErrors = consoleErrors.some(error =>
            error.includes('Cannot set properties of null') &&
            !error.includes('play() failed') &&
            !error.includes('user didn\'t interact')
        );
        console.log('JavaScript错误已修复:', hasJSErrors ? '❌' : '✅');

        // 测试6: 验证音频播放错误处理
        console.log('\n✅ 测试6: 音频错误处理');
        const hasAudioErrors = consoleErrors.some(error =>
            error.includes('play() failed') &&
            !error.includes('catch')
        );
        console.log('音频错误已处理:', hasAudioErrors ? '❌' : '✅');

        // 测试7: 验证橙色背景样式
        console.log('\n✅ 测试7: 翻页按钮样式');
        const paginationStyles = await page.locator('.pagination').evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
                background: styles.background,
                borderRadius: styles.borderRadius
            };
        });
        const hasOrangeBackground = paginationStyles.background.includes('rgb(255, 107, 53)');
        const hasRoundedCorners = paginationStyles.borderRadius === '20px';
        console.log('橙色渐变背景:', hasOrangeBackground ? '✅' : '❌');
        console.log('圆角样式:', hasRoundedCorners ? '✅' : '❌');

        // 截图保存
        await page.screenshot({
            path: 'fixes_verification_test.png',
            fullPage: false
        });
        console.log('\n📸 截图已保存: fixes_verification_test.png');

        // 汇总结果
        console.log('\n=============================');
        console.log('🔍 修复验证结果汇总');
        console.log('=============================');
        const allFixed = startScreenVisible && vocabScreenVisible && inScreenBounds &&
                          !hasJSErrors && !hasAudioErrors && hasOrangeBackground;

        if (allFixed) {
            console.log('🎉 所有问题都已修复成功！');
        } else {
            console.log('⚠️  仍有问题需要解决');
        }

        console.log('\n控制台错误列表:');
        if (consoleErrors.length === 0) {
            console.log('  无严重错误 ✅');
        } else {
            consoleErrors.forEach((error, index) => {
                if (!error.includes('play() failed') && !error.includes('user didn\'t interact')) {
                    console.log(`  ${index + 1}. ${error}`);
                }
            });
        }

    } catch (error) {
        console.error('测试失败:', error);
    }

    await page.waitForTimeout(3000);
    await browser.close();
})();