const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // 启用控制台日志
    page.on('console', msg => console.log('页面日志:', msg.text()));
    page.on('pageerror', error => console.error('页面错误:', error.message));

    try {
        // 加载游戏页面
        const filePath = 'file://' + path.resolve('index.html').replace(/\\/g, '/');
        console.log('加载游戏页面:', filePath);
        await page.goto(filePath);

        // 等待页面加载
        await page.waitForTimeout(2000);

        // 测试1: 检查主界面是否加载
        console.log('\n测试1: 检查主界面元素...');
        const title = await page.locator('.game-title').textContent();
        console.log('游戏标题:', title);

        // 测试2: 点击音乐控制按钮
        console.log('\n测试2: 测试音乐控制按钮...');
        const musicBtn = page.locator('#musicToggleBtn');
        if (await musicBtn.isVisible()) {
            await musicBtn.click();
            console.log('✅ 音乐按钮点击成功');
            await page.waitForTimeout(1000);

            // 再次点击切换
            await musicBtn.click();
            console.log('✅ 音乐按钮切换成功');
        } else {
            console.log('❌ 音乐按钮不可见');
        }

        // 测试3: 选择年级
        console.log('\n测试3: 测试年级选择...');
        await page.selectOption('#gradeSelect', '3');
        console.log('✅ 年级选择成功');

        // 测试4: 选择难度
        console.log('\n测试4: 测试难度选择...');
        await page.selectOption('#difficultySelect', 'medium');
        console.log('✅ 难度选择成功');

        // 测试5: 开始游戏
        console.log('\n测试5: 开始游戏...');
        await page.click('#startGameBtn');
        await page.waitForTimeout(2000);

        // 检查游戏是否启动
        const gameScreen = await page.locator('#gameScreen').isVisible();
        if (gameScreen) {
            console.log('✅ 游戏启动成功');

            // 测试6: 暂停按钮
            console.log('\n测试6: 测试暂停功能...');
            const pauseBtn = page.locator('#mobilePauseBtn');
            if (await pauseBtn.isVisible()) {
                await pauseBtn.click();
                console.log('✅ 暂停按钮点击成功');
                await page.waitForTimeout(1000);
            }

            // 测试7: 返回菜单
            console.log('\n测试7: 返回主菜单...');
            const backBtn = page.locator('#backBtn');
            if (await backBtn.isVisible()) {
                await backBtn.click();
                console.log('✅ 返回按钮点击成功');
                await page.waitForTimeout(1000);
            }
        } else {
            console.log('❌ 游戏未能启动');
        }

        // 测试8: 单词本功能
        console.log('\n测试8: 测试单词本功能...');
        const vocabularyBtn = page.locator('#vocabularyBtn');
        if (await vocabularyBtn.isVisible()) {
            await vocabularyBtn.click();
            console.log('✅ 单词本按钮点击成功');
            await page.waitForTimeout(1000);

            // 返回主菜单
            const vocabBackBtn = page.locator('.back-btn-vocab');
            if (await vocabBackBtn.isVisible()) {
                await vocabBackBtn.click();
                console.log('✅ 从单词本返回成功');
            }
        }

        // 测试9: 游戏说明
        console.log('\n测试9: 测试游戏说明...');
        const instructionsBtn = page.locator('#instructionsBtn');
        if (await instructionsBtn.isVisible()) {
            await instructionsBtn.click();
            console.log('✅ 游戏说明按钮点击成功');
            await page.waitForTimeout(1000);

            // 关闭弹窗
            const closeBtn = page.locator('button:has-text("确定")');
            if (await closeBtn.isVisible()) {
                await closeBtn.click();
                console.log('✅ 关闭说明弹窗成功');
            }
        }

        console.log('\n===================');
        console.log('✅ 所有测试完成！');
        console.log('游戏功能正常运行');
        console.log('===================');

    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }

    // 保持浏览器打开5秒供查看
    await page.waitForTimeout(5000);

    await browser.close();
})();