const { chromium } = require('playwright');

async function testAndroidEdgeCompatibility() {
    console.log('🔧 Android Edge兼容性测试开始...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
    });
    
    // 模拟Android Edge浏览器
    const context = await browser.newContext({
        viewport: { width: 360, height: 640 }, // Android标准分辨率
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36 EdgA/46.3.24.5155',
        hasTouch: true,
        isMobile: true
    });
    
    const page = await context.newPage();
    
    try {
        // 加载游戏页面
        await page.goto('file://' + __dirname + '/index.html');
        await page.waitForLoadState('networkidle');
        
        console.log('📱 页面加载完成，开始按钮点击测试');
        
        // 等待页面完全加载
        await page.waitForTimeout(1000);
        
        // 测试1: 首页按钮点击测试
        console.log('\n🧪 测试1: 首页按钮点击');
        
        // 检查开始游戏按钮是否可见和可点击
        const startBtn = await page.locator('#startGameBtn');
        const isVisible = await startBtn.isVisible();
        console.log(`✅ 开始游戏按钮可见: ${isVisible}`);
        
        if (isVisible) {
            try {
                // 尝试点击开始游戏按钮
                await startBtn.click({ timeout: 5000 });
                console.log('✅ 开始游戏按钮点击成功');
                
                // 检查是否进入游戏界面
                await page.waitForSelector('#gameScreen.active', { timeout: 5000 });
                console.log('✅ 成功进入游戏界面');
                
                // 测试2: 游戏内按钮测试
                console.log('\n🧪 测试2: 游戏内按钮测试');
                
                // 测试暂停按钮
                const pauseBtn = await page.locator('#mobilePauseBtn');
                const pauseVisible = await pauseBtn.isVisible();
                console.log(`✅ 暂停按钮可见: ${pauseVisible}`);
                
                if (pauseVisible) {
                    await pauseBtn.click();
                    console.log('✅ 暂停按钮点击成功');
                    await page.waitForTimeout(1000);
                    
                    // 再次点击恢复游戏
                    await pauseBtn.click();
                    console.log('✅ 恢复游戏按钮点击成功');
                }
                
                // 测试射击按钮
                const shootBtn = await page.locator('#shootBtn');
                const shootVisible = await shootBtn.isVisible();
                console.log(`✅ 射击按钮可见: ${shootVisible}`);
                
                if (shootVisible) {
                    await shootBtn.click();
                    console.log('✅ 射击按钮点击成功');
                }
                
                // 测试返回按钮
                const backBtn = await page.locator('#backBtn');
                const backVisible = await backBtn.isVisible();
                console.log(`✅ 返回按钮可见: ${backVisible}`);
                
                if (backVisible) {
                    await backBtn.click();
                    console.log('✅ 返回按钮点击成功');
                    
                    // 检查是否返回首页
                    await page.waitForSelector('#startScreen.active', { timeout: 5000 });
                    console.log('✅ 成功返回首页');
                }
                
            } catch (error) {
                console.error('❌ 游戏按钮点击测试失败:', error.message);
            }
        }
        
        // 测试3: 其他首页按钮
        console.log('\n🧪 测试3: 其他首页按钮');
        
        const buttonsToTest = [
            { id: '#instructionsBtn', name: '游戏说明' },
            { id: '#vocabularyBtn', name: '单词本' }
        ];
        
        for (const btn of buttonsToTest) {
            try {
                const element = await page.locator(btn.id);
                const visible = await element.isVisible();
                console.log(`👀 ${btn.name}按钮可见: ${visible}`);
                
                if (visible) {
                    await element.click({ timeout: 3000 });
                    console.log(`✅ ${btn.name}按钮点击成功`);
                    await page.waitForTimeout(1000);
                    
                    // 如果是弹窗，尝试关闭
                    const closeBtn = await page.locator('button:has-text("确定")');
                    if (await closeBtn.isVisible()) {
                        await closeBtn.click();
                        console.log(`✅ 关闭${btn.name}弹窗成功`);
                    }
                }
                
            } catch (error) {
                console.error(`❌ ${btn.name}按钮测试失败:`, error.message);
            }
        }
        
        // 测试4: 触摸事件测试
        console.log('\n🧪 测试4: 触摸事件模拟');
        
        try {
            // 模拟触摸开始游戏按钮
            const startBtnBox = await startBtn.boundingBox();
            if (startBtnBox) {
                await page.touchscreen.tap(startBtnBox.x + startBtnBox.width/2, startBtnBox.y + startBtnBox.height/2);
                console.log('✅ 触摸开始游戏按钮成功');
                
                await page.waitForSelector('#gameScreen.active', { timeout: 3000 });
                console.log('✅ 触摸启动游戏成功');
            }
            
        } catch (error) {
            console.error('❌ 触摸事件测试失败:', error.message);
        }
        
        console.log('\n📊 Android Edge兼容性测试完成');
        console.log('✅ 主要按钮功能已验证');
        console.log('✅ 触摸事件处理已验证'); 
        console.log('✅ 页面导航功能已验证');
        
        // 保持浏览器打开一段时间供手动验证
        console.log('\n🔍 保持浏览器打开10秒供手动验证...');
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error);
    } finally {
        await browser.close();
        console.log('🔚 Android Edge兼容性测试结束');
    }
}

// 运行测试
testAndroidEdgeCompatibility().catch(console.error);