let proxies = [];
let filtered = [];
let currentPage = 1;
const pageSize = 20;

async function loadProxies() {
    const statusElem = document.getElementById('status-message');
    if (!statusElem) {
        const newStatusElem = document.createElement('div');
        newStatusElem.id = 'status-message';
        newStatusElem.style.padding = '10px';
        newStatusElem.style.marginBottom = '15px';
        document.querySelector('.container').insertBefore(newStatusElem, document.querySelector('#proxy-table'));
        
        newStatusElem.textContent = '正在加载代理数据...';
        newStatusElem.style.backgroundColor = '#f8f9fa';
    } else {
        statusElem.textContent = '正在刷新代理数据...';
        statusElem.style.backgroundColor = '#f8f9fa';
    }
    
    try {
        // 强制破坏缓存
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        // 使用更多的随机参数确保完全绕过缓存
        const url = `/proxies.json?noCache=${timestamp}&random=${random}&_=${new Date().getTime()}`;
        
        console.log(`正在获取代理数据，请求URL: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Requested-With': 'XMLHttpRequest' // 明确这是AJAX请求
            },
            cache: 'no-store', // 告诉浏览器不要缓存
            credentials: 'omit' // 不发送凭证，进一步减少缓存可能性
        });
        
        console.log('获取代理数据请求完成, 时间: ' + new Date().toLocaleTimeString() + ', 状态: ' + response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP 错误: ${response.status}`);
        }
        
        // 先以文本形式读取响应，以便检查内容
        const responseText = await response.text();
        console.log(`接收到响应数据长度: ${responseText.length} 字节`);
        
        // 检查是否为空响应
        if (!responseText.trim()) {
            throw new Error('服务器返回了空响应');
        }
        
        // 尝试解析JSON
        let data;
        try {
            data = JSON.parse(responseText);
            console.log(`成功解析JSON数据，包含 ${Array.isArray(data) ? data.length : 0} 个条目`);
        } catch (parseError) {
            console.error('解析JSON失败:', parseError);
            console.log('收到的数据前100个字符:', responseText.substring(0, 100) + '...');
            throw new Error(`JSON解析错误: ${parseError.message}`);
        }
        
        proxies = Array.isArray(data) ? data : [];
        
        // 记录从服务器接收到的代理数量
        console.log(`从服务器接收到 ${proxies.length} 个代理数据`);
        
        if (proxies.length > 0) {
            // 在日志中显示收到的第一条代理数据，帮助调试
            console.log('第一个代理数据:', {
                ip: proxies[0].ip,
                port: proxies[0].port,
                type: proxies[0].type,
                https: proxies[0].https,
                region: proxies[0].region,
                lastCheck: proxies[0].last_check
            });
            
            // 检查是否找到有地区信息的代理
            const withRegionCount = proxies.filter(p => 
                p && p.region && p.region !== '未知' && p.region !== '未检测' && p.region !== ''
            ).length;
            
            console.log(`有地区信息的代理: ${withRegionCount}/${proxies.length}`);
        }
        
        // 显示代理更新时间和统计
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
            '<div class="small mt-1">已验证: ' + validatedProxies.length + ' 个 | 有地区信息: ' + withRegion + ' 个</div>';
        statusElem.style.backgroundColor = '#d1e7dd';
        
        populateFilters(); // 填充筛选选项
        currentPage = 1;
        renderTable();
        renderPagination();
        return true;
    } catch (err) {
        console.error('加载代理失败:', err);
        const statusElem = document.getElementById('status-message');
        statusElem.textContent = `加载代理失败: ${err.message}，请刷新页面重试`;
        statusElem.style.backgroundColor = '#f8d7da';
        return false;
    }
}

// 新增：填充筛选下拉框
function populateFilters() {
    const regionSet = new Set();
    const typeSet = new Set();
    proxies.forEach(p => {
        if (p.region) regionSet.add(p.region);
        if (p.type) typeSet.add(p.type);
    });
    const regionSelect = document.getElementById('filter-region');
    const typeSelect = document.getElementById('filter-type');
    // 保留第一个“全部”选项
    regionSelect.innerHTML = '<option value="">全部地区</option>';
    typeSelect.innerHTML = '<option value="">全部类型</option>';
    Array.from(regionSet).sort().forEach(r => {
        const opt = document.createElement('option'); opt.value = r; opt.textContent = r;
        regionSelect.appendChild(opt);
    });
    Array.from(typeSet).sort().forEach(t => {
        const opt = document.createElement('option'); opt.value = t; opt.textContent = t;
        typeSelect.appendChild(opt);
    });
}

// 更新过滤并渲染
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    const regionVal = document.getElementById('filter-region').value;
    const typeVal = document.getElementById('filter-type').value;
    filtered = proxies.filter(p => {
        const matchSearch = !searchTerm || p.ip.includes(searchTerm) || p.region.toLowerCase().includes(searchTerm);
        const matchRegion = !regionVal || p.region === regionVal;
        const matchType = !typeVal || p.type === typeVal;
        return matchSearch && matchRegion && matchType;
    });
    currentPage = 1;
    renderTable();
    renderPagination();
}

// 新增：CSV 导出
function exportCSV() {
    const headers = ['IP', '端口', '类型', 'HTTPS', '地区'];
    const rows = [headers].concat(
        filtered.map(p => [p.ip, p.port, p.type, p.https, p.region])
    );
    const csvContent = rows.map(r => r.map(field => '"' + (field || '') + '"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'proxies_' + Date.now() + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        // 格式化地区显示 - 如果格式是 "国家/省/市"，只显示 "国家/省"
        let regionDisplay = p.region || '-';
        if (regionDisplay.includes('/')) {
            const parts = regionDisplay.split('/');
            if (parts.length >= 2) {
                regionDisplay = `${parts[0]}/${parts[1]}`;
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
        
        // 区域信息标记
        const hasRegion = p.region && p.region !== '未知' && p.region !== '未检测' && p.region !== '';
        
        // 创建单元格内容
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

// 事件绑定：搜索、筛选、导出
document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('filter-region').addEventListener('change', applyFilters);
document.getElementById('filter-type').addEventListener('change', applyFilters);
document.getElementById('export-btn').addEventListener('click', exportCSV);

// 全局变量，用于跟踪自动刷新间隔和状态
let autoRefreshInterval = null;
const AUTO_REFRESH_SECONDS = 30; // 自动刷新间隔，秒

// 启动或重置自动刷新计时器
function startAutoRefresh() {
    // 清除现有计时器
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    // 设置新计时器
    autoRefreshInterval = setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        console.log(`==== 自动刷新触发 (${timeStr}) ====`);
        
        // 强制清除浏览器缓存
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                    console.log(`缓存 "${name}" 已清除`);
                });
            });
        }
        
        // 添加额外的随机参数确保不使用缓存
        loadProxies().then(success => {
            console.log(`自动刷新完成: ${success ? "成功" : "失败"}, 时间: ${new Date().toLocaleTimeString()}`);
            
            if (!success) {
                // 如果刷新失败，5秒后重试一次
                setTimeout(() => {
                    console.log("自动刷新失败，正在重试...");
                    loadProxies();
                }, 5000);
            }
        }).catch(err => {
            console.error("自动刷新出错:", err);
        });
    }, AUTO_REFRESH_SECONDS * 1000);
    
    // 更新UI提示
    const autoRefreshSpan = document.querySelector('.auto-refresh-status');
    if (autoRefreshSpan) {
        autoRefreshSpan.textContent = '（自动每' + AUTO_REFRESH_SECONDS + '秒刷新一次）';
    }
    
    console.log('自动刷新已启动，间隔' + AUTO_REFRESH_SECONDS + '秒');
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
    
    console.log('自动刷新已停止');
}

// 添加刷新按钮事件和初始加载
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面已加载，初始化代理列表...');
    
    // 初始加载代理数据
    loadProxies().then(() => {
        // 初始加载成功后启动自动刷新
        startAutoRefresh();
    }).catch(err => {
        console.error('初始加载失败：', err);
    });
    
    // 手动刷新按钮事件
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const statusElem = document.getElementById('status-message');
            statusElem.textContent = '正在刷新代理数据...';
            statusElem.style.backgroundColor = '#cff4fc';
            
            // 旋转刷新图标
            const icon = refreshBtn.querySelector('i');
            icon.classList.add('bi-arrow-clockwise-spin');
            refreshBtn.disabled = true;
            
            // 手动刷新时重置自动刷新计时器
            loadProxies().finally(() => {
                icon.classList.remove('bi-arrow-clockwise-spin');
                refreshBtn.disabled = false;
                
                // 重置自动刷新计时器
                startAutoRefresh();
            });
        });
    }
    
    // 自动刷新开关按钮事件
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