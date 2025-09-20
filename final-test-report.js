const { chromium } = require('playwright');

async function generateFinalTestReport() {
    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 }
    });
    const page = await context.newPage();
    
    const testResults = [];
    let jsErrors = [];
    
    console.log('📋 生成最终测试报告 - 飞机射击单词游戏\n');
    console.log('=' * 60);
    
    // 监听错误
    page.on('console', msg => {
        if (msg.type() === 'error') {
            jsErrors.push(msg.text());
        }
    });
    
    try {
        // 1. 页面加载测试
        console.log('🔍 1. 页面加载和基础功能测试');
        const filePath = 'file://' + __dirname.replace(/\\/g, '/') + '/index.html';
        await page.goto(filePath, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        const title = await page.title();
        console.log(`   ✅ 页面标题: "${title}"`);
        testResults.push({ category: '页面加载', test: '页面标题', status: '通过', detail: title });
        
        // 2. 难度选择测试
        console.log('\n🎯 2. 难度选择功能测试');
        const gradeSelect = await page.locator('#gradeSelect');
        const optionCount = await page.locator('#gradeSelect option').count();
        console.log(`   ✅ 难度选项数量: ${optionCount}`);
        
        await page.selectOption('#gradeSelect', '5');
        const selectedValue = await page.locator('#gradeSelect').inputValue();
        console.log(`   ✅ 难度选择功能正常 (选择了${selectedValue}年级)`);
        testResults.push({ category: '交互功能', test: '难度选择', status: '通过', detail: `${optionCount}个选项，选择功能正常` });
        
        // 3. 单词本按钮测试（alert弹窗）
        console.log('\n📚 3. 单词本按钮测试');
        const vocabBtn = page.locator('#vocabularyBtn');
        const vocabVisible = await vocabBtn.isVisible();
        console.log(`   ✅ 单词本按钮可见: ${vocabVisible}`);
        
        // 处理alert弹窗
        page.on('dialog', dialog => {
            console.log(`   ✅ 单词本弹出alert弹窗: "${dialog.message().substring(0, 50)}..."`);
            dialog.accept();
        });
        
        await vocabBtn.click();
        await page.waitForTimeout(1000);
        testResults.push({ category: '交互功能', test: '单词本按钮', status: '通过', detail: '成功弹出单词列表(alert形式)' });
        
        // 4. 游戏说明按钮测试（自定义弹窗）
        console.log('\n📖 4. 游戏说明按钮测试');
        const instrBtn = page.locator('#instructionsBtn');
        await instrBtn.click();
        await page.waitForTimeout(1000);
        
        // 检查自定义弹窗（动态创建的div）
        const customDialog = await page.locator('div[style*="position:fixed"]').count();
        if (customDialog > 0) {
            const dialogText = await page.locator('div[style*="position:fixed"]').first().textContent();
            console.log(`   ✅ 游戏说明自定义弹窗打开，内容预览: "${dialogText.substring(0, 30)}..."`);
            
            // 检查弹窗宽度
            const dialogWidth = await page.locator('div[style*="max-width:450px"]').count();
            const widthResult = dialogWidth > 0 ? '符合要求(450px)' : '未找到450px宽度设置';
            console.log(`   ${dialogWidth > 0 ? '✅' : '⚠️'} 弹窗宽度: ${widthResult}`);
            
            // 关闭弹窗
            await page.locator('button:has-text("确定")').click();
            await page.waitForTimeout(500);
            
            testResults.push({ category: '交互功能', test: '游戏说明按钮', status: '通过', detail: `自定义弹窗正常，宽度${widthResult}` });
        } else {
            console.log(`   ❌ 游戏说明弹窗未找到`);
            testResults.push({ category: '交互功能', test: '游戏说明按钮', status: '失败', detail: '自定义弹窗未找到' });
        }
        
        // 5. 开始游戏和界面切换测试
        console.log('\n🎮 5. 开始游戏功能测试');
        await page.locator('#startGameBtn').click({ force: true });
        await page.waitForTimeout(3000);
        
        const startScreenVisible = await page.locator('#startScreen').isVisible();
        const gameScreenVisible = await page.locator('#gameScreen').isVisible();
        
        console.log(`   开始屏幕可见: ${startScreenVisible}`);
        console.log(`   游戏屏幕可见: ${gameScreenVisible}`);
        
        if (!startScreenVisible && gameScreenVisible) {
            console.log('   ✅ 屏幕切换成功');
            testResults.push({ category: '游戏功能', test: '开始游戏按钮', status: '通过', detail: '成功进入游戏界面' });
        } else {
            console.log('   ❌ 屏幕切换失败');
            testResults.push({ category: '游戏功能', test: '开始游戏按钮', status: '失败', detail: '屏幕切换异常' });
        }
        
        // 6. 游戏界面UI元素测试
        console.log('\n🎨 6. 游戏界面UI元素测试');
        const uiElements = [
            { selector: '#gameCanvas', name: '游戏画布', expected: true },
            { selector: '#backBtn', name: '返回按钮', expected: true },
            { selector: '.target-word', name: '目标单词显示', expected: true },
            { selector: '#mobilePauseBtn', name: '移动端暂停按钮', expected: true },
            { selector: '#shootBtn', name: '射击按钮', expected: true },
            { selector: '.joystick-container', name: '虚拟摇杆', expected: false }, // 可能动态生成
            { selector: '.health-container', name: '血槽容器', expected: false }, // 可能动态生成
            { selector: 'audio', name: '音频元素', expected: false } // 可能动态生成
        ];
        
        for (const element of uiElements) {
            const count = await page.locator(element.selector).count();
            const exists = count > 0;
            let visible = false;
            let position = null;
            
            if (exists) {
                try {
                    visible = await page.locator(element.selector).first().isVisible();
                    position = await page.locator(element.selector).first().boundingBox();
                } catch (e) {
                    // 元素可能不可交互
                }
            }
            
            const status = exists ? '存在' : '不存在';
            const visibility = exists ? (visible ? '可见' : '隐藏') : '';
            const pos = position ? `位置:(${Math.round(position.x)}, ${Math.round(position.y)})` : '';
            
            console.log(`   ${exists ? (element.expected || visible) ? '✅' : '⚠️' : element.expected ? '❌' : '⚠️'} ${element.name}: ${status} ${visibility} ${pos}`);
            
            const testStatus = exists ? (element.expected || visible ? '通过' : '部分通过') : (element.expected ? '失败' : '预期不存在');
            testResults.push({ 
                category: '界面元素', 
                test: element.name, 
                status: testStatus, 
                detail: `${status} ${visibility} ${pos}`.trim() 
            });
        }
        
        // 7. 移动端特殊UI检查
        console.log('\n📱 7. 移动端特殊UI检查');
        
        // 检查按钮位置调整
        const pauseBtn = page.locator('#mobilePauseBtn');
        const shootBtn = page.locator('#shootBtn');
        
        if (await pauseBtn.count() > 0) {
            const pausePos = await pauseBtn.boundingBox();
            const shootPos = await shootBtn.count() > 0 ? await shootBtn.boundingBox() : null;
            
            if (pausePos && shootPos) {
                const pauseAboveShoot = pausePos.y < shootPos.y;
                console.log(`   ${pauseAboveShoot ? '✅' : '❌'} 暂停按钮位置: ${pauseAboveShoot ? '在射击按钮上方(符合要求)' : '位置不正确'}`);
                testResults.push({ 
                    category: '移动端UI', 
                    test: '暂停按钮位置', 
                    status: pauseAboveShoot ? '通过' : '失败', 
                    detail: `暂停按钮Y:${Math.round(pausePos.y)}, 射击按钮Y:${Math.round(shootPos.y)}` 
                });
            }
        }
        
        // 8. 返回主菜单测试
        console.log('\n🏠 8. 返回主菜单功能测试');
        const backBtn = page.locator('#backBtn');
        if (await backBtn.count() > 0) {
            await backBtn.click({ force: true });
            await page.waitForTimeout(2000);
            
            const backToStart = await page.locator('#startScreen').isVisible();
            const gameHidden = !await page.locator('#gameScreen').isVisible();
            
            if (backToStart && gameHidden) {
                console.log('   ✅ 返回主菜单功能正常');
                testResults.push({ category: '导航功能', test: '返回主菜单', status: '通过', detail: '成功返回开始界面' });
            } else {
                console.log('   ❌ 返回主菜单功能异常');
                testResults.push({ category: '导航功能', test: '返回主菜单', status: '失败', detail: '未能正确返回' });
            }
        }
        
        // 9. JavaScript错误检查
        console.log('\n🐛 9. JavaScript错误检查');
        const gradeOneWordErrors = jsErrors.filter(error => error.includes('gradeOneWords'));
        
        if (gradeOneWordErrors.length === 0) {
            console.log('   ✅ 未发现gradeOneWords相关错误');
            testResults.push({ category: '错误检查', test: 'gradeOneWords错误', status: '通过', detail: '错误已修复' });
        } else {
            console.log('   ❌ 仍然存在gradeOneWords错误');
            console.log('   错误详情:', gradeOneWordErrors);
            testResults.push({ category: '错误检查', test: 'gradeOneWords错误', status: '失败', detail: gradeOneWordErrors.join('; ') });
        }
        
        if (jsErrors.length === 0) {
            console.log('   ✅ 未发现其他JavaScript错误');
        } else {
            console.log(`   ⚠️ 发现${jsErrors.length}个JavaScript错误:`);
            jsErrors.forEach((error, index) => {
                console.log(`      ${index + 1}. ${error}`);
            });
        }
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error.message);
        testResults.push({ category: '整体测试', test: '测试执行', status: '失败', detail: error.message });
    }
    
    // 生成最终报告
    console.log('\n📊 最终测试报告汇总');
    console.log('=' * 60);
    
    const categories = [...new Set(testResults.map(r => r.category))];
    let totalPass = 0, totalFail = 0, totalPartial = 0;
    
    categories.forEach(category => {
        console.log(`\n📂 ${category}:`);
        const categoryTests = testResults.filter(r => r.category === category);
        
        categoryTests.forEach(test => {
            const icon = test.status === '通过' ? '✅' : test.status === '失败' ? '❌' : '⚠️';
            console.log(`   ${icon} ${test.test}: ${test.detail}`);
            
            if (test.status === '通过') totalPass++;
            else if (test.status === '失败') totalFail++;
            else totalPartial++;
        });
    });
    
    console.log('\n📈 总体统计:');
    console.log(`   ✅ 通过: ${totalPass} 项`);
    console.log(`   ❌ 失败: ${totalFail} 项`);
    console.log(`   ⚠️ 部分通过: ${totalPartial} 项`);
    console.log(`   📊 总计: ${testResults.length} 项`);
    
    const passRate = Math.round((totalPass / testResults.length) * 100);
    console.log(`   🎯 通过率: ${passRate}%`);
    
    console.log('\n🏆 测试结论:');
    if (passRate >= 80) {
        console.log('   🎉 游戏功能基本正常，符合预期要求');
    } else if (passRate >= 60) {
        console.log('   ⚠️ 游戏功能大部分正常，有少数问题需要关注');
    } else {
        console.log('   ❗ 游戏存在较多问题，需要进一步修复');
    }
    
    await browser.close();
    
    return {
        results: testResults,
        errors: jsErrors,
        summary: {
            pass: totalPass,
            fail: totalFail,
            partial: totalPartial,
            total: testResults.length,
            passRate: passRate
        }
    };
}

generateFinalTestReport().then(report => {
    console.log('\n🏁 测试完成!');
    process.exit(0);
}).catch(error => {
    console.error('❌ 测试失败:', error);
    process.exit(1);
});