import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

// 一个简单的静态资源处理函数，在KV绑定失败时使用
async function serveStaticAsset(request, env) {
  const url = new URL(request.url);
  let path = url.pathname;
  
  // 默认到index.html
  if (path === '/' || path === '') {
    path = '/index.html';
  }
  
  // 静态资源映射
  const contentTypeMap = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
  };
  
  // 获取扩展名对应的Content-Type
  const ext = path.includes('.') ? path.substring(path.lastIndexOf('.')) : '';
  const contentType = contentTypeMap[ext] || 'text/plain';
  
  try {
    // 如果是常见请求，返回预定义的响应
    if (path === '/index.html' || path === '/') {
      // index.html内容 - 增强版
      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>有效代理列表</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <style>
        /* 刷新按钮旋转动画 */
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .bi-arrow-clockwise-spin {
            animation: spin 1s linear infinite;
        }
        
        /* 代理表格颜色和样式 */
        .table-success {
            --bs-table-bg: rgba(209, 231, 221, 0.7);
        }
        .table-secondary {
            --bs-table-bg: rgba(233, 236, 239, 0.5);
        }
        .table-warning {
            --bs-table-bg: rgba(255, 243, 205, 0.7);
        }
        
        /* 自动刷新开关样式 */
        .form-switch {
            padding-left: 2.5em;
        }
        .form-check-input {
            cursor: pointer;
        }
        
        /* 额外的视觉增强 */
        .proxy-recent {
            font-weight: bold;
        }
        .proxy-outdated {
            opacity: 0.7;
        }
        .region-missing {
            font-style: italic;
            color: #dc3545;
        }
    </style>
</head>
<body>
<div class="container mt-5">
    <h1 class="mb-4">有效代理列表</h1>
    
    <!-- 刷新和信息区域 -->
    <div id="status-message" class="alert alert-info">
        正在加载代理数据，请稍候...
    </div>
    
    <div class="mb-3 d-flex justify-content-between align-items-center">
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="auto-refresh-toggle" checked>
        <label class="form-check-label auto-refresh-status" for="auto-refresh-toggle">
          （自动每30秒刷新一次）
        </label>
      </div>
      <button id="refresh-btn" class="btn btn-outline-primary">
        <i class="bi bi-arrow-clockwise"></i> 立即刷新
      </button>
    </div>
    
    <!-- 筛选和导出控件 -->
    <div class="row mb-3">
      <div class="col">
        <input type="text" id="search-input" placeholder="搜索 IP 或 地区" class="form-control" />
      </div>
      <div class="col">
        <select id="filter-region" class="form-select">
          <option value="">全部地区</option>
        </select>
      </div>
      <div class="col">
        <select id="filter-type" class="form-select">
          <option value="">全部类型</option>
        </select>
      </div>
      <div class="col-auto">
        <button id="export-btn" class="btn btn-primary">导出CSV</button>
      </div>
    </div>
    
    <table class="table table-striped" id="proxy-table">
        <thead>
            <tr>
                <th>IP</th>
                <th>端口</th>
                <th>类型</th>
                <th>HTTPS</th>
                <th>地区</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
    
    <!-- 分页控件 -->
    <nav>
        <ul class="pagination justify-content-center" id="pagination"></ul>
    </nav>
    
    <!-- 颜色图例 -->
    <div class="row mt-4">
        <div class="col-12">
            <p class="text-muted small">颜色图例：</p>
            <div class="d-flex flex-wrap">
                <div class="me-3 mb-2">
                    <span class="badge bg-success">绿色</span> - HTTPS支持
                </div>
                <div class="me-3 mb-2">
                    <span class="badge bg-secondary">灰色</span> - HTTPS不支持
                </div>
                <div class="me-3 mb-2">
                    <span class="badge bg-warning text-dark">黄色</span> - 未验证代理
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// 嵌入的JavaScript代码
let proxies = [];
let filtered = [];
let currentPage = 1;
const pageSize = 20;

// 全局变量，用于跟踪自动刷新状态
let autoRefreshInterval = null;
const AUTO_REFRESH_SECONDS = 30;

// 异步加载代理数据
async function loadProxies() {
    const statusElem = document.getElementById('status-message');
    if (statusElem) {
        statusElem.textContent = '正在刷新代理数据...';
        statusElem.style.backgroundColor = '#f8f9fa';
    }
    
    try {
        // 强制破坏缓存
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        const cacheBuster = '?nocache=' + timestamp + '&rand=' + random;
        console.log(`正在获取代理数据，请求URL: /proxies.json${cacheBuster}，时间: ${new Date().toLocaleTimeString()}`);
        
        const response = await fetch('/proxies.json' + cacheBuster, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            cache: 'no-store' // 告诉浏览器不要缓存
        });
        
        console.log('获取代理数据请求完成, 时间: ' + new Date().toLocaleTimeString() + ', 状态: ' + response.status);
        
        if (!response.ok) {
            throw new Error('HTTP 错误: ' + response.status);
        }
        
        const data = await response.json();
        if (data && typeof data === 'object' && data.error) {
            throw new Error(data.message || data.error || '未知错误');
        }
        
        proxies = Array.isArray(data) ? data : [];
        
        // 统计信息计算
        const validatedCount = proxies.filter(p => p && p.validated === true).length;
        const withRegionCount = proxies.filter(p => 
            p && p.region && p.region !== '未知' && p.region !== '未检测' && p.region !== ''
        ).length;
        
        // 按验证状态和时间排序
        proxies.sort((a, b) => {
            if ((a.validated === true) && (b.validated !== true)) return -1;
            if ((a.validated !== true) && (b.validated === true)) return 1;
            
            const timeA = a.last_check ? new Date(a.last_check).getTime() : 0;
            const timeB = b.last_check ? new Date(b.last_check).getTime() : 0;
            return timeB - timeA;
        });
        
        filtered = proxies;
        
        if (statusElem) {
            if (proxies.length === 0) {
                statusElem.textContent = '当前没有代理数据，系统正在采集中，请稍后刷新页面';
                statusElem.style.backgroundColor = '#fff3cd';
                return true;
            }
            
            // 显示最后更新时间和统计
            let lastUpdateTime = '未知';
            if (proxies[0] && proxies[0].last_check) {
                try {
                    const lastCheckStr = proxies[0].last_check;
                    console.log('收到的时间戳原始值:', lastCheckStr);
                    
                    // 确保是有效的ISO格式时间字符串
                    const lastCheckDate = new Date(lastCheckStr);
                    
                    // 检查是否是有效日期
                    if (isNaN(lastCheckDate.getTime())) {
                        throw new Error('无效的日期时间格式');
                    }
                    
                    // 格式化为本地时间字符串
                    lastUpdateTime = lastCheckDate.toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: false
                    });
                    
                    console.log('代理更新时间解析成功: ' + lastCheckStr + ' => ' + lastUpdateTime);
                } catch (e) {
                    console.error('解析时间戳错误:', e);
                    lastUpdateTime = String(proxies[0].last_check);
                }
            }
                
            statusElem.innerHTML = '<div>已加载 <b>' + proxies.length + '</b> 个代理 (最后更新: <b>' + lastUpdateTime + '</b>)</div>' +
                '<div class="small mt-1">已验证: ' + validatedCount + ' 个 | 有地区信息: ' + withRegionCount + ' 个</div>';
            statusElem.style.backgroundColor = '#d1e7dd';
        }
        
        populateFilters();
        currentPage = 1;
        renderTable();
        renderPagination();
        return true;
    } catch (err) {
        console.error('加载代理失败:', err);
        if (statusElem) {
            statusElem.textContent = \`加载代理失败: \${err.message}，请刷新页面重试\`;
            statusElem.style.backgroundColor = '#f8d7da';
        }
        return false;
    }
}    // 渲染表格内容
    function renderTable() {
        const tbody = document.querySelector('#proxy-table tbody');
        tbody.innerHTML = '';
        const start = (currentPage - 1) * pageSize;
        const pageData = filtered.slice(start, start + pageSize);
        
        if (pageData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">暂无数据</td></tr>';
            return;
        }
        
        pageData.forEach(p => {
            // 格式化地区显示 - 如果格式是 "国家/省/市"，只显示 "国家/省"
            let regionDisplay = p.region || '-';
            if (regionDisplay.includes('/')) {
                const parts = regionDisplay.split('/');
                if (parts.length >= 2) {
                    regionDisplay = parts[0] + '/' + parts[1];
                }
            }
        
        // 添加样式，着色显示
        const tr = document.createElement('tr');
        
        // 根据验证状态添加样式
        if (p.validated !== true) {
            tr.classList.add('table-warning'); // 未验证的代理使用警告色
        }
        // 根据HTTPS支持情况添加样式类
        else if (p.https === '支持') {
            tr.classList.add('table-success');  // 绿色 - HTTPS支持
        } else if (p.https === '不支持') {
            tr.classList.add('table-secondary'); // 灰色 - HTTPS不支持
        }
        
        // 判断上次检查时间是否在24小时内
        const now = new Date();
        const lastCheck = p.last_check ? new Date(p.last_check) : null;
        const isRecent = lastCheck && (now - lastCheck < 24 * 60 * 60 * 1000);
        
        // 判断是否有地区信息
        const hasRegion = p.region && p.region !== '未知' && p.region !== '未检测' && p.region !== '';            // 创建单元格内容
            tr.innerHTML = '<td>' + p.ip + '</td>' +
                '<td>' + p.port + '</td>' +
                '<td>' + (p.type || '-') + '</td>' +
                '<td>' + (p.https || '-') + '</td>' +
                '<td class="' + (hasRegion ? 'text-success' : 'text-muted') + '">' +
                    regionDisplay +
                    ((!hasRegion) ? '<small>(需更新)</small>' : '') +
                '</td>';
        
        // 如果不是最近验证的代理，添加淡色样式
        if (!isRecent) {
            tr.style.opacity = '0.7';
        }
        
        tbody.appendChild(tr);
    });
}    // 生成分页控件
    function renderPagination() {
        const totalPages = Math.ceil(filtered.length / pageSize);
        const ul = document.getElementById('pagination');
        ul.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = 'page-item' + (i === currentPage ? ' active' : '');
            li.innerHTML = '<a class="page-link" href="#">' + i + '</a>';
            li.addEventListener('click', e => {
                e.preventDefault();
                currentPage = i;
                renderTable();
                renderPagination();
            });
            ul.appendChild(li);
        }
    }

// 填充筛选下拉框
function populateFilters() {
    const regionSet = new Set();
    const typeSet = new Set();
    proxies.forEach(p => {
        if (p.region) regionSet.add(p.region);
        if (p.type) typeSet.add(p.type);
    });
    
    const regionSelect = document.getElementById('filter-region');
    const typeSelect = document.getElementById('filter-type');
    
    // 保留第一个"全部"选项
    regionSelect.innerHTML = '<option value="">全部地区</option>';
    typeSelect.innerHTML = '<option value="">全部类型</option>';
    
    Array.from(regionSet).sort().forEach(r => {
        const opt = document.createElement('option'); 
        opt.value = r; 
        opt.textContent = r;
        regionSelect.appendChild(opt);
    });
    
    Array.from(typeSet).sort().forEach(t => {
        const opt = document.createElement('option'); 
        opt.value = t; 
        opt.textContent = t;
        typeSelect.appendChild(opt);
    });
}

// 应用筛选
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    const regionVal = document.getElementById('filter-region').value;
    const typeVal = document.getElementById('filter-type').value;
    
    filtered = proxies.filter(p => {
        const matchSearch = !searchTerm || 
            p.ip.toLowerCase().includes(searchTerm) || 
            (p.region && p.region.toLowerCase().includes(searchTerm));
        const matchRegion = !regionVal || p.region === regionVal;
        const matchType = !typeVal || p.type === typeVal;
        return matchSearch && matchRegion && matchType;
    });
    
    currentPage = 1;
    renderTable();
    renderPagination();
}

// CSV 导出功能
function exportCSV() {
    const headers = ['IP', '端口', '类型', 'HTTPS', '地区'];
    const rows = [headers].concat(
        filtered.map(p => [p.ip, p.port, p.type, p.https, p.region])
    );
    const csvContent = rows.map(r => r.map(field => '"' + (field || '') + '"').join(',')).join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', "proxies_" + Date.now() + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 启动或重置自动刷新计时器
function startAutoRefresh() {
    // 清除现有计时器
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    // 设置新计时器
    autoRefreshInterval = setInterval(() => {
        const now = new Date();
        console.log("自动刷新触发 (" + now.toLocaleTimeString() + ")");
        loadProxies().then(success => {
            console.log("自动刷新完成，结果: " + (success ? "成功" : "失败") + ", 时间: " + new Date().toLocaleTimeString());
        }).catch(err => {
            console.error("自动刷新出错:", err);
        });
    }, AUTO_REFRESH_SECONDS * 1000);
    
    // 更新UI提示
    const autoRefreshSpan = document.querySelector('.auto-refresh-status');
    if (autoRefreshSpan) {
        autoRefreshSpan.textContent = "（自动每" + AUTO_REFRESH_SECONDS + "秒刷新一次）";
    }
}

// 停止自动刷新
function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
    
    // 更新UI提示
    const autoRefreshSpan = document.querySelector('.auto-refresh-status');
    if (autoRefreshSpan) {
        autoRefreshSpan.textContent = '（自动刷新已暂停）';
    }
}

// 添加事件监听器
document.addEventListener('DOMContentLoaded', () => {
    // 初始加载代理数据
    loadProxies().then(() => {
        // 初始加载成功后启动自动刷新
        startAutoRefresh();
    });
    
    // 绑定筛选相关事件
    document.getElementById('search-input').addEventListener('input', applyFilters);
    document.getElementById('filter-region').addEventListener('change', applyFilters);
    document.getElementById('filter-type').addEventListener('change', applyFilters);
    document.getElementById('export-btn').addEventListener('click', exportCSV);
    
    // 手动刷新按钮事件
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            // 旋转刷新图标
            const icon = refreshBtn.querySelector('i');
            icon.classList.add('bi-arrow-clockwise-spin');
            refreshBtn.disabled = true;
            
            // 手动刷新
            loadProxies().finally(() => {
                icon.classList.remove('bi-arrow-clockwise-spin');
                refreshBtn.disabled = false;
                
                // 重置自动刷新计时器
                if (document.getElementById('auto-refresh-toggle').checked) {
                    startAutoRefresh();
                }
            });
        });
    }
    
    // 自动刷新开关
    const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
    if (autoRefreshToggle) {
        autoRefreshToggle.addEventListener('change', function() {
            if (this.checked) {
                startAutoRefresh();
            } else {
                stopAutoRefresh();
            }
        });
    }
});
</script>
</body>
</html>`;
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        }
      });
    }
    
    if (path === '/static/js/main.js') {
      // 返回一个简化版的JS代码
      const js = `let proxies = [];
let filtered = [];
let currentPage = 1;
const pageSize = 20;

async function loadProxies() {
    try {
        const response = await fetch('/proxies.json');
        const data = await response.json();
        if (data.error) {
            alert('加载代理失败: ' + (data.message || data.error));
            return;
        }
        
        proxies = Array.isArray(data) ? data : [];
        filtered = proxies;
        renderTable();
    } catch (err) {
        console.error('加载代理失败:', err);
    }
}

function renderTable() {
    const tbody = document.querySelector('#proxy-table tbody');
    tbody.innerHTML = '';
    const start = (currentPage - 1) * pageSize;
    const pageData = filtered.slice(start, start + pageSize);
    
    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">暂无数据</td></tr>';
        return;
    }
    
    pageData.forEach(p => {
        const tr = document.createElement('tr');
        // 格式化地区显示 - 如果格式是 "国家/省/市"，只显示 "国家/省"
        let regionDisplay = p.region || '-';
        if (regionDisplay.includes('/')) {
            const parts = regionDisplay.split('/');
            if (parts.length >= 2) {
                regionDisplay = parts[0] + '/' + parts[1];
            }
        }
        
        // 判断是否有地区信息
        const hasRegion = p.region && p.region !== '未知' && p.region !== '未检测' && p.region !== '';
        
        // 判断上次检查时间是否在24小时内
        const now = new Date();
        const lastCheck = p.last_check ? new Date(p.last_check) : null;
        const isRecent = lastCheck && (now - lastCheck < 24 * 60 * 60 * 1000);
        
        tr.innerHTML = 
            '<td>' + p.ip + '</td>' +
            '<td>' + p.port + '</td>' +
            '<td>' + (p.type || '-') + '</td>' +
            '<td>' + (p.https || '-') + '</td>' +
            '<td class="' + (hasRegion ? 'text-success' : 'text-muted') + '">' +
                regionDisplay +
                ((!hasRegion) ? '<small>(需更新)</small>' : '') +
            '</td>';
        
        // 如果不是最近验证的代理，添加淡色样式
        if (!isRecent) {
            tr.style.opacity = '0.7';
        }
        
        tbody.appendChild(tr);
    });
}

function renderPagination() {
    const totalPages = Math.ceil(filtered.length / pageSize);
    const ul = document.getElementById('pagination');
    ul.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = 'page-item' + (i === currentPage ? ' active' : '');
        li.innerHTML = '<a class="page-link" href="#">' + i + '</a>';
        li.addEventListener('click', e => {
            e.preventDefault();
            currentPage = i;
            renderTable();
            renderPagination();
        });
        ul.appendChild(li);
    }
}

// 填充筛选下拉框
function populateFilters() {
    const regionSet = new Set();
    const typeSet = new Set();
    proxies.forEach(p => {
        if (p.region) regionSet.add(p.region);
        if (p.type) typeSet.add(p.type);
    });
    
    const regionSelect = document.getElementById('filter-region');
    const typeSelect = document.getElementById('filter-type');
    
    // 保留第一个"全部"选项
    regionSelect.innerHTML = '<option value="">全部地区</option>';
    typeSelect.innerHTML = '<option value="">全部类型</option>';
    
    Array.from(regionSet).sort().forEach(r => {
        const opt = document.createElement('option'); 
        opt.value = r; 
        opt.textContent = r;
        regionSelect.appendChild(opt);
    });
    
    Array.from(typeSet).sort().forEach(t => {
        const opt = document.createElement('option'); 
        opt.value = t; 
        opt.textContent = t;
        typeSelect.appendChild(opt);
    });
}

// 应用筛选
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    const regionVal = document.getElementById('filter-region').value;
    const typeVal = document.getElementById('filter-type').value;
    
    filtered = proxies.filter(p => {
        const matchSearch = !searchTerm || 
            p.ip.toLowerCase().includes(searchTerm) || 
            (p.region && p.region.toLowerCase().includes(searchTerm));
        const matchRegion = !regionVal || p.region === regionVal;
        const matchType = !typeVal || p.type === typeVal;
        return matchSearch && matchRegion && matchType;
    });
    
    currentPage = 1;
    renderTable();
    renderPagination();
}

// CSV 导出功能
function exportCSV() {
    const headers = ['IP', '端口', '类型', 'HTTPS', '地区'];
    const rows = [headers].concat(
        filtered.map(p => [p.ip, p.port, p.type, p.https, p.region])
    );
    const csvContent = rows.map(r => r.map(field => '"' + (field || '') + '"').join(',')).join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', "proxies_" + Date.now() + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 启动或重置自动刷新计时器
function startAutoRefresh() {
    // 清除现有计时器
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    // 设置新计时器
    autoRefreshInterval = setInterval(() => {
        const now = new Date();
        console.log("自动刷新触发 (" + now.toLocaleTimeString() + ")");
        loadProxies().then(success => {
            console.log("自动刷新完成，结果: " + (success ? "成功" : "失败") + ", 时间: " + new Date().toLocaleTimeString());
        }).catch(err => {
            console.error("自动刷新出错:", err);
        });
    }, AUTO_REFRESH_SECONDS * 1000);
    
    // 更新UI提示
    const autoRefreshSpan = document.querySelector('.auto-refresh-status');
    if (autoRefreshSpan) {
        autoRefreshSpan.textContent = "（自动每" + AUTO_REFRESH_SECONDS + "秒刷新一次）";
    }
}

// 停止自动刷新
function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
    
    // 更新UI提示
    const autoRefreshSpan = document.querySelector('.auto-refresh-status');
    if (autoRefreshSpan) {
        autoRefreshSpan.textContent = '（自动刷新已暂停）';
    }
}

// 添加事件监听器
document.addEventListener('DOMContentLoaded', () => {
    // 初始加载代理数据
    loadProxies().then(() => {
        // 初始加载成功后启动自动刷新
        startAutoRefresh();
    });
    
    // 绑定筛选相关事件
    document.getElementById('search-input').addEventListener('input', applyFilters);
    document.getElementById('filter-region').addEventListener('change', applyFilters);
    document.getElementById('filter-type').addEventListener('change', applyFilters);
    document.getElementById('export-btn').addEventListener('click', exportCSV);
    
    // 手动刷新按钮事件
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            // 旋转刷新图标
            const icon = refreshBtn.querySelector('i');
            icon.classList.add('bi-arrow-clockwise-spin');
            refreshBtn.disabled = true;
            
            // 手动刷新
            loadProxies().finally(() => {
                icon.classList.remove('bi-arrow-clockwise-spin');
                refreshBtn.disabled = false;
                
                // 重置自动刷新计时器
                if (document.getElementById('auto-refresh-toggle').checked) {
                    startAutoRefresh();
                }
            });
        });
    }
    
    // 自动刷新开关
    const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
    if (autoRefreshToggle) {
        autoRefreshToggle.addEventListener('change', function() {
            if (this.checked) {
                startAutoRefresh();
            } else {
                stopAutoRefresh();
            }
        });
    }
});
</script>
</body>
</html>`;
      return new Response(js, {
        headers: { 'Content-Type': 'application/javascript' }
      });
    }
    
    // 对于其他文件，返回404
    return new Response('Not Found', { status: 404 });
  } catch (e) {
    return new Response(`静态资源错误: ${e.message}`, { status: 500 });
  }
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // 处理favicon.ico请求
      if (url.pathname === '/favicon.ico') {
        return new Response(null, { status: 204 });
      }
      
      // JSON 数据接口
      if (url.pathname === '/proxies.json') {
        try {
          // 确保 proxyworker KV 命名空间存在并正确绑定
          if (!env.proxyworker) {
            console.error('proxyworker KV 命名空间未绑定!');
            return new Response(JSON.stringify({ 
              error: 'KV存储未配置', 
              message: '系统暂时无法提供代理数据' 
            }), {
              status: 503,
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
              }
            });
          }
          
          // 尝试从KV获取数据
          try {
            const data = await env.proxyworker.get('list');
            return new Response(data || '[]', {
              headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Access-Control-Allow-Origin': '*'
              }
            });
          } catch (kvError) {
            console.error('从KV读取数据失败:', kvError);
            return new Response(JSON.stringify({ 
              error: 'KV读取失败', 
              message: '无法从KV存储读取数据: ' + kvError.message 
            }), {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            });
          }
        } catch (err) {
          console.error('获取代理数据出错:', err);
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }
      
      // 尝试使用getAssetFromKV获取资源
      try {
        // 首先尝试标准方式获取
        return await getAssetFromKV(
          {
            request,
            waitUntil: ctx.waitUntil.bind(ctx),
            env
          },
          {
            mapRequestToAsset: (req) => {
              const parsedUrl = new URL(req.url);
              if (parsedUrl.pathname === '/') {
                parsedUrl.pathname = '/index.html';
              }
              return new Request(parsedUrl.toString(), req);
            }
          }
        );
      } catch (e) {
        console.log('getAssetFromKV失败:', e);
        
        // 尝试使用明确的KV命名空间
        try {
          if (env.__STATIC_CONTENT) {
            return await getAssetFromKV(
              {
                request,
                waitUntil: ctx.waitUntil.bind(ctx),
                env: { __STATIC_CONTENT: env.__STATIC_CONTENT }
              }, 
              {
                mapRequestToAsset: (req) => {
                  const parsedUrl = new URL(req.url);
                  if (parsedUrl.pathname === '/') {
                    parsedUrl.pathname = '/index.html';
                  }
                  return new Request(parsedUrl.toString(), req);
                }
              }
            );
          }
        } catch (e2) {
          console.log('第二次getAssetFromKV失败:', e2);
        }
        
        // 最后使用备用方法
        return await serveStaticAsset(request, env);
      }
    } catch (e) {
      console.error('Worker全局错误:', e);
      return new Response(`服务错误: ${e.message}`, { 
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  },

  async scheduled(event, env, ctx) {
    console.log('开始执行定时任务：获取代理列表 (触发时间: ' + new Date().toISOString() + ')');
    try {
      await fetchAndStore(env);
      console.log('定时任务执行完成');
    } catch(e) {
      console.error('定时任务执行失败:', e);
    }
  }
};

// 从本地 proxies.json 文件或备用API获取代理列表并存入 KV
async function fetchAndStore(env) {
  try {
    // 首先检查 KV 绑定是否存在
    if (!env.proxyworker) {
      console.error('无法执行定时任务：proxyworker KV 命名空间未绑定!');
      return;
    }
    
    console.log('开始读取最新代理数据，时间: ' + new Date().toISOString());
    
    // 获取代理数据的优先级：
    // 1. 当前Worker域名下的proxies.json（动态更新的最新数据）
    // 2. 备用的公共API
    
    // 读取现有 KV 数据作为备份
    let existingProxies = [];
    let existingData;
    try {
      existingData = await env.proxyworker.get('list');
      if (existingData) {
        existingProxies = JSON.parse(existingData);
        console.log('成功获取现有代理列表作为备份，共 ' + existingProxies.length + ' 个');
      }
    } catch (e) {
      console.error('读取现有代理列表失败:', e);
    }
    
    // 获取Worker自身的域名
    const requestUrl = new URL(env.__STATIC_CONTENT_MANIFEST || '');
    let baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    
    // 如果不能有效获取域名，尝试从环境变量或其他途径获取
    if (!baseUrl || baseUrl === '//') {
      // 尝试从Cloudflare环境变量中获取
      try {
        const cfEnv = env.CF_PAGES_URL || env.CF_WORKER_DOMAIN || 'https://proxy-worker.your-domain.workers.dev';
        baseUrl = new URL(cfEnv).origin;
      } catch (e) {
        baseUrl = 'https://proxy-worker.your-domain.workers.dev';
      }
    }
      
    console.log('尝试从 ' + baseUrl + '/proxies.json 获取最新代理数据...');
    
    try {
      // 添加时间戳和随机数，强制绕过任何缓存
      const cacheBuster = '?t=' + Date.now() + '&r=' + Math.random();
      const proxyDataResp = await fetch(baseUrl + '/proxies.json' + cacheBuster, {
        cf: { cacheTtl: 0 }, // 禁用CF缓存
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (proxyDataResp.ok) {
        console.log('成功获取代理数据文件');
        const proxyData = await proxyDataResp.text();
        
        try {
          // 解析并验证数据
          const proxies = JSON.parse(proxyData);
          if (Array.isArray(proxies) && proxies.length > 0) {
            // 过滤有效的代理（具有完整字段的代理）
            const validProxies = proxies.filter(p => 
              p && p.ip && p.port && p.type && p.https
            );              // 合并现有代理的地区信息
              if (existingProxies.length > 0) {
                // 创建现有代理的查找表
                const existingMap = {};
                existingProxies.forEach(p => {
                  if (p && p.ip && p.port) {
                    const key = p.ip + ':' + p.port;
                    existingMap[key] = p;
                  }
                });
                
                // 合并地区信息到新代理
                let regionUpdatedCount = 0;
                validProxies.forEach(p => {
                  const key = p.ip + ':' + p.port;
                  const existingProxy = existingMap[key];
                  
                  // 如果现有代理有地区信息而新代理没有或新代理地区信息为默认值，则保留地区信息
                  if (existingProxy && existingProxy.region && 
                      existingProxy.region !== '未知' && existingProxy.region !== '未检测' && existingProxy.region !== '' &&
                      (!p.region || p.region === '未知' || p.region === '未检测' || p.region === '')) {
                    console.log('保留现有地区信息: ' + key + ' => ' + existingProxy.region);
                    p.region = existingProxy.region;
                    regionUpdatedCount++;
                  }
                });
                
                console.log(`完成地区信息合并，共更新 ${regionUpdatedCount} 个代理的地区信息`);
              }
              
              // 更新最后检查时间为当前时间
              const currentTime = new Date();
              const isoTime = currentTime.toISOString();
              console.log('更新代理时间戳为: ' + isoTime);
              
              validProxies.forEach(p => {
                // 确保每个代理都有最新的检查时间
                p.last_check = isoTime;
                
                // 确保每个代理都有地区信息，即使是默认值
                if (!p.region || p.region.trim() === '') {
                  p.region = '未检测';
                }
              });
              
              // 有效的代理数据，更新到 KV 并写入本地文件
              await env.proxyworker.put('list', JSON.stringify(validProxies));
              
              // 将数据写入到静态资源，这样下次刷新页面时可以直接获取最新数据
              // 注意：这需要 Cloudflare Workers 具有写入权限，或者通过其他方式更新文件
              try {
                const cfUrl = new URL(env.CF_PAGES_URL || env.CF_WORKER_DOMAIN || request.url);
                const assetUpdateUrl = `${cfUrl.protocol}//${cfUrl.host}/update-proxies`;
                const updateResponse = await fetch(assetUpdateUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Update-Secret': env.UPDATE_SECRET || 'default-secret'
                  },
                  body: JSON.stringify(validProxies)
                });
                
                if (updateResponse.ok) {
                  console.log('成功更新静态代理文件');
                } else {
                  console.error('更新静态代理文件失败:', await updateResponse.text());
                }
              } catch (writeErr) {
                console.error('写入静态代理文件时出错:', writeErr);
              }
              
              console.log('成功更新代理列表到 KV，共 ' + validProxies.length + ' 个有效代理，更新时间: ' + currentTime.toLocaleString());
              return;
          } else {
            console.log('文件中的代理数据为空或格式无效');
          }
        } catch (parseErr) {
          console.error('解析代理数据失败:', parseErr);
        }
      } else {
        console.log('无法获取代理数据文件: ' + proxyDataResp.status + ' ' + proxyDataResp.statusText);
      }
    } catch (fetchErr) {
      console.error('获取代理数据文件失败:', fetchErr);
    }
    
    // 如果最新数据更新失败，但已有数据不为空，保留现有数据
    if (existingProxies.length > 0) {
      console.log('无法获取最新代理数据，保留现有数据（' + existingProxies.length + '个代理）');
      return;
    }
    
    // 最后的备用方案：直接从代理API获取
    console.log('尝试从多个代理API直接获取代理...');
    const protocols = [
      { protocol: 'http', type: 'HTTP' },
      { protocol: 'socks4', type: 'SOCKS4' },
      { protocol: 'socks5', type: 'SOCKS5' },
    ];
    let list = [];
    
    for (const p of protocols) {
      try {
        // 尝试不同的API源以增加获取成功的概率
        const apiSources = [
          'https://api.proxyscrape.com/v2/?request=getproxies&protocol=' + p.protocol + '&timeout=10000&country=all&ssl=all&anonymity=all',
          'https://www.proxy-list.download/api/v1/get?type=' + p.protocol.toUpperCase(),
          'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/' + p.protocol + '.txt',
          'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/' + p.protocol + '.txt',
          'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/' + p.protocol + '.txt',
          'https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt'
        ];
        
        for (const apiUrl of apiSources) {
          try {
            console.log(`尝试从 ${apiUrl} 获取${p.type}代理...`);
            const res = await fetch(apiUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            
            if (!res.ok) {
              console.error(`从 ${apiUrl} 获取${p.type}代理失败: ${res.status}`);
              continue;
            }
            
            const text = await res.text();
            // 确保文本内容不为空且包含IP:PORT格式
            if (!text || !text.includes(':')) {
              console.error(`从 ${apiUrl} 获取的内容无效，不包含代理数据`);
              continue;
            }
            
            const arr = text.split('\n')
              .filter(line => line.includes(':'))
              .map(line => {
                const [ip, port] = line.trim().split(':');
                return { 
                  ip, 
                  port, 
                  type: p.type, 
                  https: '待检测', 
                  region: '未检测',
                  last_check: new Date().toISOString(),
                  validated: true
                };
              });
            
            if (arr.length > 0) {
              console.log('成功从 ' + apiUrl + ' 获取' + p.type + '代理，共' + arr.length + '个');
              list = list.concat(arr);
              // 获取成功后跳出当前API源循环
              break;
            }
          } catch (e) {
            console.error(`从 ${apiUrl} 获取${p.type}代理时出错:`, e);
          }
        }
      } catch (e) {
        console.error(`获取${p.type}代理时出错:`, e);
      }
    }
    
    if (list.length > 0) {
      // 如果现有代理有地区信息，合并数据
      if (existingProxies.length > 0) {
        const existingMap = {};
        existingProxies.forEach(p => {
          if (p && p.ip && p.port) {
            const key = p.ip + ':' + p.port;
            existingMap[key] = p;
          }
        });
        
        // 合并地区信息
        list.forEach(p => {
          const key = p.ip + ':' + p.port;
          const existingProxy = existingMap[key];
          if (existingProxy && existingProxy.region && 
              existingProxy.region !== '未知' && existingProxy.region !== '未检测' && existingProxy.region !== '') {
            console.log('保留API代理地区信息: ' + key + ' => ' + existingProxy.region);
            p.region = existingProxy.region;
          }
        });
      }
      
      console.log(`共获取到 ${list.length} 个代理，准备更新到KV...`);
      
      // 将代理IP列表存入KV
      try {
        await env.proxyworker.put('list', JSON.stringify(list));
        console.log(`成功从API更新代理列表，共${list.length}个代理`);
      } catch (kvError) {
        console.error('存储代理列表到KV时出错:', kvError);
      }
    } else {
      console.error('无法获取任何代理数据，请检查网络或API可用性');
    }
  } catch (err) {
    console.error('获取代理列表失败:', err);
  }
}

// 处理代理相关的API请求
async function handleProxiesAPI(request, env) {
  const url = new URL(request.url);
  
  // 获取代理列表
  if (request.method === 'GET') {
    try {
      const data = await env.proxyworker.get('list');
      const proxies = data ? JSON.parse(data) : [];
      
      // 处理查询参数进行过滤
      const searchParams = url.searchParams;
      const ipFilter = searchParams.get('ip') || '';
      const regionFilter = searchParams.get('region') || '';
      const typeFilter = searchParams.get('type') || '';
      
      const filteredProxies = proxies.filter(p => {
        return (!ipFilter || p.ip.includes(ipFilter)) &&
               (!regionFilter || p.region === regionFilter) &&
               (!typeFilter || p.type === typeFilter);
      });
      
      return new Response(JSON.stringify(filteredProxies), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (e) {
      return new Response('获取代理列表失败', { status: 500 });
    }
  }
  
  return new Response('不支持的请求方法', { status: 405 });
}

// 更新代理文件的处理程序
async function updateProxiesFile(request, env) {
  // 验证更新密钥
  const updateSecret = env.UPDATE_SECRET || 'default-secret';
  const providedSecret = request.headers.get('X-Update-Secret');
  
  if (providedSecret !== updateSecret) {
    return new Response('未授权', { status: 401 });
  }
  
  try {
    // 读取请求体中的代理数据
    const proxiesData = await request.json();
    
    if (!Array.isArray(proxiesData) || proxiesData.length === 0) {
      return new Response('无效的代理数据格式', { status: 400 });
    }
    
    // 使用R2或KV存储代理数据
    // 注意：为了使前端能直接访问这个文件，我们需要将其作为静态资源可用
    // 这里有两种方法：
    // 1. 使用R2并配置公共访问
    // 2. 使用KV并在静态资源请求处理中特殊处理
    
    if (env.__STATIC_CONTENT) {
      // 方法2：使用KV存储，并在请求处理中特殊处理
      await env.__STATIC_CONTENT.put(
        'proxies.json', 
        JSON.stringify(proxiesData, null, 2),
        { contentType: 'application/json' }
      );
      
      console.log(`已更新代理文件，共 ${proxiesData.length} 个条目`);
      return new Response(JSON.stringify({ success: true, count: proxiesData.length }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } 
    
    // 如果没有KV或R2存储，则返回错误
    return new Response('无可用的存储机制来更新静态文件', { status: 500 });
  } catch (error) {
    console.error('更新代理文件失败:', error);
    return new Response('更新代理文件失败: ' + error.message, { status: 500 });
  }
}

// 立即刷新代理的请求处理
async function handleRefreshRequest(request, env, ctx) {
  try {
    // 直接从源头获取代理数据并更新KV
    await fetchAndStore(env);
    
    return new Response('代理数据已刷新', { status: 200 });
  } catch (e) {
    console.error('立即刷新代理时出错:', e);
    return new Response('立即刷新代理失败', { status: 500 });
  }
}
