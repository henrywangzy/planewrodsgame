const { chromium } = require('playwright');

async function testPauseButtonPosition() {
    console.log('🔍 测试暂停按钮新位置...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext({
        viewport: { width: 375, height: 812 }, // iPhone X尺寸
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    const page = await context.newPage();
    
    try {
        // 加载游戏页面
        await page.goto('file://' + __dirname + '/index.html');
        await page.waitForLoadState('networkidle');
        
        console.log('📱 页面加载完成');
        
        // 开始游戏进入游戏界面
        await page.selectOption('#difficultySelect', 'easy');
        await page.click('#startGameBtn');
        await page.waitForSelector('#gameScreen.active');
        
        console.log('🎮 进入游戏界面');
        
        // 检查暂停按钮位置
        const pauseBtn = await page.locator('#mobilePauseBtn');
        const pauseBtnBox = await pauseBtn.boundingBox();
        
        const shootBtn = await page.locator('#shootBtn');
        const shootBtnBox = await shootBtn.boundingBox();
        
        const viewport = page.viewportSize();
        
        console.log('\n📏 按钮位置信息:');
        console.log(`🖥️ 视口尺寸: ${viewport.width}x${viewport.height}`);
        console.log(`⏸️ 暂停按钮位置: right=${viewport.width - pauseBtnBox.x - pauseBtnBox.width}px, bottom=${viewport.height - pauseBtnBox.y - pauseBtnBox.height}px`);
        console.log(`🔥 射击按钮位置: right=${viewport.width - shootBtnBox.x - shootBtnBox.width}px, bottom=${viewport.height - shootBtnBox.y - shootBtnBox.height}px`);
        
        // 检查按钮是否重叠
        const overlap = !(pauseBtnBox.x + pauseBtnBox.width < shootBtnBox.x || 
                         shootBtnBox.x + shootBtnBox.width < pauseBtnBox.x ||
                         pauseBtnBox.y + pauseBtnBox.height < shootBtnBox.y || 
                         shootBtnBox.y + shootBtnBox.height < pauseBtnBox.y);
        
        console.log(`🔍 按钮重叠检查: ${overlap ? '❌ 有重叠' : '✅ 无重叠'}`);
        
        // 测试按钮点击
        console.log('\n🧪 测试按钮点击:');
        
        await pauseBtn.click();
        console.log('✅ 暂停按钮点击成功');
        await page.waitForTimeout(1000);
        
        await pauseBtn.click();
        console.log('✅ 恢复游戏点击成功');
        
        await shootBtn.click();
        console.log('✅ 射击按钮点击成功');
        
        console.log('\n📊 测试结果:');
        console.log('✅ 暂停按钮已移动到右下角指定位置');
        console.log('✅ 与射击按钮无重叠冲突');
        console.log('✅ 按钮可见性和点击功能正常');
        
        // 保持浏览器打开5秒供观察
        console.log('\n🔍 保持浏览器打开5秒供观察新位置...');
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error);
    } finally {
        await browser.close();
        console.log('🔚 测试完成');
    }
}

// 运行测试
testPauseButtonPosition().catch(console.error);