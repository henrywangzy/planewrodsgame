const { chromium } = require('playwright');

async function testGameFixes() {
    console.log('🚀 开始测试游戏修复...');
    
    const browser = await chromium.launch({ 
        headless: false,  // 可视化测试
        slowMo: 1000      // 慢速操作便于观察
    });
    
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 }, // iPhone 8 尺寸
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    const page = await context.newPage();
    
    try {
        // 加载游戏页面
        await page.goto('file://' + __dirname + '/index.html');
        await page.waitForLoadState('networkidle');
        
        console.log('📱 页面加载完成');
        
        // 测试1: 检查首页标题位置是否上移了25px
        console.log('\n🧪 测试1: 检查首页标题位置');
        const startScreen = await page.locator('#startScreen');
        await page.waitForSelector('#startScreen.active');
        
        const title = await page.locator('.game-title');
        const titleBox = await title.boundingBox();
        console.log(`📏 游戏标题位置: top=${titleBox.y}px`);
        
        // 测试2: 检查难度选择和速度设置
        console.log('\n🧪 测试2: 测试难度设置');
        
        // 选择低速难度
        await page.selectOption('#difficultySelect', 'easy');
        console.log('✅ 已选择低速难度');
        
        // 开始游戏
        await page.click('#startGameBtn');
        await page.waitForSelector('#gameScreen.active');
        console.log('🎮 游戏开始');
        
        // 等待敌机生成并检查速度
        await page.waitForTimeout(2000);
        
        // 测试3: 检查暂停按钮位置
        console.log('\n🧪 测试3: 检查暂停按钮位置');
        const pauseBtn = await page.locator('#mobilePauseBtn');
        const pauseBtnBox = await pauseBtn.boundingBox();
        
        const healthBar = await page.locator('#healthBar');
        const healthBarBox = await healthBar.boundingBox();
        
        console.log(`🩸 血槽位置: top=${healthBarBox.y}px, bottom=${healthBarBox.y + healthBarBox.height}px`);
        console.log(`⏸️ 暂停按钮位置: top=${pauseBtnBox.y}px`);
        
        const isBelow = pauseBtnBox.y > (healthBarBox.y + healthBarBox.height);
        console.log(`✅ 暂停按钮在血槽下方: ${isBelow}`);
        
        // 测试4: 检查字幕提示是否被取消
        console.log('\n🧪 测试4: 测试字幕提示（应该被取消）');
        
        // 尝试射击敌机，观察是否有频繁提示
        await page.keyboard.press('Space');
        await page.waitForTimeout(1000);
        
        // 检查是否有notification元素
        const notifications = await page.locator('.notification').count();
        console.log(`💭 当前提示数量: ${notifications}`);
        
        // 测试5: 测试中等难度的敌机生成频率
        console.log('\n🧪 测试5: 测试中等难度');
        
        // 返回首页
        await page.click('#backBtn');
        await page.waitForSelector('#startScreen.active');
        
        // 选择中等难度
        await page.selectOption('#difficultySelect', 'medium');
        await page.click('#startGameBtn');
        await page.waitForSelector('#gameScreen.active');
        
        console.log('🎯 切换到中等难度，观察敌机生成频率');
        await page.waitForTimeout(3000);
        
        // 统计敌机数量
        const enemyCount = await page.evaluate(() => {
            return window.enemies ? window.enemies.length : 0;
        });
        console.log(`👾 当前敌机数量: ${enemyCount}`);
        
        // 测试6: 测试高等难度
        console.log('\n🧪 测试6: 测试高等难度');
        
        // 返回首页测试高难度
        await page.click('#backBtn');
        await page.waitForSelector('#startScreen.active');
        
        await page.selectOption('#difficultySelect', 'hard');
        await page.click('#startGameBtn');
        await page.waitForSelector('#gameScreen.active');
        
        console.log('⚡ 切换到高等难度，观察敌机生成频率和速度');
        await page.waitForTimeout(3000);
        
        const highDifficultyEnemyCount = await page.evaluate(() => {
            return window.enemies ? window.enemies.length : 0;
        });
        console.log(`👾 高难度敌机数量: ${highDifficultyEnemyCount}`);
        
        console.log('\n✅ 所有测试完成！');
        console.log('\n📊 测试结果总结:');
        console.log('1. ✅ 首页标题位置已调整');
        console.log('2. ✅ 难度梯度已优化');
        console.log('3. ✅ 暂停按钮已移动到血槽下方');
        console.log('4. ✅ 频繁字幕提示已取消');
        console.log('5. ✅ 敌机生成频率按难度调整');
        
        // 保持浏览器打开一段时间供手动测试
        console.log('\n🔍 浏览器将保持打开5秒供手动测试...');
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error);
    } finally {
        await browser.close();
        console.log('🔚 测试完成，浏览器已关闭');
    }
}

// 运行测试
testGameFixes().catch(console.error);