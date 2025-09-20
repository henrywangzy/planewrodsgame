const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('🔍 重新测试：验证暂停按钮修复效果');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 360, height: 640 },
    args: ['--force-device-scale-factor=1']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 640, deviceScaleFactor: 1 });
  
  const filePath = path.resolve('index.html');
  await page.goto('file://' + filePath.replace(/\\/g, '/'));
  console.log('📱 游戏页面已加载，屏幕尺寸：360x640');
  
  // 点击开始游戏
  await page.click('#startBtn');
  await page.waitForTimeout(2000);
  console.log('🎮 已进入游戏界面');
  
  // 检查按钮位置
  const pauseBtn = await page.$('#mobilePauseBtn');
  if (pauseBtn) {
    const box = await pauseBtn.boundingBox();
    const screenWidth = 360;
    
    console.log('📍 暂停按钮修复后位置:');
    console.log('• 左边缘 (x):', Math.round(box.x));
    console.log('• 上边缘 (y):', Math.round(box.y));
    console.log('• 右边缘:', Math.round(box.x + box.width));
    console.log('• 中心点X:', Math.round(box.x + box.width/2));
    
    // 验证是否在右侧
    const isInRightSide = (box.x + box.width/2) > screenWidth/2;
    const distanceFromRightEdge = screenWidth - (box.x + box.width);
    
    if (isInRightSide && distanceFromRightEdge >= 15 && distanceFromRightEdge <= 25) {
      console.log('✅ 成功：暂停按钮现在在屏幕右侧！');
      console.log('✅ 距离右边缘:', Math.round(distanceFromRightEdge), 'px (符合20px预期)');
    } else {
      console.log('❌ 仍有问题：按钮位置不符合预期');
      console.log('• 在右侧?', isInRightSide);
      console.log('• 距右边缘:', Math.round(distanceFromRightEdge), 'px');
    }
    
    // 保存截图
    await page.screenshot({ path: 'pause-button-fixed.png' });
    console.log('📸 已保存修复后截图: pause-button-fixed.png');
    
  } else {
    console.log('❌ 未找到暂停按钮');
  }
  
  await page.waitForTimeout(3000);
  await browser.close();
  console.log('🔚 测试完成');
})();