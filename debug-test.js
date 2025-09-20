const { chromium } = require('playwright');

async function debugGame() {
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 }
    });
    const page = await context.newPage();
    
    console.log('🔍 开始调试飞机射击单词游戏...\n');
    
    // 监听控制台消息
    page.on('console', msg => {
        console.log(`[浏览器] ${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
        console.log(`[页面错误] ${error.message}`);
    });
    
    try {
        // 加载页面
        const filePath = 'file://' + __dirname.replace(/\\/g, '/') + '/index.html';
        await page.goto(filePath, { waitUntil: 'networkidle' });
        
        console.log('1️⃣ 检查主页按钮...');
        
        // 检查所有按钮
        const buttons = await page.locator('button').count();
        console.log(`   发现 ${buttons} 个按钮`);
        
        for (let i = 0; i < buttons; i++) {
            const button = page.locator('button').nth(i);
            const text = await button.textContent();
            const id = await button.getAttribute('id');
            const classes = await button.getAttribute('class');
            const visible = await button.isVisible();
            const enabled = await button.isEnabled();
            
            console.log(`   按钮 ${i + 1}: "${text?.trim()}" (id: ${id}, class: ${classes}, 可见: ${visible}, 启用: ${enabled})`);
        }
        
        // 测试单词本按钮点击
        console.log('\n2️⃣ 测试单词本按钮点击...');
        const vocabularyBtn = page.locator('#vocabularyBtn');
        const vocabVisible = await vocabularyBtn.isVisible();
        console.log(`   单词本按钮可见: ${vocabVisible}`);
        
        if (vocabVisible) {
            await vocabularyBtn.click();
            await page.waitForTimeout(1000);
            
            // 检查弹窗
            const modalElements = await page.locator('.modal, [class*="modal"], [id*="modal"]').count();
            console.log(`   弹窗元素数量: ${modalElements}`);
            
            // 检查所有可能的弹窗类名
            const possibleModals = ['.modal', '.popup', '.dialog', '.overlay', '#vocabularyModal'];
            for (const selector of possibleModals) {
                const count = await page.locator(selector).count();
                if (count > 0) {
                    const visible = await page.locator(selector).first().isVisible();
                    console.log(`   ${selector}: ${count} 个元素，可见: ${visible}`);
                }
            }
        }
        
        // 测试游戏说明按钮
        console.log('\n3️⃣ 测试游戏说明按钮点击...');
        const instructionsBtn = page.locator('#instructionsBtn');
        const instrVisible = await instructionsBtn.isVisible();
        console.log(`   游戏说明按钮可见: ${instrVisible}`);
        
        if (instrVisible) {
            await instructionsBtn.click();
            await page.waitForTimeout(1000);
            
            // 检查alert或其他弹窗形式
            console.log('   检查弹窗结果...');
        }
        
        // 进入游戏
        console.log('\n4️⃣ 进入游戏界面...');
        await page.locator('#startGameBtn').click({ force: true });
        await page.waitForTimeout(3000);
        
        // 检查游戏界面元素
        console.log('\n5️⃣ 检查游戏界面元素...');
        const gameElements = [
            { selector: '#gameCanvas', name: '游戏画布' },
            { selector: '.game-ui', name: '游戏UI' },
            { selector: '.game-header', name: '游戏头部' },
            { selector: '.target-word', name: '目标单词' },
            { selector: '.back-button', name: '返回按钮' },
            { selector: '.pause-btn', name: '暂停按钮' },
            { selector: '.joystick-container', name: '虚拟摇杆' },
            { selector: '.shoot-btn', name: '射击按钮' },
            { selector: '.health-container', name: '血槽容器' },
            { selector: '.health-item', name: '血槽单元' },
            { selector: 'audio', name: '音频元素' }
        ];
        
        for (const element of gameElements) {
            const count = await page.locator(element.selector).count();
            if (count > 0) {
                const visible = await page.locator(element.selector).first().isVisible();
                const position = await page.locator(element.selector).first().boundingBox();
                console.log(`   ${element.name}: ${count} 个, 可见: ${visible}, 位置: ${position ? `(${Math.round(position.x)}, ${Math.round(position.y)})` : '无'}`);
            } else {
                console.log(`   ${element.name}: 不存在`);
            }
        }
        
        // 检查样式问题
        console.log('\n6️⃣ 检查移动端样式调整...');
        const gameScreen = page.locator('#gameScreen');
        const gameScreenVisible = await gameScreen.isVisible();
        console.log(`   游戏屏幕可见: ${gameScreenVisible}`);
        
        if (gameScreenVisible) {
            // 检查游戏屏幕的CSS样式
            const gameScreenStyles = await gameScreen.evaluate(el => {
                const styles = window.getComputedStyle(el);
                return {
                    display: styles.display,
                    position: styles.position,
                    zIndex: styles.zIndex,
                    opacity: styles.opacity
                };
            });
            console.log(`   游戏屏幕样式:`, gameScreenStyles);
        }
        
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('❌ 调试过程中出错:', error);
    }
    
    await browser.close();
}

debugGame();