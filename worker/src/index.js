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

// 从本地 proxies.json 文件或备用API获取代理列表并存入 KV
async function fetchAndStore(env) {
  try {
    // 首先检查 KV 绑定是否存在
    if (!env.proxyworker) {
      console.error('无法执行定时任务：proxyworker KV 命名空间未绑定!');
      return;
    }
    
    console.log('开始读取最新代理数据...');
    
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
        console.log(`成功获取现有代理列表作为备份，共 ${existingProxies.length} 个`);
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
      
    console.log(`尝试从 ${baseUrl}/proxies.json 获取最新代理数据...`);
    
    try {
      // 添加时间戳和随机数，强制绕过任何缓存
      const cacheBuster = `?t=${Date.now()}&r=${Math.random()}`;
      const proxyDataResp = await fetch(`${baseUrl}/proxies.json${cacheBuster}`, {
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
            );
            
            // 有效的代理数据，更新到 KV
            await env.proxyworker.put('list', JSON.stringify(validProxies));
            console.log(`成功更新代理列表，共 ${validProxies.length} 个有效代理`);
            return;
          } else {
            console.log('文件中的代理数据为空或格式无效');
          }
        } catch (parseErr) {
          console.error('解析代理数据失败:', parseErr);
        }
      } else {
        console.log(`无法获取代理数据文件: ${proxyDataResp.status} ${proxyDataResp.statusText}`);
      }
    } catch (fetchErr) {
      console.error('获取代理数据文件失败:', fetchErr);
    }
    
    // 如果最新数据更新失败，但已有数据不为空，保留现有数据
    if (existingProxies.length > 0) {
      console.log(`无法获取最新代理数据，保留现有数据（${existingProxies.length}个代理）`);
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
          `https://api.proxyscrape.com/v2/?request=getproxies&protocol=${p.protocol}&timeout=10000&country=all&ssl=all&anonymity=all`,
          `https://www.proxy-list.download/api/v1/get?type=${p.protocol.toUpperCase()}`
        ];
        
        for (const apiUrl of apiSources) {
          try {
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
              console.log(`成功从 ${apiUrl} 获取${p.type}代理，共${arr.length}个`);
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
      // 使用备用方法获取的代理可能需要验证，此处可考虑增加简单验证
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
