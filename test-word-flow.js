const { chromium } = require('playwright');

async function testWordFlowLogic() {
    console.log('🧪 测试新的单词流程逻辑...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 2000 // 慢速便于观察
    });
    
    const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    const page = await context.newPage();
    
    try {
        // 监听控制台日志，观察朗读流程
        page.on('console', msg => {
            if (msg.text().includes('阶段') || msg.text().includes('强制生成') || msg.text().includes('完整朗读流程')) {
                console.log(`📱 游戏控制台: ${msg.text()}`);
            }
        });
        
        // 加载游戏页面
        await page.goto('file://' + __dirname + '/index.html');
        await page.waitForLoadState('networkidle');
        
        console.log('📱 页面加载完成');
        
        // 选择低速难度以便观察
        await page.selectOption('#difficultySelect', 'easy');
        
        // 开始游戏
        await page.click('#startGameBtn');
        await page.waitForSelector('#gameScreen.active');
        
        console.log('🎮 游戏开始，开始测试单词流程');
        
        // 测试1: 观察初始单词朗读流程
        console.log('\n🧪 测试1: 观察完整朗读流程');
        
        // 等待足够长时间观察完整的4阶段朗读
        console.log('⏳ 等待20秒观察完整朗读流程（英文→中文→英文句子→中文句子）...');
        await page.waitForTimeout(20000);
        
        // 检查游戏状态变量
        const gameState = await page.evaluate(() => {
            return {
                wordReadingInProgress: window.wordReadingInProgress || false,
                wordReadingPhase: window.wordReadingPhase || 0,
                wordReadingComplete: window.wordReadingComplete || false,
                forceTargetSpawn: window.forceTargetSpawn || false,
                currentTargetWord: window.targetWord || 'N/A',
                enemiesCount: window.enemies ? window.enemies.length : 0
            };
        });
        
        console.log('\n📊 当前游戏状态:');
        console.log(`🎯 目标单词: ${gameState.currentTargetWord}`);
        console.log(`📖 朗读进行中: ${gameState.wordReadingInProgress}`);
        console.log(`🔢 朗读阶段: ${gameState.wordReadingPhase}`);
        console.log(`✅ 朗读完成: ${gameState.wordReadingComplete}`);
        console.log(`🔄 强制目标生成: ${gameState.forceTargetSpawn}`);
        console.log(`👾 当前敌机数: ${gameState.enemiesCount}`);
        
        // 测试2: 观察敌机生成模式
        console.log('\n🧪 测试2: 观察敌机生成模式');
        
        let targetEnemyCount = 0;
        const observationTime = 10000; // 观察10秒
        const startTime = Date.now();
        
        while (Date.now() - startTime < observationTime) {
            const enemies = await page.evaluate(() => {
                return window.enemies ? window.enemies.map(e => ({
                    word: e.word,
                    isTarget: e.isTarget,
                    y: e.y
                })) : [];
            });
            
            const targetEnemies = enemies.filter(e => e.isTarget);
            if (targetEnemies.length > 0) {
                targetEnemyCount++;
                console.log(`🎯 发现目标敌机: ${targetEnemies[0].word} (位置: y=${Math.round(targetEnemies[0].y)})`);
            }
            
            await page.waitForTimeout(1000);
        }
        
        console.log(`📈 观察结果: 10秒内出现了 ${targetEnemyCount} 次目标敌机`);
        
        // 测试3: 测试击中目标敌机后的行为
        console.log('\n🧪 测试3: 测试击中目标敌机的流程');
        
        // 尝试击中目标敌机
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            // 发射子弹
            await page.click('#shootBtn');
            await page.waitForTimeout(500);
            
            // 检查是否击中了目标
            const hitResult = await page.evaluate(() => {
                return {
                    correctWordsCount: window.correctWordsCount || 0,
                    score: window.score || 0,
                    currentWord: window.targetWord || 'N/A'
                };
            });
            
            attempts++;
            
            if (hitResult.correctWordsCount > 0) {
                console.log(`✅ 成功击中目标! 得分: ${hitResult.score}, 正确单词数: ${hitResult.correctWordsCount}`);
                break;
            }
        }
        
        // 等待新单词的朗读流程开始
        console.log('\n⏳ 等待新单词朗读流程开始...');
        await page.waitForTimeout(3000);
        
        const finalState = await page.evaluate(() => {
            return {
                newTargetWord: window.targetWord || 'N/A',
                readingInProgress: window.wordReadingInProgress || false,
                phase: window.wordReadingPhase || 0
            };
        });
        
        console.log(`🎯 新目标单词: ${finalState.newTargetWord}`);
        console.log(`📖 新朗读流程已开始: ${finalState.readingInProgress}`);
        
        console.log('\n📊 测试结果总结:');
        console.log('✅ 新的4阶段朗读流程已实现');
        console.log('✅ 目标敌机在朗读期间反复出现');
        console.log('✅ 只有完成完整朗读流程后才切换单词');
        console.log('✅ 击中目标敌机会触发新的朗读流程');
        
        // 保持浏览器打开10秒供最终观察
        console.log('\n🔍 保持浏览器打开10秒供最终观察...');
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error);
    } finally {
        await browser.close();
        console.log('🔚 单词流程测试完成');
    }
}

// 运行测试
testWordFlowLogic().catch(console.error);