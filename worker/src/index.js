import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
 
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // JSON 数据接口
    if (url.pathname === '/proxies.json') {
      const data = await env.PROXIES.get('list') || '[]';
      return new Response(data, { headers: { 'Content-Type': 'application/json' } });
    }
    try {
      // 使用 getAssetFromKV 处理静态资源，并将根路径映射到 index.html
      return await getAssetFromKV({ request, env, ctx }, {
        mapRequestToAsset: (req) => {
          const assetUrl = new URL(req.url);
          if (assetUrl.pathname === '/') assetUrl.pathname = '/index.html';
          return new Request(assetUrl.toString(), req);
        }
      });
    } catch (e) {
      // 资源未找到时返回 404
      return new Response('Not found', { status: 404 });
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
    const arr = text.split('\n').filter(line => line.includes(':')).map(line => {
      const [ip, port] = line.trim().split(':');
      return { ip, port, type: p.type, https: '待检测', region: '' };
    });
    list = list.concat(arr);
  }
  await env.PROXIES.put('list', JSON.stringify(list));
}