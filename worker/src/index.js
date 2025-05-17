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
    // 静态资源，增加根路径映射到 index.html
    // 构造事件对象供 getAssetFromKV 使用
    const event = { request, env, waitUntil: ctx.waitUntil };
    try {
      return await getAssetFromKV(event, {
        mapRequestToAsset: (req) => {
          const parsedURL = new URL(req.url);
          if (parsedURL.pathname === '/') {
            parsedURL.pathname = '/index.html';
          }
          return new Request(parsedURL.toString(), req);
        }
      });
    } catch (e) {
      console.error('Asset handler error:', e);
      return fetch(request);
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(fetchAndStore(env));
  }
};

// 从 Proxyscrape 拉取 HTTP、SOCKS4、SOCKS5 代理列表并存入 KV
async function fetchAndStore(env) {
  const protocols = [
    { protocol: 'http', type: 'HTTP' },
    { protocol: 'socks4', type: 'SOCKS4' },
    { protocol: 'socks5', type: 'SOCKS5' },
  ];
  let list = [];
  for (const p of protocols) {
    const res = await fetch(
      `https://api.proxyscrape.com/v2/?request=getproxies&protocol=${p.protocol}&timeout=10000&country=all&ssl=all&anonymity=all`
    );
    const text = await res.text();
    const arr = text
      .split('\n')
      .filter(line => line.includes(':'))
      .map(line => {
        const [ip, port] = line.trim().split(':');
        return { ip, port, type: p.type, https: '待检测', region: '' };
      });
    list = list.concat(arr);
  }
  await env.PROXIES.put('list', JSON.stringify(list));
}