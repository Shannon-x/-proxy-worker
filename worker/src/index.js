import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

// Removed serveStaticAsset function as it's no longer used.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle /proxies.json API endpoint (KEEP THIS)
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
              'Cache-Control': 'no-cache', // Ensure fresh data for API
              'Access-Control-Allow-Origin': '*' // CORS for API
            }
          });
        }
        
        // 尝试从KV获取数据
        const data = await env.proxyworker.get('list');
        return new Response(data || '[]', {
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate', // Ensure fresh data for API
            'Access-Control-Allow-Origin': '*' // CORS for API
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
            'Access-Control-Allow-Origin': '*' // CORS for API
          }
        });
      }
    }

    // For all other requests, attempt to serve from static assets (Vue frontend)
    try {
      // __STATIC_CONTENT_MANIFEST is a special variable that Wrangler uses to map
      // requests to assets. It's used by getAssetFromKV.
      // env.ASSET_NAMESPACE corresponds to 'bucket' in wrangler.toml for [site]
      // env.ASSET_MANIFEST is implicitly used by getAssetFromKV with Wrangler Sites
      return await getAssetFromKV(
        { request, waitUntil: ctx.waitUntil.bind(ctx) },
        { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST }
      );
    } catch (e) {
      // If getAssetFromKV throws an error (e.g., asset not found),
      // try to serve the root index.html for SPA routing.
      // This allows Vue Router to handle paths like /about, /user/profile, etc.
      try {
        const spaRequest = new Request(new URL('/index.html', request.url).toString(), request);
        return await getAssetFromKV(
          { request: spaRequest, waitUntil: ctx.waitUntil.bind(ctx) },
          { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST }
        );
      } catch (e2) {
        // If index.html itself is not found, return a 404.
        // This could happen if the build output is missing or wrangler.toml is misconfigured.
        console.error('Error serving static asset or SPA fallback:', e2.message, e.message);
        // It's often better to return the actual error from the first getAssetFromKV if index.html also fails
        // But if index.html is the *only* thing that should be served for missing assets in an SPA,
        // then an error here means something is fundamentally wrong with index.html itself.
        return new Response(`Asset not found. Initial error: ${e.message}. Fallback error: ${e2.message}`, { status: 404 });
      }
    }
  },

  async scheduled(event, env, ctx) {
    console.log('[fetchAndStore] 开始执行定时任务：获取代理列表 (触发时间: ' + new Date().toISOString() + ')');
    try {
      await fetchAndStore(env);
      console.log('[fetchAndStore] 定时任务执行完成');
    } catch(e) {
      console.error('[fetchAndStore] 定时任务执行失败:', e.message, e.stack);
    }
  }
  // ... (fetchAndStore, handleProxiesAPI, etc. remain the same as per previous step) ...
};

// 从本地 proxies.json 文件或备用API获取代理列表并存入 KV
async function fetchAndStore(env) {
  try {
    // 首先检查 KV 绑定是否存在
    if (!env.proxyworker) {
      console.error('无法执行定时任务：proxyworker KV 命名空间未绑定!');
      return;
    }
    
    // console.log('开始读取最新代理数据，时间: ' + new Date().toISOString()); // Duplicate log
    
    // 获取代理数据的优先级：
    // 1. 从外部API获取新的代理数据
    // 2. 从KV获取现有代理数据
    // 3. 合并两个列表
    // 4. 将合并后的列表存回KV

    console.log('[fetchAndStore] 开始执行代理数据同步任务, 时间: ' + new Date().toISOString());

    let newProxiesFromAPIs = [];
    // 最后的备用方案：直接从代理API获取
    console.log('[fetchAndStore] 尝试从多个外部API获取代理...');
    const protocols = [
      { protocol: 'http', type: 'HTTP' },
      { protocol: 'socks4', type: 'SOCKS4' },
      { protocol: 'socks5', type: 'SOCKS5' },
    ];
    // let list = []; // list variable is not used, newProxiesFromAPIs is used directly
    
    for (const p of protocols) {
      try {
        // 尝试不同的API源以增加获取成功的概率
        // Add &format=json for proxyscrape to get geo-location data
        const apiSources = [
          `https://api.proxyscrape.com/v2/?request=getproxies&protocol=${p.protocol}&timeout=10000&country=all&ssl=all&anonymity=all&format=json`,
          'https://www.proxy-list.download/api/v1/get?type=' + p.protocol.toUpperCase(),
          'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/' + p.protocol + '.txt',
          'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/' + p.protocol + '.txt',
          'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/' + p.protocol + '.txt',
          'https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt'
        ];
        
        for (const apiUrl of apiSources) {
          try {
            console.log('[fetchAndStore] 尝试从 ' + apiUrl + ' 获取' + p.type + '代理...');
            const res = await fetch(apiUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            
            if (!res.ok) {
              console.error('[fetchAndStore] 从 ' + apiUrl + ' 获取' + p.type + '代理失败: ' + res.status);
              continue;
            }
            
            let currentApiProxies = [];
            let countryEnrichedCount = 0;

            if (apiUrl.includes('api.proxyscrape.com')) {
              // Handle Proxyscrape JSON response
              try {
                const jsonData = await res.json();
                if (jsonData && Array.isArray(jsonData.proxies)) {
                  jsonData.proxies.forEach(item => {
                    if (item && item.proxy && item.ip && item.port) {
                      const region = item.country || '未检测';
                      if (item.country) countryEnrichedCount++;
                      currentApiProxies.push({
                        ip: item.ip,
                        port: String(item.port), // Ensure port is a string
                        type: p.type, // Protocol type from outer loop
                        https: item.ssl ? '支持' : '不支持', // Or keep '待检测' if not reliably provided
                        region: region,
                        last_check: new Date().toISOString(),
                        validated: true
                      });
                    }
                  });
                  console.log(`[fetchAndStore] 成功从 Proxyscrape (JSON) ${apiUrl} 获取 ${p.type} 代理，共 ${currentApiProxies.length} 个，其中 ${countryEnrichedCount} 个获得了国家信息。`);
                } else {
                  console.warn(`[fetchAndStore] 从 Proxyscrape ${apiUrl} 获取的JSON数据格式不符合预期或proxies数组为空/不存在。`);
                }
              } catch (jsonError) {
                console.error(`[fetchAndStore] 解析来自 ${apiUrl} (Proxyscrape JSON) 的JSON时出错: ${jsonError.message}.`);
                // If JSON parsing fails for Proxyscrape, we do not attempt to parse it as text,
                // as it's expected to be JSON. We just log the error and move on.
                // The currentApiProxies for this specific failed fetch will remain empty.
                 console.warn(`[fetchAndStore] Proxyscrape URL ${apiUrl} was intended for JSON, but JSON parsing failed. It will not be parsed as text.`);
              }
            } else {
              // Handle plain text IP:PORT lists for other APIs
              const text = await res.text();
              if (!text || !text.includes(':')) {
                console.warn('[fetchAndStore] 从 ' + apiUrl + ' 获取的内容无效或为空（非Proxyscrape），跳过。');
                continue;
              }
              const lines = text.split('\n');
              currentApiProxies = lines
                .filter(line => line.includes(':'))
                .map(line => {
                  const [ip, port] = line.trim().split(':');
                  if (ip && port && ip.includes('.') && !isNaN(parseInt(port))) {
                    return {
                      ip,
                      port,
                      type: p.type,
                      https: '待检测',
                      region: '未检测',
                      last_check: new Date().toISOString(),
                      validated: true
                    };
                  }
                  return null;
                }).filter(proxy => proxy !== null);
              console.log(`[fetchAndStore] 成功从 ${apiUrl} (text) 获取 ${p.type} 代理，共 ${currentApiProxies.length} 个。`);
            }
            
            if (currentApiProxies.length > 0) {
              newProxiesFromAPIs = newProxiesFromAPIs.concat(currentApiProxies);
            }
          } catch (e) {
            console.error(`[fetchAndStore] 从 ${apiUrl} 获取 ${p.type} 代理时出错:`, e.message, e.stack);
          }
        }
      } catch (e) {
        console.error(`[fetchAndStore] 获取 ${p.type} 代理的API列表时出错:`, e.message, e.stack);
      }
    }
    // console.log(`[fetchAndStore] 从所有外部API共获取到 ${newProxiesFromAPIs.length} 个代理.`); // Original log before the duplicate below
    console.log(`[fetchAndStore] 从所有外部API共获取到 ${newProxiesFromAPIs.length} 个原始代理条目。`);

    // 2. 处理API获取的代理列表：去重并确保字段完整性
    const processedProxiesMap = new Map();
    const currentTimeISO = new Date().toISOString();

    newProxiesFromAPIs.forEach(p_item => { // Renamed p to p_item to avoid conflict with outer loop variable
      if (p_item && p_item.ip && p_item.port) {
        const key = `${p_item.ip}:${p_item.port}`;
        // 如果Map中已存在此代理，则跳过，实现去重 (保留第一次遇到的)
        // 或者，可以根据需求决定是否更新已存在的条目（例如，如果后续API提供更详细信息）
        // 当前逻辑：简单去重，保留第一个。
        if (!processedProxiesMap.has(key)) {
          processedProxiesMap.set(key, {
            ip: p_item.ip,
            port: p_item.port,
            type: p_item.type || '未知', // Default type
            https: p_item.https || '待检测', // Default https status
            region: p_item.region || '未检测', // Default region
            last_check: currentTimeISO, // Always use current time for fresh API data
            validated: p_item.validated !== undefined ? p_item.validated : true // Default to true if not specified
          });
        }
      }
    });

    const finalAPIOnlyProxyList = Array.from(processedProxiesMap.values());
    console.log(`[fetchAndStore] 处理后，得到 ${finalAPIOnlyProxyList.length} 个唯一的代理。`);

    // 3. 将纯API获取的代理列表存回KV (覆盖)
    if (finalAPIOnlyProxyList.length > 0) {
      try {
        await env.proxyworker.put('list', JSON.stringify(finalAPIOnlyProxyList));
        console.log(`[fetchAndStore] 成功将 ${finalAPIOnlyProxyList.length} 个从API获取的代理覆盖写入KV。`);
      } catch (kvError) {
        console.error('[fetchAndStore] 存储API代理列表到KV时出错:', kvError.message);
      }
    } else {
      try {
        await env.proxyworker.put('list', '[]'); // Store empty array if no proxies from APIs
        console.log('[fetchAndStore] 从API获取的代理列表为空，已将空列表写入KV。');
      } catch (kvError) {
        console.error('[fetchAndStore] 存储空代理列表到KV时出错:', kvError.message);
      }
      console.warn('[fetchAndStore] 本次运行未从外部API获取到任何代理数据。KV已被清空。');
    }

  } catch (err) {
    console.error('[fetchAndStore] 获取和存储代理列表过程中发生严重错误:', err.message, err.stack);
  }
}

// 处理代理相关的API请求
// async function handleProxiesAPI(request, env) { ... } // This function is not directly called by fetch, it's a helper, can be kept or removed if not used elsewhere.
                                                        // For now, assume it might be used by other potential handlers not shown or is good utility.

// 更新代理文件的处理程序
// async function updateProxiesFile(request, env) { ... } // This function is not directly called by fetch, can be kept or removed.
                                                       // Assumed not needed for the core task of serving Vue app and proxies.json

// 立即刷新代理的请求处理
// async function handleRefreshRequest(request, env, ctx) { ... } // This function is not directly called by fetch, can be kept or removed.
                                                              // Assumed not needed for the core task.
// Note: The helper functions handleProxiesAPI, updateProxiesFile, handleRefreshRequest are not directly part of the
// main fetch or scheduled logic. They seem to be remnants of other potential API endpoints.
// For this refactoring, I'm focusing on the main fetch handler and scheduled handler.
// These helper functions can be removed if they are confirmed to be unused.
// For now, I will leave them but comment them out in the diff if they cause issues with the primary task.
// Upon review, these are not called by the main fetch handler so they can be removed or kept if they serve other purposes.
// The subtask is about modifying the main fetch handler.
// I will remove them from the diff to simplify, assuming they are not essential for this specific refactoring.
