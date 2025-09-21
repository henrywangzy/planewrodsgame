const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 100
    });

    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        isMobile: true,
        hasTouch: true
    });

    const page = await context.newPage();

    // 监控控制台日志
    const consoleLogs = [];
    page.on('console', msg => {
        if (msg.text().includes('朗读') || msg.text().includes('单词') || msg.text().includes('切换')) {
            consoleLogs.push(`${msg.type()}: ${msg.text()}`);
        }
    });

    try {
        const filePath = 'file://' + path.resolve('index.html').replace(/\\\\/g, '/');
        console.log('🎯 测试单词朗读重复问题修复效果');
        console.log('设备: iPhone 12 (390x844)');
        console.log('================================\\n');

        await page.goto(filePath);
        await page.waitForTimeout(2000);

        // 开始游戏测试
        console.log('🚀 开始游戏测试');

        // 检查开始按钮是否存在
        const startBtnExists = await page.locator('#startGameBtn').isVisible();
        console.log('开始游戏按钮可见:', startBtnExists ? '✅' : '❌');

        if (startBtnExists) {
            await page.locator('#startGameBtn').click();
            console.log('✅ 已点击开始游戏按钮');

            // 等待游戏启动
            await page.waitForTimeout(5000);

            // 检查是否成功切换到游戏界面
            const gameScreenVisible = await page.locator('#gameScreen').isVisible();
            console.log('游戏界面显示:', gameScreenVisible ? '✅' : '❌');

            // 检查游戏画布是否存在
            const canvasExists = await page.locator('#gameCanvas').isVisible();
            console.log('游戏画布存在:', canvasExists ? '✅' : '❌');
        } else {
            console.log('❌ 开始游戏按钮未找到');
        }

        // 检查游戏状态变量
        const gameState = await page.evaluate(() => {
            return {
                gameRunning: window.gameRunning,
                wordReadingInProgress: window.wordReadingInProgress,
                wordReadingComplete: window.wordReadingComplete,
                targetWord: window.targetWord,
                forceTargetSpawn: window.forceTargetSpawn,
                currentWordData: window.currentWordData ? {
                    word: window.currentWordData.word,
                    chinese: window.currentWordData.chinese
                } : null
            };
        });

        console.log('\\n🔍 游戏状态检查:');
        console.log('游戏运行中:', gameState.gameRunning ? '✅' : '❌');
        console.log('当前目标单词:', gameState.targetWord || '未设置');
        console.log('单词朗读进行中:', gameState.wordReadingInProgress ? '✅' : '❌');
        console.log('单词朗读已完成:', gameState.wordReadingComplete ? '✅' : '❌');
        console.log('强制生成目标敌机:', gameState.forceTargetSpawn ? '✅' : '❌');

        // 模拟击中目标敌机测试
        console.log('\\n🎯 模拟击中目标敌机');

        // 等待敌机出现
        await page.waitForTimeout(2000);

        // 检查敌机生成情况
        const enemyCount = await page.evaluate(() => {
            return window.enemies ? window.enemies.length : 0;
        });

        console.log('当前敌机数量:', enemyCount);

        if (enemyCount > 0) {
            // 模拟击中目标字母
            const hitResult = await page.evaluate(() => {
                if (window.enemies && window.enemies.length > 0) {
                    // 找到目标敌机
                    const targetEnemy = window.enemies.find(e => e.isTarget);
                    if (targetEnemy) {
                        console.log('找到目标敌机:', targetEnemy.word);
                        // 模拟击中
                        window.handleTargetHit(targetEnemy);
                        return { success: true, word: targetEnemy.word };
                    }
                }
                return { success: false };
            });

            if (hitResult.success) {
                console.log('✅ 成功击中目标敌机:', hitResult.word);

                // 等待朗读流程
                await page.waitForTimeout(1000);

                // 检查朗读后的状态
                const afterHitState = await page.evaluate(() => {
                    return {
                        wordReadingInProgress: window.wordReadingInProgress,
                        wordReadingComplete: window.wordReadingComplete,
                        newTargetWord: window.targetWord,
                        forceTargetSpawn: window.forceTargetSpawn
                    };
                });

                console.log('\\n📊 击中后状态:');
                console.log('朗读进行中:', afterHitState.wordReadingInProgress ? '✅' : '❌');
                console.log('朗读已完成:', afterHitState.wordReadingComplete ? '✅' : '❌');
                console.log('新目标单词:', afterHitState.newTargetWord);
                console.log('强制生成目标:', afterHitState.forceTargetSpawn ? '✅' : '❌');

                // 等待朗读完成
                console.log('\\n⏳ 等待朗读流程完成...');
                await page.waitForTimeout(20000); // 等待朗读完成

                // 检查朗读完成后的状态
                const finalState = await page.evaluate(() => {
                    return {
                        wordReadingInProgress: window.wordReadingInProgress,
                        wordReadingComplete: window.wordReadingComplete,
                        finalTargetWord: window.targetWord,
                        gameRunning: window.gameRunning
                    };
                });

                console.log('\\n🏁 朗读完成后状态:');
                console.log('朗读进行中:', finalState.wordReadingInProgress ? '❌ 异常' : '✅ 正常');
                console.log('朗读已完成:', finalState.wordReadingComplete ? '❌ 阻塞' : '✅ 不阻塞');
                console.log('最终目标单词:', finalState.finalTargetWord);
                console.log('游戏继续运行:', finalState.gameRunning ? '✅' : '❌');

                // 验证修复效果
                const isFixed = !finalState.wordReadingInProgress &&
                               !finalState.wordReadingComplete &&
                               finalState.gameRunning;

                console.log('\\n🎉 修复效果验证:');
                if (isFixed) {
                    console.log('✅ 单词朗读重复问题已修复！');
                    console.log('✅ 朗读完成后立即切换到下一个单词');
                    console.log('✅ 不再阻塞游戏流程');
                } else {
                    console.log('❌ 问题仍未完全解决');
                }

            } else {
                console.log('❌ 未找到目标敌机');
            }
        } else {
            console.log('❌ 没有敌机生成');
        }

        // 截图保存
        await page.screenshot({
            path: 'word_reading_fix_test.png',
            fullPage: false
        });
        console.log('\\n📸 测试截图已保存: word_reading_fix_test.png');

        // 显示控制台日志
        console.log('\\n📋 相关控制台日志:');
        if (consoleLogs.length === 0) {
            console.log('  无相关日志输出');
        } else {
            consoleLogs.forEach((log, index) => {
                console.log(`  ${index + 1}. ${log}`);
            });
        }

    } catch (error) {
        console.error('测试失败:', error);
    }

    await page.waitForTimeout(3000);
    await browser.close();
})();