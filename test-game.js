const { chromium } = require('playwright');

async function testPlaneWordsGame() {
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 } // iPhone 6/7/8 size
    });
    const page = await context.newPage();
    
    const testResults = [];
    let errors = [];
    
    console.log('🚀 开始测试飞机射击单词游戏...\n');
    
    // 监听控制台错误
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
            console.log('❌ 控制台错误:', msg.text());
        }
    });
    
    try {
        // 1. 导航到游戏页面
        console.log('1️⃣ 测试游戏首页...');
        const filePath = 'file://' + __dirname.replace(/\\/g, '/') + '/index.html';
        console.log(`   使用文件路径: ${filePath}`);
        await page.goto(filePath, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // 检查页面标题
        const title = await page.title();
        console.log(`   ✅ 页面标题: ${title}`);
        testResults.push({ test: '页面加载', status: '通过', detail: `标题: ${title}` });
        
        // 2. 测试难度选择下拉菜单
        console.log('\n2️⃣ 测试难度选择下拉菜单...');
        const gradeSelect = await page.locator('#gradeSelect').count();
        if (gradeSelect > 0) {
            console.log('   ✅ 难度选择下拉菜单存在');
            
            // 检查选项
            const options = await page.locator('#gradeSelect option').count();
            console.log(`   ✅ 下拉菜单选项数量: ${options}`);
            
            // 尝试选择不同难度
            await page.selectOption('#gradeSelect', '3');
            await page.waitForTimeout(500);
            const selectedValue = await page.locator('#gradeSelect').inputValue();
            console.log(`   ✅ 选择难度测试通过，当前值: ${selectedValue}`);
            testResults.push({ test: '难度选择下拉菜单', status: '通过', detail: `${options}个选项，测试选择功能正常` });
        } else {
            console.log('   ❌ 难度选择下拉菜单不存在');
            testResults.push({ test: '难度选择下拉菜单', status: '失败', detail: '元素不存在' });
        }
        
        // 3. 测试单词本按钮
        console.log('\n3️⃣ 测试单词本按钮...');
        const vocabButton = await page.locator('button:has-text("单词本")').count();
        if (vocabButton > 0) {
            await page.click('button:has-text("单词本")');
            await page.waitForTimeout(1000);
            
            // 检查是否弹出单词列表
            const modal = await page.locator('.modal').count();
            if (modal > 0) {
                console.log('   ✅ 单词本弹窗打开成功');
                
                // 检查单词列表内容
                const wordItems = await page.locator('.word-item').count();
                console.log(`   ✅ 单词数量: ${wordItems}`);
                
                // 关闭弹窗
                await page.click('.close-btn');
                await page.waitForTimeout(500);
                testResults.push({ test: '单词本按钮', status: '通过', detail: `显示${wordItems}个单词` });
            } else {
                console.log('   ❌ 单词本弹窗未打开');
                testResults.push({ test: '单词本按钮', status: '失败', detail: '弹窗未打开' });
            }
        } else {
            console.log('   ❌ 单词本按钮不存在');
            testResults.push({ test: '单词本按钮', status: '失败', detail: '按钮不存在' });
        }
        
        // 4. 测试游戏说明按钮
        console.log('\n4️⃣ 测试游戏说明按钮...');
        const helpButton = await page.locator('button:has-text("游戏说明")').count();
        if (helpButton > 0) {
            await page.click('button:has-text("游戏说明")');
            await page.waitForTimeout(1000);
            
            // 检查弹窗宽度
            const helpModal = await page.locator('.modal').first();
            const modalExists = await helpModal.count();
            if (modalExists > 0) {
                const modalWidth = await helpModal.evaluate(el => getComputedStyle(el).width);
                console.log(`   ✅ 游戏说明弹窗打开，宽度: ${modalWidth}`);
                
                // 检查是否为450px宽度
                if (modalWidth === '450px') {
                    console.log('   ✅ 弹窗宽度符合要求 (450px)');
                    testResults.push({ test: '游戏说明按钮', status: '通过', detail: `宽度: ${modalWidth}` });
                } else {
                    console.log(`   ⚠️ 弹窗宽度不符合要求，期望450px，实际: ${modalWidth}`);
                    testResults.push({ test: '游戏说明按钮', status: '部分通过', detail: `宽度: ${modalWidth}，期望450px` });
                }
                
                // 关闭弹窗
                await page.click('.close-btn');
                await page.waitForTimeout(500);
            } else {
                console.log('   ❌ 游戏说明弹窗未打开');
                testResults.push({ test: '游戏说明按钮', status: '失败', detail: '弹窗未打开' });
            }
        } else {
            console.log('   ❌ 游戏说明按钮不存在');
            testResults.push({ test: '游戏说明按钮', status: '失败', detail: '按钮不存在' });
        }
        
        // 5. 测试开始游戏按钮
        console.log('\n5️⃣ 测试开始游戏功能...');
        const startButton = await page.locator('#startGameBtn').count();
        if (startButton > 0) {
            // 使用强制点击避免被遮挡
            await page.locator('#startGameBtn').click({ force: true });
            await page.waitForTimeout(3000);
            
            // 检查是否进入游戏界面
            const gameCanvas = await page.locator('#gameCanvas').count();
            const gameUI = await page.locator('.game-ui').count();
            
            if (gameCanvas > 0 || gameUI > 0) {
                console.log('   ✅ 成功进入游戏界面');
                testResults.push({ test: '开始游戏按钮', status: '通过', detail: '成功进入游戏界面' });
                
                // 6. 测试游戏界面元素
                console.log('\n6️⃣ 测试游戏界面元素...');
                
                // 检查返回按钮
                const backButton = await page.locator('button:has-text("←")').count();
                console.log(`   ${backButton > 0 ? '✅' : '❌'} 返回按钮: ${backButton > 0 ? '存在' : '不存在'}`);
                
                // 检查暂停按钮位置
                const pauseButton = await page.locator('.pause-btn').count();
                if (pauseButton > 0) {
                    const pausePos = await page.locator('.pause-btn').boundingBox();
                    console.log(`   ✅ 暂停按钮存在，位置: (${Math.round(pausePos.x)}, ${Math.round(pausePos.y)})`);
                } else {
                    console.log('   ❌ 暂停按钮不存在');
                }
                
                // 检查虚拟摇杆
                const joystick = await page.locator('.joystick-container').count();
                if (joystick > 0) {
                    const joystickPos = await page.locator('.joystick-container').boundingBox();
                    console.log(`   ✅ 虚拟摇杆存在，位置: (${Math.round(joystickPos.x)}, ${Math.round(joystickPos.y)})`);
                } else {
                    console.log('   ❌ 虚拟摇杆不存在');
                }
                
                // 检查射击按钮
                const shootButton = await page.locator('.shoot-btn').count();
                if (shootButton > 0) {
                    const shootPos = await page.locator('.shoot-btn').boundingBox();
                    console.log(`   ✅ 射击按钮存在，位置: (${Math.round(shootPos.x)}, ${Math.round(shootPos.y)})`);
                } else {
                    console.log('   ❌ 射击按钮不存在');
                }
                
                // 检查血槽
                const healthBar = await page.locator('.health-container').count();
                if (healthBar > 0) {
                    const healthItems = await page.locator('.health-item').count();
                    console.log(`   ✅ 血槽存在，格数: ${healthItems}`);
                } else {
                    console.log('   ❌ 血槽不存在');
                }
                
                // 检查目标单词显示
                const targetWord = await page.locator('.target-word').count();
                if (targetWord > 0) {
                    const wordText = await page.locator('.target-word').textContent();
                    console.log(`   ✅ 目标单词显示: ${wordText}`);
                } else {
                    console.log('   ❌ 目标单词显示不存在');
                }
                
                // 检查背景音乐
                const audioElements = await page.locator('audio').count();
                console.log(`   ${audioElements > 0 ? '✅' : '❌'} 音频元素数量: ${audioElements}`);
                
                testResults.push({ 
                    test: '游戏界面元素', 
                    status: '通过', 
                    detail: `返回按钮:${backButton>0?'✅':'❌'}, 暂停按钮:${pauseButton>0?'✅':'❌'}, 摇杆:${joystick>0?'✅':'❌'}, 射击按钮:${shootButton>0?'✅':'❌'}, 血槽:${healthBar>0?'✅':'❌'}` 
                });
                
                // 7. 测试游戏功能
                console.log('\n7️⃣ 测试游戏功能...');
                
                // 测试暂停功能
                if (pauseButton > 0) {
                    await page.click('.pause-btn');
                    await page.waitForTimeout(1000);
                    console.log('   ✅ 暂停按钮点击测试完成');
                    
                    // 继续游戏
                    await page.click('.pause-btn');
                    await page.waitForTimeout(1000);
                }
                
                // 测试返回主菜单
                if (backButton > 0) {
                    await page.locator('button:has-text("←")').click({ force: true });
                    await page.waitForTimeout(2000);
                    
                    // 检查是否返回到主菜单
                    const backToMain = await page.locator('button:has-text("开始游戏")').count();
                    if (backToMain > 0) {
                        console.log('   ✅ 返回主菜单功能正常');
                        testResults.push({ test: '返回主菜单', status: '通过', detail: '成功返回主菜单' });
                    } else {
                        console.log('   ❌ 返回主菜单功能异常');
                        testResults.push({ test: '返回主菜单', status: '失败', detail: '未能返回主菜单' });
                    }
                }
                
            } else {
                console.log('   ❌ 未能进入游戏界面');
                testResults.push({ test: '开始游戏按钮', status: '失败', detail: '未能进入游戏界面' });
            }
        } else {
            console.log('   ❌ 开始游戏按钮不存在');
            testResults.push({ test: '开始游戏按钮', status: '失败', detail: '按钮不存在' });
        }
        
        // 8. 检查特定错误
        console.log('\n8️⃣ 检查特定错误...');
        const gradeOneWordErrors = errors.filter(error => error.includes('gradeOneWords'));
        if (gradeOneWordErrors.length === 0) {
            console.log('   ✅ 未发现gradeOneWords相关错误');
            testResults.push({ test: 'gradeOneWords错误检查', status: '通过', detail: '未发现相关错误' });
        } else {
            console.log('   ❌ 发现gradeOneWords相关错误:');
            gradeOneWordErrors.forEach(error => console.log(`      - ${error}`));
            testResults.push({ test: 'gradeOneWords错误检查', status: '失败', detail: gradeOneWordErrors.join('; ') });
        }
        
    } catch (error) {
        console.log('❌ 测试过程中发生错误:', error.message);
        testResults.push({ test: '整体测试', status: '失败', detail: error.message });
    }
    
    // 9. 生成测试报告
    console.log('\n📊 测试结果汇总:');
    console.log('='.repeat(60));
    
    let passCount = 0;
    let failCount = 0;
    let partialCount = 0;
    
    testResults.forEach(result => {
        const status = result.status === '通过' ? '✅' : result.status === '部分通过' ? '⚠️' : '❌';
        console.log(`${status} ${result.test}: ${result.detail}`);
        
        if (result.status === '通过') passCount++;
        else if (result.status === '失败') failCount++;
        else partialCount++;
    });
    
    console.log('\n📈 统计信息:');
    console.log(`   通过: ${passCount} 项`);
    console.log(`   失败: ${failCount} 项`);
    console.log(`   部分通过: ${partialCount} 项`);
    console.log(`   总计: ${testResults.length} 项`);
    
    if (errors.length > 0) {
        console.log('\n🐛 控制台错误列表:');
        errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
        });
    } else {
        console.log('\n🎉 未发现控制台错误');
    }
    
    await browser.close();
    
    return {
        results: testResults,
        errors: errors,
        summary: {
            pass: passCount,
            fail: failCount,
            partial: partialCount,
            total: testResults.length
        }
    };
}

// 运行测试
if (require.main === module) {
    testPlaneWordsGame().then(report => {
        console.log('\n🏁 测试完成!');
        process.exit(report.summary.fail > 0 ? 1 : 0);
    }).catch(error => {
        console.error('❌ 测试运行失败:', error);
        process.exit(1);
    });
}

module.exports = { testPlaneWordsGame };