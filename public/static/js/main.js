async function loadProxies() {
    try {
        const response = await fetch('/proxies.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const tbody = document.querySelector('#proxy-table tbody');
        tbody.innerHTML = '';
        data.forEach(p => {
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
    } catch (err) {
        console.error('加载代理失败:', err);
    }
}

setInterval(loadProxies, 300000); // 每5分钟刷新一次 