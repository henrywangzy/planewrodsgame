const { chromium } = require('playwright');

async function testVocabularyBookMobile() {
    console.log('启动浏览器测试...');
    
    // 启动浏览器
    const browser = await chromium.launch({ 
        headless: false,  // 显示浏览器窗口
        slowMo: 1000      // 每个操作间隔1秒便于观察
    });
    
    // 创建移动设备上下文 (iPhone 12 Pro)
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1'
    });
    
    const page = await context.newPage();
    
    try {
        console.log('1. 访问 http://localhost:8000');
        await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });
        
        // 等待页面完全加载
        console.log('2. 等待页面加载完成');
        await page.waitForTimeout(2000);
        
        // 截图保存首页
        await page.screenshot({ path: 'screenshots/homepage-mobile.png', fullPage: true });
        console.log('首页截图已保存：screenshots/homepage-mobile.png');
        
        // 查找并点击"单词本"按钮
        console.log('3. 寻找"单词本"按钮');
        
        // 等待按钮出现并点击
        const vocabularyButton = await page.locator('text=单词本').first();
        await vocabularyButton.waitFor({ timeout: 10000 });
        
        console.log('4. 点击"单词本"按钮');
        await vocabularyButton.click();
        
        // 等待单词本页面加载
        console.log('5. 等待单词本页面加载');
        await page.waitForTimeout(3000);
        
        console.log('6. 截图保存单词本页面');
        await page.screenshot({ 
            path: 'screenshots/vocabulary-book-mobile-final.png', 
            fullPage: true 
        });
        
        // 获取页面布局信息
        const layoutInfo = await page.evaluate(() => {
            // 获取所有可能是单词卡片的元素
            const allDivs = Array.from(document.querySelectorAll('div'));
            const wordCards = allDivs.filter(div => {
                const text = div.textContent || '';
                return text.includes('Cat') || text.includes('Dog') || text.includes('Bird') || 
                       text.includes('Fish') || text.includes('Duck');
            });
            
            // 获取页面主要容器信息
            const containers = ['body', 'main', '.vocabulary-book', '.word-container']
                .map(selector => {
                    const el = document.querySelector(selector) || document.body;
                    return {
                        selector,
                        width: el.offsetWidth,
                        height: el.offsetHeight,
                        padding: getComputedStyle(el).padding,
                        margin: getComputedStyle(el).margin
                    };
                });
            
            return {
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight,
                wordCardsCount: wordCards.length,
                wordCardsInfo: wordCards.map(card => ({
                    width: card.offsetWidth,
                    height: card.offsetHeight,
                    left: card.offsetLeft,
                    top: card.offsetTop,
                    marginLeft: getComputedStyle(card).marginLeft,
                    marginRight: getComputedStyle(card).marginRight,
                    marginTop: getComputedStyle(card).marginTop,
                    marginBottom: getComputedStyle(card).marginBottom,
                    padding: getComputedStyle(card).padding,
                    textContent: card.textContent.substring(0, 30),
                    className: card.className,
                    borderRadius: getComputedStyle(card).borderRadius,
                    backgroundColor: getComputedStyle(card).backgroundColor
                })).slice(0, 6),
                containers: containers
            };
        });
        
        console.log('\n=== 单词本页面布局分析 ===');
        console.log(`视口尺寸: ${layoutInfo.viewportWidth} x ${layoutInfo.viewportHeight}px`);
        console.log(`找到单词卡片数量: ${layoutInfo.wordCardsCount}`);
        
        console.log('\n--- 单词卡片详细信息 ---');
        layoutInfo.wordCardsInfo.forEach((card, index) => {
            console.log(`卡片 ${index + 1}:`);
            console.log(`  内容: "${card.textContent}"`);
            console.log(`  尺寸: ${card.width} x ${card.height}px`);
            console.log(`  位置: left=${card.left}px, top=${card.top}px`);
            console.log(`  外边距: ${card.marginTop} ${card.marginRight} ${card.marginBottom} ${card.marginLeft}`);
            console.log(`  内边距: ${card.padding}`);
            console.log(`  圆角: ${card.borderRadius}`);
            console.log(`  背景色: ${card.backgroundColor}`);
            console.log(`  CSS类: ${card.className}`);
            console.log('');
        });
        
        console.log('\n--- 容器信息 ---');
        layoutInfo.containers.forEach(container => {
            console.log(`${container.selector}: ${container.width} x ${container.height}px, padding: ${container.padding}`);
        });
        
        // 测试滚动
        console.log('7. 测试页面滚动');
        await page.evaluate(() => window.scrollTo(0, 200));
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: 'screenshots/vocabulary-book-scrolled-mobile.png', 
            fullPage: true 
        });
        console.log('滚动后截图已保存：screenshots/vocabulary-book-scrolled-mobile.png');
        
        // 测试点击语音按钮
        console.log('8. 测试语音按钮点击');
        try {
            // 查找绿色的语音播放按钮
            const soundButtons = await page.locator('button, div').filter({ 
                hasText: /🔊|♪/ 
            }).or(
                page.locator('[style*="background-color: rgb(76, 175, 80)"], [style*="background: rgb(76, 175, 80)"]')
            );
            
            if (await soundButtons.count() > 0) {
                await soundButtons.first().click();
                await page.waitForTimeout(2000);
                
                await page.screenshot({ 
                    path: 'screenshots/vocabulary-sound-test-mobile.png', 
                    fullPage: true 
                });
                console.log('语音按钮测试截图已保存：screenshots/vocabulary-sound-test-mobile.png');
            } else {
                console.log('未找到语音播放按钮');
            }
        } catch (error) {
            console.log('语音按钮测试失败:', error.message);
        }
        
        console.log('\n单词本页面截图已保存：screenshots/vocabulary-book-mobile-final.png');
        console.log('测试完成！');
        
    } catch (error) {
        console.error('测试过程中出现错误：', error);
        
        // 出错时也截图保存当前状态
        try {
            await page.screenshot({ path: 'screenshots/error-state-mobile-final.png', fullPage: true });
            console.log('错误状态截图已保存：screenshots/error-state-mobile-final.png');
        } catch (screenshotError) {
            console.error('截图失败：', screenshotError);
        }
    }
    
    // 等待5秒让用户查看结果
    await page.waitForTimeout(5000);
    
    await browser.close();
    console.log('浏览器已关闭');
}

// 运行测试
testVocabularyBookMobile().catch(console.error);