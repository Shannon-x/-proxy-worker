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
      // index.html内容 - 使用简化版
      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>有效代理列表</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <script src="/static/js/main.js" defer></script>
</head>
<body>
<div class="container mt-5">
    <h1 class="mb-4">有效代理列表</h1>
    <div class="alert alert-info">
        正在加载代理数据，请稍候...
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
</div>
<script>
    // 简化版JS代码，直接嵌入
    let proxies = [];
    
    async function loadProxies() {
        try {
            const response = await fetch('/proxies.json');
            if (!response.ok) {
                document.querySelector('.alert').textContent = '加载失败: ' + response.status;
                document.querySelector('.alert').className = 'alert alert-danger';
                return;
            }
            
            const data = await response.json();
            if (data.error) {
                document.querySelector('.alert').textContent = '错误: ' + (data.message || data.error);
                document.querySelector('.alert').className = 'alert alert-danger';
                return;
            }
            
            proxies = Array.isArray(data) ? data : [];
            
            if (proxies.length === 0) {
                document.querySelector('.alert').textContent = '暂无代理数据';
                return;
            }
            
            document.querySelector('.alert').style.display = 'none';
            
            const tbody = document.querySelector('#proxy-table tbody');
            tbody.innerHTML = '';
            
            proxies.slice(0, 20).forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = \`
                    <td>\${p.ip}</td>
                    <td>\${p.port}</td>
                    <td>\${p.type || '-'}</td>
                    <td>\${p.https || '-'}</td>
                    <td>\${p.region || '-'}</td>
                \`;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error('加载代理失败:', err);
            document.querySelector('.alert').textContent = '加载失败: ' + err.message;
            document.querySelector('.alert').className = 'alert alert-danger';
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        loadProxies();
        // 每60秒刷新一次
        setInterval(loadProxies, 60000);
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
        tr.innerHTML = \`
            <td>\${p.ip}</td>
            <td>\${p.port}</td>
            <td>\${p.type || '-'}</td>
            <td>\${p.https || '-'}</td>
            <td>\${p.region || '-'}</td>
        \`;
        tbody.appendChild(tr);
    });
}

// 初始加载
document.addEventListener('DOMContentLoaded', () => {
    loadProxies();
    setInterval(loadProxies, 60000);
});`;
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
    console.log('开始执行定时任务：获取代理列表');
    try {
      await fetchAndStore(env);
      console.log('定时任务执行完成');
    } catch(e) {
      console.error('定时任务执行失败:', e);
    }
  }
};

// 从 Proxyscrape 拉取 HTTP、SOCKS4、SOCKS5 代理列表并存入 KV
async function fetchAndStore(env) {
  try {
    // 首先检查 KV 绑定是否存在
    if (!env.proxyworker) {
      console.error('无法执行定时任务：proxyworker KV 命名空间未绑定!');
      return;
    }
    
    // 尝试从本地文件读取代理列表
    try {
      const proxiesJson = await fetch('https://raw.githubusercontent.com/username/proxy-worker/main/worker/public/proxies.json')
        .catch(() => fetch('https://proxy-worker.pages.dev/proxies.json'))
        .catch(() => null);
      
      if (proxiesJson && proxiesJson.ok) {
        const proxyData = await proxiesJson.text();
        if (proxyData) {
          try {
            // 解析JSON确保格式正确
            const proxies = JSON.parse(proxyData);
            
            // 确认是数组且至少有一项
            if (Array.isArray(proxies) && proxies.length > 0) {
              // 存入KV
              await env.proxyworker.put('list', JSON.stringify(proxies));
              console.log(`成功从远程文件更新代理列表，共${proxies.length}个代理`);
              return;
            }
          } catch (jsonError) {
            console.error('解析代理JSON时出错:', jsonError);
          }
        }
      }
    } catch (fetchError) {
      console.error('获取远程代理文件失败:', fetchError);
    }
    
    // 尝试获取现有代理列表
    let existingProxies = [];
    try {
      const existingData = await env.proxyworker.get('list');
      if (existingData) {
        existingProxies = JSON.parse(existingData);
        console.log(`成功获取KV中的现有代理列表，共${existingProxies.length}个代理`);
        if (existingProxies.length > 0) {
          // 如果距离上次更新不到6小时且有足够的代理，则跳过本次更新
          const now = new Date().getTime();
          const lastCheck = existingProxies[0].last_check ? new Date(existingProxies[0].last_check).getTime() : 0;
          if (now - lastCheck < 6 * 60 * 60 * 1000 && existingProxies.length > 50) {
            console.log(`上次更新时间距离现在不到6小时，且有${existingProxies.length}个代理，跳过更新`);
            return;
          }
        }
      }
    } catch (e) {
      console.error('读取现有代理失败:', e);
    }
    
    // 备用方法：直接从代理API获取
    const protocols = [
      { protocol: 'http', type: 'HTTP' },
      { protocol: 'socks4', type: 'SOCKS4' },
      { protocol: 'socks5', type: 'SOCKS5' },
    ];
    let list = [];
    
    for (const p of protocols) {
      try {
        const res = await fetch(
          `https://api.proxyscrape.com/v2/?request=getproxies&protocol=${p.protocol}&timeout=10000&country=all&ssl=all&anonymity=all`
        );
        if (!res.ok) {
          console.error(`获取${p.type}代理失败: ${res.status}`);
          continue;
        }
        
        const text = await res.text();
        const arr = text.split('\n')
          .filter(line => line.includes(':'))
          .map(line => {
            const [ip, port] = line.trim().split(':');
            return { 
              ip, 
              port, 
              type: p.type, 
              https: '待检测', 
              region: '',
              last_check: new Date().toISOString()
            };
          });
        
        console.log(`成功获取${p.type}代理，共${arr.length}个`);
        list = list.concat(arr);
      } catch (e) {
        console.error(`获取${p.type}代理时出错:`, e);
      }
    }
    
    // 如果新获取的代理列表为空，但存在旧数据，保留旧数据
    if (list.length === 0 && existingProxies.length > 0) {
      console.log('新获取的代理列表为空，保留现有数据');
      return;
    }
    
    console.log(`准备存储代理列表，共${list.length}个代理`);
    
    // 将代理IP列表存入KV
    try {
      await env.proxyworker.put('list', JSON.stringify(list));
      console.log(`成功更新代理列表，共${list.length}个代理`);
    } catch (kvError) {
      console.error('存储代理列表到KV时出错:', kvError);
    }
  } catch (err) {
    console.error('获取代理列表失败:', err);
  }
}
