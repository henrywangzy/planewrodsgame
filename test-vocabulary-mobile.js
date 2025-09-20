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
        await page.waitForTimeout(3000);
        
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
        
        // 等待单词卡片加载 - 根据实际HTML结构调整选择器
        await page.waitForSelector('.word-item, .vocabulary-item, [class*="word"]', { timeout: 10000 });
        
        console.log('6. 截图保存单词本页面');
        await page.screenshot({ 
            path: 'screenshots/vocabulary-book-mobile.png', 
            fullPage: true 
        });
        
        // 获取页面信息用于分析
        const pageInfo = await page.evaluate(() => {
            // 尝试多种可能的选择器来找到单词卡片
            let cards = document.querySelectorAll('.word-item');
            if (cards.length === 0) cards = document.querySelectorAll('.vocabulary-item');
            if (cards.length === 0) cards = document.querySelectorAll('[class*="word"]');
            if (cards.length === 0) cards = document.querySelectorAll('div[style*="background"]'); // 根据截图推测可能是带背景的div
            
            const container = document.querySelector('.vocabulary-container') || 
                            document.querySelector('.word-grid') || 
                            document.querySelector('.vocabulary-book') ||
                            document.querySelector('main') ||
                            document.body;
            
            return {
                cardCount: cards.length,
                containerWidth: container ? container.offsetWidth : 0,
                cardWidths: Array.from(cards).map(card => ({
                    width: card.offsetWidth,
                    height: card.offsetHeight,
                    marginLeft: getComputedStyle(card).marginLeft,
                    marginRight: getComputedStyle(card).marginRight,
                    marginTop: getComputedStyle(card).marginTop,
                    marginBottom: getComputedStyle(card).marginBottom,
                    padding: getComputedStyle(card).padding,
                    className: card.className,
                    tagName: card.tagName
                })).slice(0, 5), // 只取前5个卡片的信息
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight,
                allElements: Array.from(document.querySelectorAll('*')).filter(el => 
                    el.textContent && el.textContent.includes('Cat')).map(el => ({
                    tagName: el.tagName,
                    className: el.className,
                    textContent: el.textContent.substring(0, 50)
                }))
            };
        });
        
        console.log('单词本页面信息：');
        console.log(`- 单词卡片数量: ${pageInfo.cardCount}`);
        console.log(`- 容器宽度: ${pageInfo.containerWidth}px`);
        console.log(`- 视口尺寸: ${pageInfo.viewportWidth}x${pageInfo.viewportHeight}`);
        console.log('- 前5个卡片信息:', pageInfo.cardWidths);
        
        console.log('单词本页面截图已保存：screenshots/vocabulary-book-mobile.png');
        
        // 测试滚动效果
        console.log('7. 测试页面滚动');
        await page.evaluate(() => window.scrollTo(0, 200));
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: 'screenshots/vocabulary-book-scrolled-mobile.png', 
            fullPage: true 
        });
        console.log('滚动后截图已保存：screenshots/vocabulary-book-scrolled-mobile.png');
        
        // 尝试点击一个单词卡片或语音按钮
        console.log('8. 测试单词卡片交互');
        
        // 尝试点击语音播放按钮（绿色圆形按钮）
        const soundButton = await page.locator('button[style*="background"], .sound-btn, [class*="sound"]').first();
        if (await soundButton.count() > 0) {
            await soundButton.click();
            await page.waitForTimeout(2000);
            
            await page.screenshot({ 
                path: 'screenshots/vocabulary-sound-clicked-mobile.png', 
                fullPage: true 
            });
            console.log('点击语音按钮后截图已保存：screenshots/vocabulary-sound-clicked-mobile.png');
        }
        
        // 尝试点击单词卡片本身
        const cardArea = await page.locator('div').filter({ hasText: 'Cat' }).first();
        if (await cardArea.count() > 0) {
            await cardArea.click();
            await page.waitForTimeout(2000);
            
            await page.screenshot({ 
                path: 'screenshots/vocabulary-card-clicked-mobile.png', 
                fullPage: true 
            });
            console.log('点击单词卡片后截图已保存：screenshots/vocabulary-card-clicked-mobile.png');
        }
        
        console.log('测试完成！');
        
    } catch (error) {
        console.error('测试过程中出现错误：', error);
        
        // 出错时也截图保存当前状态
        try {
            await page.screenshot({ path: 'screenshots/error-state-mobile.png', fullPage: true });
            console.log('错误状态截图已保存：screenshots/error-state-mobile.png');
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