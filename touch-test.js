const { chromium } = require('playwright');

async function testMultiTouch() {
    console.log('🔍 测试多点触控功能...\n');
    
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 500,
        args: ['--force-device-scale-factor=1']
    });
    
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
        hasTouch: true,
        isMobile: true
    });
    
    const page = await context.newPage();
    
    // 监听控制台消息
    page.on('console', msg => {
        if (msg.type() === 'log') {
            console.log(`[浏览器] ${msg.text()}`);
        } else if (msg.type() === 'error') {
            console.log(`[错误] ${msg.text()}`);
        }
    });
    
    try {
        // 加载游戏
        const filePath = 'file://' + __dirname.replace(/\\/g, '/') + '/index.html';
        await page.goto(filePath, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        console.log('1️⃣ 进入游戏...');
        await page.click('#startGameBtn');
        await page.waitForTimeout(3000);
        
        // 检查游戏界面元素
        const joystickExists = await page.locator('#joystickArea').count() > 0;
        const shootBtnExists = await page.locator('#shootBtn').count() > 0;
        
        console.log(`2️⃣ 摇杆存在: ${joystickExists}`);
        console.log(`3️⃣ 射击按钮存在: ${shootBtnExists}`);
        
        if (joystickExists && shootBtnExists) {
            console.log('\n4️⃣ 开始多点触控测试...');
            
            // 获取摇杆和射击按钮的位置
            const joystickPos = await page.locator('#joystickArea').boundingBox();
            const shootPos = await page.locator('#shootBtn').boundingBox();
            
            console.log(`摇杆位置: x=${joystickPos.x}, y=${joystickPos.y}`);
            console.log(`射击按钮位置: x=${shootPos.x}, y=${shootPos.y}`);
            
            // 注入调试代码
            await page.evaluate(() => {
                window.touchDebug = {
                    joystickTouches: 0,
                    shootTouches: 0,
                    activeTouches: new Set()
                };
                
                // 重写原有事件监听器以添加调试信息
                const originalLog = console.log;
                window.debugLog = function(msg) {
                    originalLog('🔧 [DEBUG] ' + msg);
                };
                
                // 监听所有触摸事件
                document.addEventListener('touchstart', function(e) {
                    window.touchDebug.activeTouches.clear();
                    for (let i = 0; i < e.touches.length; i++) {
                        window.touchDebug.activeTouches.add(e.touches[i].identifier);
                    }
                    window.debugLog(`TouchStart: ${e.touches.length} 个触摸点, IDs: [${Array.from(window.touchDebug.activeTouches).join(',')}]`);
                }, true);
                
                document.addEventListener('touchmove', function(e) {
                    window.debugLog(`TouchMove: ${e.touches.length} 个触摸点正在移动`);
                }, true);
                
                document.addEventListener('touchend', function(e) {
                    window.debugLog(`TouchEnd: 剩余 ${e.touches.length} 个触摸点`);
                }, true);
            });
            
            console.log('\n5️⃣ 模拟同时触摸摇杆和射击按钮...');
            
            // 模拟多点触控
            await page.touchscreen.tap(joystickPos.x + joystickPos.width/2, joystickPos.y + joystickPos.height/2);
            await page.waitForTimeout(100);
            
            // 在保持摇杆的同时点击射击按钮
            await page.evaluate(async (shootPos) => {
                const joystick = document.getElementById('joystickArea');
                const shootBtn = document.getElementById('shootBtn');
                
                // 创建同时触摸事件
                const touch1 = new Touch({
                    identifier: 1,
                    target: joystick,
                    clientX: joystick.getBoundingClientRect().x + 50,
                    clientY: joystick.getBoundingClientRect().y + 50
                });
                
                const touch2 = new Touch({
                    identifier: 2,
                    target: shootBtn,
                    clientX: shootBtn.getBoundingClientRect().x + 30,
                    clientY: shootBtn.getBoundingClientRect().y + 30
                });
                
                // 同时触摸两个区域
                const touchStartEvent = new TouchEvent('touchstart', {
                    touches: [touch1, touch2],
                    targetTouches: [touch1],
                    changedTouches: [touch1, touch2]
                });
                
                window.debugLog('模拟多点触控开始');
                joystick.dispatchEvent(touchStartEvent);
                
                // 稍后再模拟射击按钮触摸
                setTimeout(() => {
                    const shootTouchEvent = new TouchEvent('touchstart', {
                        touches: [touch1, touch2],
                        targetTouches: [touch2],
                        changedTouches: [touch2]
                    });
                    shootBtn.dispatchEvent(shootTouchEvent);
                    window.debugLog('射击按钮也被触摸');
                }, 100);
                
            }, shootPos);
            
            await page.waitForTimeout(3000);
            
            // 检查游戏状态
            const debugInfo = await page.evaluate(() => {
                return {
                    activeTouches: Array.from(window.touchDebug?.activeTouches || []),
                    playerExists: !!window.player,
                    gameRunning: window.gameRunning,
                    joystickActive: window.joystickActive
                };
            });
            
            console.log('\n6️⃣ 测试结果:');
            console.log(`活跃触摸点: ${debugInfo.activeTouches.length} 个`);
            console.log(`玩家存在: ${debugInfo.playerExists}`);
            console.log(`游戏运行中: ${debugInfo.gameRunning}`);
            console.log(`摇杆激活: ${debugInfo.joystickActive}`);
        }
        
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('❌ 测试过程中出错:', error);
    }
    
    await browser.close();
    console.log('\n🏁 测试完成!');
}

testMultiTouch();