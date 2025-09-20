/**
 * 飞机射击单词游戏全面测试脚本
 * 测试4个关键修复点的实现效果
 * 
 * 修复验证清单：
 * 1. 游戏速度修复 (50%降低)
 * 2. 暂停按钮位置修复 (移到右边)  
 * 3. 单词本排版优化 (左右边距5px)
 * 4. 首页按钮样式修复 (文字可见性)
 */

class GameFixesTestSuite {
    constructor() {
        this.testResults = {
            gameSpeed: { passed: false, details: [] },
            pauseButtonPosition: { passed: false, details: [] },
            vocabularyLayout: { passed: false, details: [] },
            buttonVisibility: { passed: false, details: [] }
        };
        this.isMobile = this.detectMobile();
        console.log(`🔧 测试环境: ${this.isMobile ? '移动端' : '桌面端'}`);
    }

    /**
     * 检测是否为移动设备
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    /**
     * 模拟Android手机环境
     */
    simulateMobileEnvironment() {
        // 修改User Agent
        Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
            configurable: true
        });

        // 模拟手机屏幕尺寸
        const originalWidth = window.innerWidth;
        const originalHeight = window.innerHeight;
        
        // 设置典型Android手机分辨率 (360x640)
        Object.defineProperty(window, 'innerWidth', { value: 360, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 640, configurable: true });
        Object.defineProperty(window.screen, 'width', { value: 360, configurable: true });
        Object.defineProperty(window.screen, 'height', { value: 640, configurable: true });

        console.log('📱 已切换到Android手机模式 (360x640)');
        
        // 触发resize事件
        window.dispatchEvent(new Event('resize'));

        return { originalWidth, originalHeight };
    }

    /**
     * 等待元素出现
     */
    async waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const checkElement = () => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`元素 ${selector} 未找到 (超时 ${timeout}ms)`));
                } else {
                    setTimeout(checkElement, 100);
                }
            };
            checkElement();
        });
    }

    /**
     * 测试1: 游戏速度修复验证
     */
    async testGameSpeed() {
        console.log('\n🎯 测试1: 游戏速度修复验证');
        
        try {
            // 等待游戏加载
            await this.waitForElement('canvas');
            
            // 检查游戏对象是否存在
            if (typeof window.game === 'undefined') {
                this.testResults.gameSpeed.details.push('❌ 游戏对象未找到');
                return false;
            }

            // 测试不同难度的速度设置
            const difficultyTests = [
                { difficulty: 'easy', expected: 0.6, original: 1.2 },
                { difficulty: 'medium', expected: 0.7, original: 1.4 },
                { difficulty: 'hard', expected: 0.85, original: 1.7 }
            ];

            let allSpeedsPassed = true;

            for (const test of difficultyTests) {
                // 模拟设置难度
                if (window.game && window.game.setDifficulty) {
                    window.game.setDifficulty(test.difficulty);
                }

                // 获取当前速度设置
                let currentSpeed = null;
                
                // 尝试多种方式获取速度
                if (window.game && window.game.getEnemySpeed) {
                    currentSpeed = window.game.getEnemySpeed();
                } else if (window.game && window.game.enemySpeed) {
                    currentSpeed = window.game.enemySpeed;
                } else {
                    // 尝试通过代码检查获取速度
                    const pageSource = document.documentElement.outerHTML;
                    const speedMatch = pageSource.match(new RegExp(`case '${test.difficulty}'.*return (\\d+\\.\\d+)`));
                    if (speedMatch) {
                        currentSpeed = parseFloat(speedMatch[1]);
                    }
                }

                const speedResult = `${test.difficulty}难度: ${currentSpeed} (期望: ${test.expected}, 原值: ${test.original})`;
                
                if (currentSpeed === test.expected) {
                    this.testResults.gameSpeed.details.push(`✅ ${speedResult} - 已正确降低50%`);
                } else {
                    this.testResults.gameSpeed.details.push(`❌ ${speedResult} - 速度不匹配`);
                    allSpeedsPassed = false;
                }
            }

            this.testResults.gameSpeed.passed = allSpeedsPassed;
            return allSpeedsPassed;

        } catch (error) {
            this.testResults.gameSpeed.details.push(`❌ 测试异常: ${error.message}`);
            return false;
        }
    }

    /**
     * 测试2: 暂停按钮位置修复验证
     */
    async testPauseButtonPosition() {
        console.log('\n⏸️ 测试2: 暂停按钮位置修复验证');
        
        try {
            // 等待游戏界面加载
            await this.waitForElement('.mobile-pause-button, .pause-button');
            
            const pauseButton = document.querySelector('.mobile-pause-button') || 
                              document.querySelector('.pause-button');
            
            if (!pauseButton) {
                this.testResults.pauseButtonPosition.details.push('❌ 暂停按钮未找到');
                return false;
            }

            const pauseRect = pauseButton.getBoundingClientRect();
            const pauseStyle = window.getComputedStyle(pauseButton);
            
            // 查找血量条或生命值显示元素
            const healthElements = document.querySelectorAll('.health-display, .lives-display, [class*="health"], [class*="life"]');
            let healthElement = null;
            
            for (const element of healthElements) {
                if (element.offsetWidth > 0 && element.offsetHeight > 0) {
                    healthElement = element;
                    break;
                }
            }

            let positionCorrect = false;
            
            if (healthElement) {
                const healthRect = healthElement.getBoundingClientRect();
                const rightAlignment = Math.abs(pauseRect.right - healthRect.right) < 10; // 允许10px误差
                const belowHealth = pauseRect.top > healthRect.bottom - 5; // 暂停按钮在血槽下方
                
                positionCorrect = rightAlignment && belowHealth;
                
                this.testResults.pauseButtonPosition.details.push(
                    `暂停按钮位置: right=${pauseRect.right}px, top=${pauseRect.top}px`
                );
                this.testResults.pauseButtonPosition.details.push(
                    `血量条位置: right=${healthRect.right}px, bottom=${healthRect.bottom}px`
                );
                this.testResults.pauseButtonPosition.details.push(
                    `右对齐检查: ${rightAlignment ? '✅' : '❌'} (差距: ${Math.abs(pauseRect.right - healthRect.right)}px)`
                );
                this.testResults.pauseButtonPosition.details.push(
                    `位置检查: ${belowHealth ? '✅' : '❌'} 暂停按钮在血槽下方`
                );
            } else {
                // 检查CSS样式是否正确设置为右对齐
                const rightValue = pauseStyle.right;
                const rightAligned = rightValue && rightValue !== 'auto' && !rightValue.includes('left');
                
                positionCorrect = rightAligned;
                
                this.testResults.pauseButtonPosition.details.push(
                    `CSS right属性: ${rightValue} ${rightAligned ? '✅' : '❌'}`
                );
                this.testResults.pauseButtonPosition.details.push('⚠️ 血量条元素未找到，仅检查CSS设置');
            }

            this.testResults.pauseButtonPosition.passed = positionCorrect;
            return positionCorrect;

        } catch (error) {
            this.testResults.pauseButtonPosition.details.push(`❌ 测试异常: ${error.message}`);
            return false;
        }
    }

    /**
     * 测试3: 单词本排版优化验证
     */
    async testVocabularyLayout() {
        console.log('\n📚 测试3: 单词本排版优化验证');
        
        try {
            // 先尝试打开单词本
            const vocabularyButton = document.querySelector('button[onclick*="vocabulary"], button[onclick*="单词本"], [class*="vocabulary"]');
            if (vocabularyButton) {
                vocabularyButton.click();
                await new Promise(resolve => setTimeout(resolve, 500)); // 等待界面切换
            }

            // 查找单词本容器
            const vocabularyContainer = document.querySelector('.vocabulary-container, .vocabulary-content, [class*="vocabulary"]');
            
            if (!vocabularyContainer) {
                this.testResults.vocabularyLayout.details.push('❌ 单词本容器未找到');
                return false;
            }

            const containerStyle = window.getComputedStyle(vocabularyContainer);
            const padding = containerStyle.padding;
            const paddingLeft = containerStyle.paddingLeft;
            const paddingRight = containerStyle.paddingRight;
            const paddingTop = containerStyle.paddingTop;
            const paddingBottom = containerStyle.paddingBottom;

            this.testResults.vocabularyLayout.details.push(`容器padding: ${padding}`);
            this.testResults.vocabularyLayout.details.push(`左边距: ${paddingLeft}`);
            this.testResults.vocabularyLayout.details.push(`右边距: ${paddingRight}`);
            
            // 检查左右边距是否为5px
            const leftCorrect = paddingLeft === '5px';
            const rightCorrect = paddingRight === '5px';
            
            // 检查上下边距 (桌面20px，移动15px)
            const expectedVertical = this.isMobile ? '15px' : '20px';
            const verticalCorrect = paddingTop === expectedVertical && paddingBottom === expectedVertical;

            const layoutCorrect = leftCorrect && rightCorrect && verticalCorrect;

            this.testResults.vocabularyLayout.details.push(
                `左右边距检查: ${leftCorrect && rightCorrect ? '✅' : '❌'} (期望: 5px)`
            );
            this.testResults.vocabularyLayout.details.push(
                `上下边距检查: ${verticalCorrect ? '✅' : '❌'} (期望: ${expectedVertical})`
            );

            this.testResults.vocabularyLayout.passed = layoutCorrect;
            return layoutCorrect;

        } catch (error) {
            this.testResults.vocabularyLayout.details.push(`❌ 测试异常: ${error.message}`);
            return false;
        }
    }

    /**
     * 测试4: 首页按钮样式修复验证
     */
    async testButtonVisibility() {
        console.log('\n🔘 测试4: 首页按钮样式修复验证');
        
        try {
            // 查找主要按钮
            const buttons = document.querySelectorAll('button, .button, .btn');
            let testedButtons = 0;
            let passedButtons = 0;

            for (const button of buttons) {
                // 跳过隐藏或不可见的按钮
                if (button.offsetWidth === 0 || button.offsetHeight === 0) continue;
                
                const buttonStyle = window.getComputedStyle(button);
                const buttonText = button.textContent.trim();
                
                if (!buttonText) continue; // 跳过空文本按钮
                
                testedButtons++;
                
                // 检查文字颜色
                const color = buttonStyle.color;
                const hasWhiteColor = color === 'rgb(255, 255, 255)' || 
                                    color === 'white' || 
                                    color === '#ffffff' ||
                                    color === '#fff';
                
                // 检查文字阴影
                const textShadow = buttonStyle.textShadow;
                const hasTextShadow = textShadow && textShadow !== 'none';
                
                // 检查字体粗细
                const fontWeight = buttonStyle.fontWeight;
                const hasBoldFont = parseInt(fontWeight) >= 600 || fontWeight === 'bold';
                
                const visibility = {
                    color: hasWhiteColor,
                    shadow: hasTextShadow,
                    weight: hasBoldFont
                };
                
                const buttonPassed = visibility.color && (visibility.shadow || visibility.weight);
                
                this.testResults.buttonVisibility.details.push(
                    `按钮"${buttonText}": 颜色${visibility.color ? '✅' : '❌'} 阴影${visibility.shadow ? '✅' : '❌'} 粗体${visibility.weight ? '✅' : '❌'} ${buttonPassed ? '通过' : '失败'}`
                );
                
                if (buttonPassed) passedButtons++;
            }

            const overallPassed = testedButtons > 0 && passedButtons / testedButtons >= 0.8; // 80%按钮通过即认为成功
            
            this.testResults.buttonVisibility.details.push(
                `总结: ${passedButtons}/${testedButtons} 按钮通过可见性测试 (${(passedButtons/testedButtons*100).toFixed(1)}%)`
            );

            this.testResults.buttonVisibility.passed = overallPassed;
            return overallPassed;

        } catch (error) {
            this.testResults.buttonVisibility.details.push(`❌ 测试异常: ${error.message}`);
            return false;
        }
    }

    /**
     * 触摸兼容性测试
     */
    async testTouchCompatibility() {
        console.log('\n👆 附加测试: 触摸兼容性验证');
        
        const touchResults = [];
        
        try {
            // 检查触摸事件支持
            const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            touchResults.push(`触摸支持: ${hasTouchSupport ? '✅' : '❌'}`);
            
            // 检查触摸目标大小
            const touchTargets = document.querySelectorAll('.touch-target, button, .button');
            let adequateSizeCount = 0;
            
            for (const target of touchTargets) {
                const rect = target.getBoundingClientRect();
                const adequateSize = rect.width >= 44 && rect.height >= 44; // Apple建议最小44px
                if (adequateSize) adequateSizeCount++;
                
                if (rect.width > 0 && rect.height > 0) { // 只记录可见元素
                    touchResults.push(`触摸目标 "${target.textContent?.trim() || target.className}": ${rect.width}×${rect.height}px ${adequateSize ? '✅' : '❌'}`);
                }
            }
            
            // 检查防误触设置
            const preventDefaultElements = document.querySelectorAll('[style*="touch-action"], .prevent-default');
            touchResults.push(`防误触设置: ${preventDefaultElements.length > 0 ? '✅' : '⚠️'} (${preventDefaultElements.length}个元素)`);
            
            return touchResults;
            
        } catch (error) {
            touchResults.push(`❌ 触摸兼容性测试异常: ${error.message}`);
            return touchResults;
        }
    }

    /**
     * 执行完整测试套件
     */
    async runAllTests() {
        console.log('🚀 开始执行飞机射击单词游戏修复验证测试\n');
        console.log('=' .repeat(60));
        
        // 模拟移动环境
        const originalDimensions = this.simulateMobileEnvironment();
        
        // 等待页面稳定
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
            // 执行各项测试
            const results = {
                gameSpeed: await this.testGameSpeed(),
                pauseButtonPosition: await this.testPauseButtonPosition(), 
                vocabularyLayout: await this.testVocabularyLayout(),
                buttonVisibility: await this.testButtonVisibility()
            };
            
            // 附加测试
            const touchResults = await this.testTouchCompatibility();
            
            // 生成测试报告
            this.generateTestReport(results, touchResults);
            
        } catch (error) {
            console.error('❌ 测试执行失败:', error);
        } finally {
            // 恢复原始窗口尺寸
            Object.defineProperty(window, 'innerWidth', { value: originalDimensions.originalWidth, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: originalDimensions.originalHeight, configurable: true });
        }
    }

    /**
     * 生成详细测试报告
     */
    generateTestReport(results, touchResults) {
        console.log('\n' + '=' .repeat(60));
        console.log('📊 测试报告 - 飞机射击单词游戏修复验证');
        console.log('=' .repeat(60));
        
        const testItems = [
            { name: '游戏速度修复', key: 'gameSpeed', icon: '🎯' },
            { name: '暂停按钮位置', key: 'pauseButtonPosition', icon: '⏸️' },
            { name: '单词本排版优化', key: 'vocabularyLayout', icon: '📚' },
            { name: '按钮文字可见性', key: 'buttonVisibility', icon: '🔘' }
        ];
        
        let totalPassed = 0;
        
        testItems.forEach(item => {
            const result = this.testResults[item.key];
            const status = result.passed ? '✅ 通过' : '❌ 失败';
            console.log(`\n${item.icon} ${item.name}: ${status}`);
            
            result.details.forEach(detail => {
                console.log(`   ${detail}`);
            });
            
            if (result.passed) totalPassed++;
        });
        
        // 触摸兼容性结果
        if (touchResults.length > 0) {
            console.log('\n👆 触摸兼容性测试:');
            touchResults.forEach(result => {
                console.log(`   ${result}`);
            });
        }
        
        // 总结
        console.log('\n' + '=' .repeat(60));
        console.log(`🎉 测试完成: ${totalPassed}/4 项修复验证通过 (${(totalPassed/4*100).toFixed(1)}%)`);
        
        if (totalPassed === 4) {
            console.log('🎊 恭喜！所有修复都已正确实现！');
        } else {
            console.log('⚠️ 部分修复需要进一步检查和调整');
        }
        
        console.log('=' .repeat(60));
        
        // 返回测试结果供进一步处理
        return {
            summary: {
                total: 4,
                passed: totalPassed,
                percentage: (totalPassed/4*100).toFixed(1)
            },
            details: this.testResults,
            touchCompatibility: touchResults
        };
    }
}

// 自动执行测试 (当页面加载完成后)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const testSuite = new GameFixesTestSuite();
            testSuite.runAllTests();
        }, 2000); // 等待2秒确保游戏完全加载
    });
} else {
    // 页面已经加载完成，直接执行
    setTimeout(() => {
        const testSuite = new GameFixesTestSuite();
        testSuite.runAllTests();
    }, 1000);
}

// 导出测试类供手动调用
window.GameFixesTestSuite = GameFixesTestSuite;

console.log('🧪 测试脚本已加载，将在页面准备就绪后自动执行...');
console.log('💡 也可以手动执行: new GameFixesTestSuite().runAllTests()');