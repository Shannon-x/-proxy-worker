// 这个脚本用于更新proxies.json文件中的时间戳
// 它会读取文件，更新每个代理的时间戳，然后写回文件

const fs = require('fs');
const path = require('path');

// 配置项
const PROXY_FILE_PATH = path.join(__dirname, 'public', 'proxies.json');
const BACKUP_FILE_PATH = path.join(__dirname, 'public', 'proxies.json.bak');

console.log('开始更新代理文件时间戳...');

// 创建备份
try {
  fs.copyFileSync(PROXY_FILE_PATH, BACKUP_FILE_PATH);
  console.log(`已创建备份文件: ${BACKUP_FILE_PATH}`);
} catch (error) {
  console.error('创建备份失败:', error);
  process.exit(1);
}

// 读取文件
let proxyData;
try {
  const fileContent = fs.readFileSync(PROXY_FILE_PATH, 'utf8');
  proxyData = JSON.parse(fileContent);
  console.log(`成功读取代理文件，包含 ${proxyData.length} 个代理`);
} catch (error) {
  console.error('读取或解析代理文件失败:', error);
  process.exit(1);
}

if (!Array.isArray(proxyData) || proxyData.length === 0) {
  console.error('代理数据无效或为空');
  process.exit(1);
}

// 更新时间戳
const now = new Date();
const isoTime = now.toISOString();
console.log(`将所有代理的时间戳更新为: ${isoTime}`);

let updatedCount = 0;
proxyData.forEach(proxy => {
  if (proxy && typeof proxy === 'object') {
    proxy.last_check = isoTime;
    updatedCount++;
  }
});

console.log(`已更新 ${updatedCount}/${proxyData.length} 个代理的时间戳`);

// 写回文件
try {
  fs.writeFileSync(PROXY_FILE_PATH, JSON.stringify(proxyData, null, 2), 'utf8');
  console.log(`成功写入更新后的代理文件: ${PROXY_FILE_PATH}`);
} catch (error) {
  console.error('写入更新后的代理文件失败:', error);
  process.exit(1);
}

console.log('代理时间戳更新完成！');
