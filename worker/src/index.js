import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/proxies.json') {
      const data = await env.PROXIES.get('list') || '[]';
      return new Response(data, {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // 静态资源，增加 ctx 及错误捕获
    try {
      return await getAssetFromKV(request, env, ctx);
    } catch (e) {
      console.error('Asset handler error:', e);
      // 回退到直接 fetch 请求
      return fetch(request);
    }
  },

  async scheduled(event, env, ctx) {
    // 定时触发抓取
    ctx.waitUntil(fetchAndStore(env));
  }
};

// 从 Proxyscrape 拉取代理列表并存入 KV
async function fetchAndStore(env) {
  const res = await fetch(
    'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all'
  );
  const text = await res.text();
  const list = text
    .split('\n')
    .filter(line => line.includes(':'))
    .map(line => {
      const [ip, port] = line.trim().split(':');
      return { ip, port, type: 'HTTP', https: '待检测', region: '' };
    });
  await env.PROXIES.put('list', JSON.stringify(list));
} 