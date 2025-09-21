const { chromium } = require('playwright');
const path = require('path');

// 测试结果记录
const issues = [];

async function testGame() {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 300
    });

    // 创建两个上下文：桌面端和移动端
    const desktopContext = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });

    const mobileContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        isMobile: true,
        hasTouch: true
    });

    console.log('========================================');
    console.log('🔍 开始全面测试飞机射击单词游戏');
    console.log('========================================\n');

    // 测试桌面端
    console.log('📱 测试桌面端...');
    await testPlatform(desktopContext, 'desktop');

    // 测试移动端
    console.log('\n📱 测试移动端...');
    await testPlatform(mobileContext, 'mobile');

    await browser.close();

    // 输出测试结果
    console.log('\n========================================');
    console.log('📊 测试结果汇总');
    console.log('========================================');

    if (issues.length === 0) {
        console.log('✅ 所有测试通过！游戏运行正常。');
    } else {
        console.log(`❌ 发现 ${issues.length} 个问题：\n`);
        issues.forEach((issue, index) => {
            console.log(`${index + 1}. [${issue.platform}] ${issue.category}: ${issue.description}`);
        });
    }
}

async function testPlatform(context, platform) {
    const page = await context.newPage();

    // 监控错误
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    page.on('pageerror', error => {
        issues.push({
            platform,
            category: 'JavaScript错误',
            description: error.message
        });
    });

    const filePath = 'file://' + path.resolve('index.html').replace(/\\/g, '/');
    await page.goto(filePath);
    await page.waitForTimeout(2000);

    try {
        // 1. 测试主页面
        console.log(`  ✓ 检查主页面...`);
        const startScreenVisible = await page.locator('#startScreen').isVisible();
        if (!startScreenVisible) {
            issues.push({
                platform,
                category: '页面显示',
                description: '主页面未正确显示'
            });
        }

        // 2. 测试音乐按钮
        console.log(`  ✓ 测试音乐按钮...`);
        const musicBtn = page.locator('#musicToggleBtn');
        if (await musicBtn.isVisible()) {
            await musicBtn.click();
            await page.waitForTimeout(500);
            await musicBtn.click();
        } else {
            issues.push({
                platform,
                category: '按钮功能',
                description: '音乐按钮不可见或不可点击'
            });
        }

        // 3. 测试游戏说明按钮
        console.log(`  ✓ 测试游戏说明...`);
        const instructionsBtn = page.locator('#instructionsBtn');
        if (await instructionsBtn.isVisible()) {
            await instructionsBtn.click();
            await page.waitForTimeout(1000);

            const dialogCloseBtn = page.locator('button:has-text("确定")');
            if (await dialogCloseBtn.isVisible()) {
                await dialogCloseBtn.click();
            } else {
                issues.push({
                    platform,
                    category: '弹窗功能',
                    description: '游戏说明弹窗关闭按钮不可见'
                });
            }
        }

        // 4. 测试单词本
        console.log(`  ✓ 测试单词本...`);
        const vocabularyBtn = page.locator('#vocabularyBtn');
        if (await vocabularyBtn.isVisible()) {
            await vocabularyBtn.click();
            await page.waitForTimeout(1000);

            // 检查单词本是否显示
            const vocabScreen = await page.locator('#vocabularyScreen').isVisible();
            if (!vocabScreen) {
                issues.push({
                    platform,
                    category: '页面切换',
                    description: '单词本页面未正确显示'
                });
            }

            // 检查单词列表
            const wordItems = await page.locator('.word-item').count();
            if (wordItems === 0) {
                issues.push({
                    platform,
                    category: '单词本功能',
                    description: '单词列表为空'
                });
            }

            // 返回主页
            const backBtn = page.locator('.back-btn-compact');
            if (await backBtn.isVisible()) {
                await backBtn.click();
                await page.waitForTimeout(1000);
            }
        }

        // 5. 测试游戏开始
        console.log(`  ✓ 测试游戏开始...`);

        // 选择年级和难度
        await page.selectOption('#gradeSelect', '3');
        await page.selectOption('#difficultySelect', 'medium');

        // 开始游戏
        const startBtn = page.locator('#startGameBtn');
        if (await startBtn.isVisible()) {
            await startBtn.click();
            await page.waitForTimeout(3000);

            // 检查游戏界面
            const gameScreen = await page.locator('#gameScreen').isVisible();
            if (!gameScreen) {
                issues.push({
                    platform,
                    category: '游戏启动',
                    description: '游戏界面未正确显示'
                });
            }

            // 检查游戏元素
            const canvas = await page.locator('#gameCanvas').isVisible();
            if (!canvas) {
                issues.push({
                    platform,
                    category: '游戏渲染',
                    description: '游戏画布未正确显示'
                });
            }

            // 测试移动端控制器
            if (platform === 'mobile') {
                const joystick = await page.locator('#joystickArea').isVisible();
                const shootBtn = await page.locator('#shootBtn').isVisible();

                if (!joystick || !shootBtn) {
                    issues.push({
                        platform,
                        category: '移动端控制',
                        description: '虚拟控制器未正确显示'
                    });
                }

                // 测试射击按钮
                if (shootBtn) {
                    await page.locator('#shootBtn').click();
                    await page.waitForTimeout(500);
                }
            }

            // 测试暂停功能
            console.log(`  ✓ 测试暂停功能...`);
            const pauseBtn = page.locator('#mobilePauseBtn');
            if (await pauseBtn.isVisible()) {
                await pauseBtn.click();
                await page.waitForTimeout(1000);

                // 检查是否暂停
                const isPaused = await page.evaluate(() => window.isPaused);
                if (!isPaused) {
                    issues.push({
                        platform,
                        category: '游戏控制',
                        description: '暂停功能未正常工作'
                    });
                }
            }

            // 返回主菜单
            console.log(`  ✓ 测试返回主菜单...`);
            const backToMenuBtn = page.locator('#backBtn');
            if (await backToMenuBtn.isVisible()) {
                await backToMenuBtn.click();
                await page.waitForTimeout(1000);

                // 检查是否返回主页
                const mainScreen = await page.locator('#startScreen').isVisible();
                if (!mainScreen) {
                    issues.push({
                        platform,
                        category: '页面导航',
                        description: '未能正确返回主菜单'
                    });
                }
            }
        }

        // 6. 检查控制台错误
        if (errors.length > 0) {
            errors.forEach(error => {
                if (!error.includes('play() failed') && !error.includes('user didn\'t interact')) {
                    issues.push({
                        platform,
                        category: '控制台错误',
                        description: error
                    });
                }
            });
        }

        console.log(`  ✅ ${platform} 平台测试完成`);

    } catch (error) {
        issues.push({
            platform,
            category: '测试错误',
            description: error.message
        });
    }

    await page.close();
}

// 运行测试
testGame().catch(console.error);