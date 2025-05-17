let proxies = [];
let filtered = [];
let currentPage = 1;
const pageSize = 20;

async function loadProxies() {
    try {
        const response = await fetch('/proxies.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        proxies = await response.json();
        filtered = proxies;
        currentPage = 1;
        renderTable();
        renderPagination();
    } catch (err) {
        console.error('加载代理失败:', err);
    }
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

document.getElementById('search-input').addEventListener('input', e => {
    const term = e.target.value.trim().toLowerCase();
    filtered = proxies.filter(p =>
        p.ip.includes(term) || p.region.toLowerCase().includes(term)
    );
    currentPage = 1;
    renderTable();
    renderPagination();
});

document.addEventListener('DOMContentLoaded', () => {
    loadProxies();
    setInterval(loadProxies, 60000);
});