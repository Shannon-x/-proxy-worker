import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

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
            return new Response(JSON.stringify({ error: 'KV存储未配置', message: '系统暂时无法提供代理数据' }), {
              status: 503,
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
              }
            });
          }
          
          const data = await env.proxyworker.get('list');
          return new Response(data || '[]', {
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Access-Control-Allow-Origin': '*'
            }
          });
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
      
      // 使用 getAssetFromKV 处理静态资源
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
          env
        },
        {
          mapRequestToAsset: (req) => {
            const parsedUrl = new URL(req.url);
            // 根路径映射到index.html
            if (parsedUrl.pathname === '/') {
              parsedUrl.pathname = '/index.html';
            }
            return new Request(parsedUrl.toString(), req);
          },
          cacheControl: {
            bypassCache: true
          }
        }
      );
    } catch (e) {
      console.error('Worker错误:', e);
      return new Response(`服务错误: ${e.message}`, { 
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  },

  async scheduled(event, env, ctx) {
    console.log('开始执行定时任务：获取代理列表');
    ctx.waitUntil(fetchAndStore(env));
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
    
    const protocols = [
      { protocol: 'http', type: 'HTTP' },
      { protocol: 'socks4', type: 'SOCKS4' },
      { protocol: 'socks5', type: 'SOCKS5' },
    ];
    let list = [];
    
    // 尝试获取现有代理列表
    let existingProxies = [];
    try {
      const existingData = await env.proxyworker.get('list');
      if (existingData) {
        existingProxies = JSON.parse(existingData);
      }
    } catch (e) {
      console.error('读取现有代理失败:', e);
    }
    
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
        
        list = list.concat(arr);
      } catch (e) {
        console.error(`获取${p.type}代理时出错:`, e);
      }
    }
    
    // 如果新获取的列表为空，但存在旧数据，保留旧数据
    if (list.length === 0 && existingProxies.length > 0) {
      console.log('新获取的代理列表为空，保留现有数据');
      return;
    }
    
    // 将代理IP列表存入KV
    await env.proxyworker.put('list', JSON.stringify(list));
    console.log(`成功更新代理列表，共${list.length}个代理`);
  } catch (err) {
    console.error('获取代理列表失败:', err);
  }
}