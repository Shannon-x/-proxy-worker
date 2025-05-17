let proxies = [];
let filtered = [];
let currentPage = 1;
const pageSize = 20;

async function loadProxies() {
    try {
        const response = await fetch('/proxies.json');
        if (!response.ok) throw new Error(`HTTP 错误: ${response.status}`);
        proxies = await response.json();
        filtered = proxies;
        populateFilters(); // 填充筛选选项
        currentPage = 1;
        renderTable();
        renderPagination();
    } catch (err) {
        console.error('加载代理失败:', err);
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
    const csvContent = rows.map(r => r.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `proxies_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function renderTable() {
    const tbody = document.querySelector('#proxy-table tbody');
    tbody.innerHTML = '';
    const start = (currentPage - 1) * pageSize;
    const pageData = filtered.slice(start, start + pageSize);
    pageData.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.ip}</td>
            <td>${p.port}</td>
            <td>${p.type}</td>
            <td>${p.https}</td>
            <td>${p.region}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPagination() {
    const totalPages = Math.ceil(filtered.length / pageSize);
    const ul = document.getElementById('pagination');
    ul.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item${i === currentPage ? ' active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
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

document.addEventListener('DOMContentLoaded', () => {
    loadProxies();
    setInterval(loadProxies, 60000);
});