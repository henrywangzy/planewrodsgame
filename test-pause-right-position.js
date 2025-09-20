const { chromium } = require('playwright');
const path = require('path');

async function testPauseButtonRightPosition() {
    console.log('🔍 专项测试：验证暂停按钮是否在屏幕右侧');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
    });
    
    const context = await browser.newContext({
        viewport: { width: 360, height: 640 }, // 标准手机分辨率
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        deviceScaleFactor: 2
    });
    
    const page = await context.newPage();
    
    try {
        // 创建截图目录
        const screenshotsDir = path.join(__dirname, 'screenshots');
        
        // 加载游戏页面
        console.log('📱 正在加载游戏页面...');
        await page.goto('file://' + path.join(__dirname, 'index.html'));
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // 等待页面完全加载
        
        // 选择难度并开始游戏
        console.log('🎮 启动游戏进入游戏界面...');
        await page.selectOption('#difficultySelect', 'easy');
        await page.click('#startGameBtn');
        await page.waitForSelector('#gameScreen.active', { timeout: 10000 });
        await page.waitForTimeout(3000); // 等待游戏界面稳定
        
        // 截图：游戏界面总览
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'game-overview.png'),
            fullPage: true
        });
        console.log('📸 已保存游戏界面总览截图');
        
        // 获取视口信息
        const viewport = page.viewportSize();
        const screenMidX = viewport.width / 2;
        
        console.log('\n📏 屏幕信息:');
        console.log(`📱 屏幕尺寸: ${viewport.width} x ${viewport.height}`);
        console.log(`📏 屏幕中线X坐标: ${screenMidX}`);
        
        // 检查暂停按钮
        const pauseBtn = await page.locator('#mobilePauseBtn');
        const pauseBtnExists = await pauseBtn.count() > 0;
        
        if (!pauseBtnExists) {
            throw new Error('❌ 未找到暂停按钮 (#mobilePauseBtn)');
        }
        
        // 获取暂停按钮的边界框
        const pauseBtnBox = await pauseBtn.boundingBox();
        
        if (!pauseBtnBox) {
            throw new Error('❌ 无法获取暂停按钮的位置信息');
        }
        
        console.log('🔍 原始边界框数据:', pauseBtnBox);
        
        // 计算按钮中心点和边界
        const btnCenterX = pauseBtnBox.x + pauseBtnBox.width / 2;
        const btnRightEdge = pauseBtnBox.x + pauseBtnBox.width;
        const btnLeftEdge = pauseBtnBox.x;
        
        // 高亮显示暂停按钮
        await page.evaluate((selector) => {
            const btn = document.querySelector(selector);
            if (btn) {
                btn.style.border = '3px solid red';
                btn.style.boxShadow = '0 0 10px red';
            }
        }, '#mobilePauseBtn');
        
        // 截图：高亮显示的暂停按钮
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'pause-button-highlighted.png'),
            fullPage: true
        });
        console.log('📸 已保存高亮暂停按钮截图');
        
        // 详细位置信息报告
        console.log('\n📍 暂停按钮详细位置信息:');
        console.log('═'.repeat(50));
        console.log(`🔲 按钮边界框:`);
        console.log(`   左边缘 (x):      ${pauseBtnBox.x}px`);
        console.log(`   上边缘 (y):      ${pauseBtnBox.y}px`);
        console.log(`   宽度:           ${pauseBtnBox.width}px`);
        console.log(`   高度:           ${pauseBtnBox.height}px`);
        console.log(`   右边缘:         ${btnRightEdge}px`);
        console.log(`   底边缘:         ${pauseBtnBox.y + pauseBtnBox.height}px`);
        console.log(`   中心点X:        ${btnCenterX}px`);
        
        console.log(`\n🎯 位置分析:`);
        console.log(`   屏幕中线:       ${screenMidX}px`);
        console.log(`   按钮中心距中线: ${btnCenterX - screenMidX}px ${btnCenterX > screenMidX ? '(右侧)' : '(左侧)'}`);
        console.log(`   距右边缘:       ${viewport.width - btnRightEdge}px`);
        console.log(`   距左边缘:       ${btnLeftEdge}px`);
        
        // 右侧位置验证
        const isInRightHalf = btnCenterX > screenMidX;
        const isNearRightEdge = (viewport.width - btnRightEdge) < viewport.width * 0.3; // 距右边缘小于30%屏宽
        
        console.log(`\n✅ 位置验证结果:`);
        console.log('═'.repeat(50));
        console.log(`🎯 是否在屏幕右半部分: ${isInRightHalf ? '✅ 是' : '❌ 否'}`);
        console.log(`🎯 是否靠近右边缘:     ${isNearRightEdge ? '✅ 是' : '❌ 否'}`);
        
        // 检查其他移动控制按钮的位置作为对比
        const mobileControls = [
            { id: '#joystickContainer', name: '虚拟摇杆' },
            { id: '#shootBtn', name: '射击按钮' },
            { id: '#mobileSettingsBtn', name: '设置按钮' }
        ];
        
        console.log(`\n🎮 其他控制按钮位置对比:`);
        console.log('═'.repeat(50));
        
        for (const control of mobileControls) {
            const element = await page.locator(control.id);
            const count = await element.count();
            
            if (count > 0) {
                const box = await element.boundingBox();
                if (box) {
                    const centerX = box.x + box.width / 2;
                    const side = centerX > screenMidX ? '右侧' : '左侧';
                    console.log(`🎮 ${control.name}: 中心X=${centerX}px (${side})`);
                }
            } else {
                console.log(`🎮 ${control.name}: 未找到`);
            }
        }
        
        // 最终结论
        console.log(`\n🏆 最终测试结论:`);
        console.log('═'.repeat(50));
        
        if (isInRightHalf && isNearRightEdge) {
            console.log('✅ 暂停按钮位置正确：位于屏幕右侧');
        } else if (isInRightHalf && !isNearRightEdge) {
            console.log('⚠️ 暂停按钮在右半部分，但距离右边缘较远');
        } else {
            console.log('❌ 暂停按钮位置错误：不在屏幕右侧');
            console.log('🔧 建议修复CSS定位');
        }
        
        // 测试按钮点击功能
        console.log(`\n🧪 测试按钮功能:`);
        try {
            await pauseBtn.click();
            console.log('✅ 暂停按钮点击测试成功');
            await page.waitForTimeout(1000);
            
            // 检查游戏是否暂停
            const pauseOverlay = await page.locator('#pauseOverlay, .pause-overlay').count();
            if (pauseOverlay > 0) {
                console.log('✅ 游戏成功暂停');
                
                // 恢复游戏
                await pauseBtn.click();
                console.log('✅ 游戏成功恢复');
            }
        } catch (error) {
            console.log('❌ 按钮点击测试失败:', error.message);
        }
        
        // 最终截图
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'final-test-result.png'),
            fullPage: true
        });
        console.log('📸 已保存最终测试结果截图');
        
        // 生成位置报告对象
        const positionReport = {
            timestamp: new Date().toISOString(),
            viewport: viewport,
            pauseButton: {
                exists: true,
                boundingBox: pauseBtnBox,
                centerX: btnCenterX,
                isInRightHalf: isInRightHalf,
                isNearRightEdge: isNearRightEdge,
                distanceFromRightEdge: viewport.width - btnRightEdge,
                distanceFromLeftEdge: btnLeftEdge
            },
            conclusion: isInRightHalf && isNearRightEdge ? 'PASS' : 'FAIL',
            recommendations: isInRightHalf && isNearRightEdge ? [] : [
                '调整CSS right属性值',
                '确保按钮在屏幕右侧30%区域内',
                '检查响应式设计在不同分辨率下的表现'
            ]
        };
        
        console.log(`\n📄 位置报告已生成`);
        console.log(JSON.stringify(positionReport, null, 2));
        
        // 保持浏览器开启以便观察
        console.log(`\n🔍 浏览器将保持开启10秒以便观察...`);
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error);
        
        // 错误时也进行截图
        try {
            await page.screenshot({ 
                path: path.join(__dirname, 'screenshots', 'error-screenshot.png'),
                fullPage: true
            });
            console.log('📸 已保存错误截图');
        } catch (screenshotError) {
            console.error('❌ 无法保存错误截图:', screenshotError);
        }
        
    } finally {
        await browser.close();
        console.log('🔚 测试完成');
    }
}

// 运行测试
testPauseButtonRightPosition().catch(console.error);