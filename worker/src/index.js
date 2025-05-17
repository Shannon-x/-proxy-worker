// 不再使用 `kv-asset-handler`，改用 `env.__STATIC_CONTENT` 内置绑定
 
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // JSON 数据接口
    if (url.pathname === '/proxies.json') {
      const data = await env.PROXIES.get('list') || '[]';
      return new Response(data, { 'headers': { 'Content-Type': 'application/json' } });
    }
    // 忽略 favicon
    if (url.pathname === '/favicon.ico') {
      return new Response(null, { status: 204 });
    }
    // 根路径映射到 index.html
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    // 构造静态资源请求
    const assetURL = new URL(path, request.url);
    const assetRequest = new Request(assetURL.toString(), request);
    // 返回静态资源
    return await env.__STATIC_CONTENT.fetch(assetRequest);
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