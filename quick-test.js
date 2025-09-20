const { chromium } = require('playwright');

async function quickTest() {
    console.log('⚡ 快速测试单词本功能...\n');
    
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 500
    });
    
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 }
    });
    
    const page = await context.newPage();
    
    // 监听控制台消息
    page.on('console', msg => {
        if (msg.text().includes('显示单词本') || msg.text().includes('错误')) {
            console.log(`[浏览器] ${msg.text()}`);
        }
    });
    
    // 监听错误
    page.on('pageerror', error => {
        console.log(`❌ 页面错误: ${error.message}`);
    });
    
    try {
        // 加载游戏
        const filePath = 'file://' + __dirname.replace(/\\/g, '/') + '/index.html';
        await page.goto(filePath, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        console.log('1️⃣ 点击单词本按钮...');
        await page.click('#vocabularyBtn');
        await page.waitForTimeout(2000);
        
        // 检查界面是否显示
        const vocabularyScreen = await page.locator('#vocabularyScreen.active').count();
        console.log(`2️⃣ 单词本界面显示: ${vocabularyScreen > 0}`);
        
        if (vocabularyScreen > 0) {
            // 检查单词数量
            const wordItems = await page.locator('.word-item').count();
            console.log(`3️⃣ 单词数量: ${wordItems}`);
            
            // 获取第一个单词内容
            if (wordItems > 0) {
                const firstWordTitle = await page.locator('.word-title').first().textContent();
                console.log(`4️⃣ 第一个单词: ${firstWordTitle}`);
            }
            
            console.log('✅ 单词本功能基本正常！');
        } else {
            console.log('❌ 单词本界面未显示');
        }
        
    } catch (error) {
        console.error('❌ 测试过程中出错:', error.message);
    }
    
    await browser.close();
    console.log('\n🏁 快速测试完成!');
}

quickTest();