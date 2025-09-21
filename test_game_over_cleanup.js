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

    try {
        const filePath = 'file://' + path.resolve('index.html').replace(/\\\\/g, '/');
        console.log('🧪 测试游戏结束后朗读状态清理');
        console.log('设备: iPhone 12 (390x844)');
        console.log('============================\\n');

        await page.goto(filePath);
        await page.waitForTimeout(2000);

        // 1. 开始游戏
        console.log('🚀 开始游戏测试');
        await page.locator('#startGameBtn').click();
        await page.waitForTimeout(3000);

        console.log('✅ 游戏已启动');

        // 2. 模拟游戏过程中的朗读状态
        await page.evaluate(() => {
            // 模拟游戏运行中的朗读状态
            window.gameRunning = true;
            window.wordReadingInProgress = true;
            window.wordReadingPhase = 2;
            window.wordReadingComplete = false;
            window.targetWord = 'HELLO';

            // 创建一个模拟的朗读弹窗
            const dialog = document.createElement('div');
            dialog.className = 'unified-word-dialog';
            dialog.style.cssText = 'position:fixed;top:20%;left:50%;transform:translate(-50%,-50%);background:white;padding:20px;border-radius:10px;z-index:10000;';
            dialog.innerHTML = '<div>HELLO - 你好</div>';
            document.body.appendChild(dialog);

            console.log('🎭 模拟朗读状态已设置');
        });

        // 检查朗读状态是否正确设置
        const beforeGameOverState = await page.evaluate(() => {
            return {
                gameRunning: window.gameRunning,
                wordReadingInProgress: window.wordReadingInProgress,
                wordReadingPhase: window.wordReadingPhase,
                dialogExists: document.querySelector('.unified-word-dialog') !== null
            };
        });

        console.log('\\n📊 游戏结束前状态:');
        console.log('游戏运行中:', beforeGameOverState.gameRunning ? '✅' : '❌');
        console.log('朗读进行中:', beforeGameOverState.wordReadingInProgress ? '✅' : '❌');
        console.log('朗读阶段:', beforeGameOverState.wordReadingPhase);
        console.log('弹窗存在:', beforeGameOverState.dialogExists ? '✅' : '❌');

        // 3. 触发游戏结束
        console.log('\\n💀 触发游戏结束');
        await page.evaluate(() => {
            // 直接调用gameOver函数
            window.gameOver();
            console.log('gameOver函数已调用');
        });

        await page.waitForTimeout(2000);

        // 4. 检查游戏结束后的状态清理
        const afterGameOverState = await page.evaluate(() => {
            return {
                gameRunning: window.gameRunning,
                wordReadingInProgress: window.wordReadingInProgress,
                wordReadingPhase: window.wordReadingPhase,
                wordReadingComplete: window.wordReadingComplete,
                forceTargetSpawn: window.forceTargetSpawn,
                dialogExists: document.querySelector('.unified-word-dialog') !== null,
                currentScreen: window.currentScreen
            };
        });

        console.log('\\n📋 游戏结束后状态:');
        console.log('游戏运行中:', afterGameOverState.gameRunning ? '❌ 异常' : '✅ 正常');
        console.log('朗读进行中:', afterGameOverState.wordReadingInProgress ? '❌ 未清理' : '✅ 已清理');
        console.log('朗读阶段:', afterGameOverState.wordReadingPhase);
        console.log('朗读完成状态:', afterGameOverState.wordReadingComplete ? '❌ 未重置' : '✅ 已重置');
        console.log('强制生成状态:', afterGameOverState.forceTargetSpawn ? '❌ 未重置' : '✅ 已重置');
        console.log('弹窗存在:', afterGameOverState.dialogExists ? '❌ 未清理' : '✅ 已清理');
        console.log('当前界面:', afterGameOverState.currentScreen);

        // 5. 测试返回主菜单功能
        console.log('\\n🏠 测试返回主菜单');

        // 创建另一个朗读弹窗用于测试backToMenu
        await page.evaluate(() => {
            const dialog = document.createElement('div');
            dialog.className = 'example-dialog';
            dialog.style.cssText = 'position:fixed;top:30%;left:50%;transform:translate(-50%,-50%);background:black;color:white;padding:10px;z-index:10001;';
            dialog.innerHTML = 'Test Dialog';
            document.body.appendChild(dialog);
        });

        await page.evaluate(() => {
            // 重新设置一些状态
            window.wordReadingInProgress = true;
            window.autoSwitchTimeout = setTimeout(() => {}, 5000);
            // 调用backToMenu
            window.backToMenu();
        });

        await page.waitForTimeout(1000);

        const afterBackToMenuState = await page.evaluate(() => {
            return {
                wordReadingInProgress: window.wordReadingInProgress,
                dialogExists: document.querySelector('.example-dialog') !== null,
                currentScreen: window.currentScreen,
                autoSwitchTimeout: window.autoSwitchTimeout
            };
        });

        console.log('\\n📱 返回主菜单后状态:');
        console.log('朗读进行中:', afterBackToMenuState.wordReadingInProgress ? '❌ 未清理' : '✅ 已清理');
        console.log('弹窗存在:', afterBackToMenuState.dialogExists ? '❌ 未清理' : '✅ 已清理');
        console.log('当前界面:', afterBackToMenuState.currentScreen);
        console.log('计时器清理:', afterBackToMenuState.autoSwitchTimeout === null ? '✅ 已清理' : '❌ 未清理');

        // 6. 综合评估
        const allCleanedUp = !afterGameOverState.gameRunning &&
                            !afterGameOverState.wordReadingInProgress &&
                            !afterGameOverState.wordReadingComplete &&
                            !afterGameOverState.forceTargetSpawn &&
                            !afterGameOverState.dialogExists &&
                            !afterBackToMenuState.wordReadingInProgress &&
                            !afterBackToMenuState.dialogExists &&
                            afterBackToMenuState.autoSwitchTimeout === null;

        console.log('\\n============================');
        console.log('🎯 修复验证结果');
        console.log('============================');
        if (allCleanedUp) {
            console.log('🎉 游戏结束后朗读状态清理完美！');
            console.log('✅ 所有朗读相关状态都已正确清理');
            console.log('✅ 弹窗已正确移除');
            console.log('✅ 不会在主页出现朗读内容');
        } else {
            console.log('❌ 仍有朗读状态未正确清理');
        }

        // 截图保存
        await page.screenshot({
            path: 'game_over_cleanup_test.png',
            fullPage: false
        });
        console.log('\\n📸 测试截图已保存: game_over_cleanup_test.png');

    } catch (error) {
        console.error('测试失败:', error);
    }

    await page.waitForTimeout(3000);
    await browser.close();
})();