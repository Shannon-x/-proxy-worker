#!/usr/bin/env python3
import sys
import asyncio
import aiohttp
import json
import time
import requests
from datetime import datetime
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
import aiohttp_socks
import os

# 在Windows平台上设置SelectorEventLoop，解决aiodns需要SelectorEventLoop的问题
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# 全局常量
CONCURRENT_LIMIT = 100  # 并发限制
REGION_API_QPS = 100    # 每秒最多查询地区API的次数
CHECK_INTERVAL = 3600   # 默认每小时检查一次代理 (3600秒)

# 地区API请求限速器类
class RegionAPIRateLimiter:
    """地区API请求限速器，控制地区API的请求频率"""
    
    def __init__(self, qps):
        """初始化限速器"""
        self.qps = qps
        self.last_request_time = 0
        self.lock = asyncio.Lock()  # 用于同步访问last_request_time
    
    async def acquire(self):
        """获取请求许可，必要时进行等待"""
        async with self.lock:
            current_time = time.time()
            time_since_last_request = current_time - self.last_request_time
            wait_time = max(0, 1/self.qps - time_since_last_request)
            if wait_time > 0:
                await asyncio.sleep(wait_time)
            self.last_request_time = time.time()
            return True

# 初始化配置
ua = UserAgent()
SITE_CONFIGS = {
    'proxy_scdn': {
        'url': 'https://proxy.scdn.io/text.php',
        'type': 'api',
        'parser': 'pre',  # 'pre' 表示直接处理文本
        'extractor': lambda text: [
            {
                'ip': line.split(':')[0],
                'port': line.split(':')[1].strip(),
                'type': '待检测',
                'https': '待检测'
            } for line in text.split('\n') if ':' in line
        ]
    },
    'freeproxylist': {
        'url': 'https://free-proxy-list.net/',
        'type': 'web',
        'parser': 'table.table tbody tr',
        'extractor': lambda row: {
            'ip': row.find_all('td')[0].get_text() if len(row.find_all('td')) > 0 else None,
            'port': row.find_all('td')[1].get_text() if len(row.find_all('td')) > 1 else None,
            'type': 'SOCKS5' if 'socks' in (
                row.find_all('td')[4].get_text().lower() if len(row.find_all('td')) > 4 else '') else 'HTTP',
            'https': '支持' if 'yes' in (
                row.find_all('td')[6].get_text().lower() if len(row.find_all('td')) > 6 else '') else '不支持'
        }
    },
    'proxy_list_plus': {
        'url': 'https://list.proxylistplus.com/Fresh-HTTP-Proxy-List-{page}',
        'pages': 2,  # 减少页数以提高性能
        'type': 'web',
        'parser': 'table.bg tr.cells',
        'extractor': lambda row: {
            'ip': row.find_all('td')[1].get_text(),
            'port': row.find_all('td')[2].get_text(),
            'type': row.find_all('td')[6].get_text().upper(),  # 统一大写
            'https': '支持' if 'yes' in row.find_all('td')[5].get_text().lower() else '不支持'
        }
    },
    'geonode': {
        'url': 'https://proxylist.geonode.com/api/proxy-list?limit=100&page={page}',
        'pages': 2,  # 减少页数以提高性能
        'type': 'api',
        'extractor': lambda data: [
            {
                'ip': item['ip'],
                'port': item['port'],
                'type': item['protocols'][0].upper() if item.get('protocols') else '待检测',
                'https': '支持' if 'https' in item.get('protocols', []) else '不支持'
            } for item in data.get('data', [])  # 确保 'data' 存在
        ]
    },
    '89ip': {
        'url': 'https://www.89ip.cn/index_{page}.html',
        'pages': 2,  # 减少页数以提高性能
        'type': 'web',
        'parser': 'table.layui-table tbody tr',
        'extractor': lambda row: {
            'ip': row.find_all('td')[0].get_text().strip(),
            'port': row.find_all('td')[1].get_text().strip(),
            'type': 'HTTP',  # 默认 HTTP，后续检测
            'https': '待检测'
        }
    },
    'proxyscrape': {
        'url': 'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
        'type': 'api',
        'extractor': lambda text: [
            {
                'ip': line.split(':')[0],
                'port': line.split(':')[1].strip(),
                'type': 'HTTP',  # 默认 HTTP，后续检测
                'https': '待检测'
            } for line in text.split('\n') if ':' in line
        ]
    },
    'sslproxies': {
        'url': 'https://www.sslproxies.org/',
        'type': 'web',
        'parser': 'table.table tbody tr',
        'extractor': lambda row: {
            'ip': row.find_all('td')[0].get_text() if len(row.find_all('td')) > 0 else None,
            'port': row.find_all('td')[1].get_text() if len(row.find_all('td')) > 1 else None,
            'type': 'HTTPS',  # 该源明确为 SSL 代理
            'https': '支持'
        }
    }
}

# 异步函数：检测地区
async def detect_region_async(session, ip, rate_limiter):
    """异步检测IP地区信息，使用限速器控制请求频率"""
    # 获取限速许可
    await rate_limiter.acquire()
    
    max_retries = 3
    api_url = f"https://apimobile.meituan.com/locate/v2/ip/loc?rgeo=true&ip={ip}"
    
    for retry in range(max_retries):
        try:
            async with session.get(api_url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                response.raise_for_status()
                resp = await response.text()
                rgeo = json.loads(resp).get('data', {}).get('rgeo', {})
                return f"{rgeo.get('country', '未知')}/{rgeo.get('province', '未知')}/{rgeo.get('city', '未知')}"
        except Exception as e:
            print(f"检测 IP {ip} 地区信息失败 (尝试 {retry + 1}/{max_retries}): {e}")
            if retry < max_retries - 1:
                await asyncio.sleep(1)  # 稍作等待后重试
    
    return "未知"

# 异步函数：检测代理类型和HTTPS支持
async def detect_proxy_type_and_https_async(session, proxy_address):
    """异步检测代理类型和HTTPS支持情况"""
    # 分割IP和端口
    ip = proxy_address.split(':')[0]
    detected_type = "未知"
    https_support = "不支持"  # 默认不支持

    test_urls_http_https = [
        ('http://httpbin.org/ip', 'HTTP'),
        ('https://httpbin.org/ip', 'HTTPS')  # HTTPS 类型的代理也应该能访问 HTTPS 网站
    ]

    # 尝试 HTTP/HTTPS
    for url, p_type_candidate in test_urls_http_https:
        try:
            # 对于 HTTP/HTTPS 代理，aiohttp 的 proxy 参数格式为 http://user:pass@host:port
            proxy_url = f"http://{proxy_address}"  # 假设是 HTTP/HTTPS 代理
            async with session.get(url, proxy=proxy_url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status == 200:
                    detected_type = p_type_candidate  # 如果能访问 HTTP，则为 HTTP；如果能访问 HTTPS，则为 HTTPS
                    if p_type_candidate == 'HTTPS':  # 如果能通过 HTTPS 代理访问 HTTPS 网站
                        https_support = "支持"
                    # 如果是 HTTP 代理，还需要额外测试 HTTPS 支持
                    elif detected_type == 'HTTP':
                        try:
                            async with session.get('https://httpbin.org/ip', proxy=proxy_url, timeout=aiohttp.ClientTimeout(total=10)) as https_res:
                                if https_res.status == 200:
                                    https_support = "支持"  # HTTP 代理也支持转发 HTTPS 请求
                        except:
                            pass  # HTTP 代理访问 HTTPS 失败，则 https_support 保持 "不支持"
                    return detected_type, https_support  # 一旦成功，立即返回
        except (aiohttp.ClientError, asyncio.TimeoutError):
            pass  # 继续尝试下一个或 SOCKS

    # 尝试 SOCKS5
    socks_connector = None  # 初始化变量，便于后面关闭资源
    socks_session = None    # 初始化变量，便于后面关闭资源
    try:
        # aiohttp-socks 使用 ProxyConnector
        socks_connector = aiohttp_socks.ProxyConnector.from_url(f'socks5://{proxy_address}')
        socks_session = aiohttp.ClientSession(connector=socks_connector)
        # 首先测试 HTTP 目标，确认 SOCKS5 连通性
        async with socks_session.get('http://httpbin.org/ip', timeout=aiohttp.ClientTimeout(total=5)) as response:
            if response.status == 200:
                detected_type = "SOCKS5"
                # SOCKS5 代理默认认为可以处理 HTTPS 流量，但仍需确认
                try:
                    async with socks_session.get('https://httpbin.org/ip', timeout=aiohttp.ClientTimeout(total=5)) as https_response:
                        if https_response.status == 200:
                            https_support = "支持"
                except (aiohttp.ClientError, asyncio.TimeoutError, Exception):
                    https_support = "不支持"  # SOCKS5 访问 HTTPS 目标失败
                
                # 确保在函数返回前关闭会话和连接器
                if socks_session:
                    await socks_session.close()
                if socks_connector and not socks_connector.closed:
                    await socks_connector.close()
                    
                return detected_type, https_support
    except (aiohttp.ClientError, aiohttp_socks.ProxyError, asyncio.TimeoutError, Exception):
        pass
    finally:
        # 确保资源总是被释放
        if socks_session:
            await socks_session.close()
        if socks_connector and not socks_connector.closed:
            await socks_connector.close()

    return detected_type, https_support

# 异步函数：验证代理可用性
async def validate_proxy_async(session, proxy_details, semaphore, check_type_https=True):
    """验证代理可用性，并根据需要检测代理类型和HTTPS支持"""
    async with semaphore:
        proxy_address = f"{proxy_details['ip']}:{proxy_details['port']}"
        proxy_type = proxy_details.get('type', '未知').lower()  # 获取类型，转小写
        test_url_http = 'http://httpbin.org/ip'  # 通用测试目标
        test_url_https = 'https://httpbin.org/ip'  # HTTPS测试目标
        timeout_val = aiohttp.ClientTimeout(total=5)  # 减少超时时间，提高效率

        # 保存初始类型以便比较
        initial_type = proxy_type
        detected_type = "未知"
        https_support = "不支持"
        
        # 验证流程简化：根据初始类型确定验证顺序
        validation_order = []
        
        # 优先验证明确指定的类型
        if initial_type == "socks5":
            validation_order = ["socks5"]
        elif initial_type == "https":
            validation_order = ["https", "http"]
        elif initial_type == "http":
            validation_order = ["http", "https"]
        else:
            # 未知类型，尝试各种方式
            validation_order = ["http", "https", "socks5"] if check_type_https else ["http"]
            
        # 按优先级验证
        for check_type in validation_order:
            if check_type == "socks5":
                # 尝试SOCKS5验证
                temp_socks_connector = None
                temp_socks_session = None
                try:
                    temp_socks_connector = aiohttp_socks.ProxyConnector.from_url(f"socks5://{proxy_address}")
                    temp_socks_session = aiohttp.ClientSession(connector=temp_socks_connector)
                    async with temp_socks_session.get(test_url_http, timeout=timeout_val) as response:
                        if response.status == 200:
                            detected_type = "SOCKS5"
                            
                            # 如果需要检测HTTPS支持
                            if check_type_https:
                                try:
                                    async with temp_socks_session.get(test_url_https, timeout=timeout_val) as https_response:
                                        if https_response.status == 200:
                                            https_support = "支持"
                                except (aiohttp.ClientError, asyncio.TimeoutError, Exception):
                                    pass  # HTTPS不支持，保持默认值
                            
                            # 验证成功，设置结果并返回
                            proxy_details['validated'] = True
                            proxy_details['type'] = detected_type
                            proxy_details['https'] = https_support
                            proxy_details['last_check'] = datetime.now().isoformat()
                            proxy_details['region'] = proxy_details.get('region', '未知')
                            print(f"代理 {proxy_address} (SOCKS5) 验证通过，HTTPS: {https_support if check_type_https else '未检测'}")
                            
                            # 确保手动关闭会话和连接器
                            if temp_socks_session:
                                await temp_socks_session.close()
                            if temp_socks_connector and not temp_socks_connector.closed:
                                await temp_socks_connector.close()
                                
                            return proxy_details
                except (aiohttp.ClientError, aiohttp_socks.ProxyError, asyncio.TimeoutError, Exception):
                    # 如果初始类型明确是SOCKS5但验证失败，就不继续尝试了
                    if initial_type == "socks5":
                        print(f"代理 {proxy_address} (SOCKS5) 验证失败")
                        # 确保资源释放
                        if temp_socks_session:
                            await temp_socks_session.close()
                        if temp_socks_connector and not temp_socks_connector.closed:
                            await temp_socks_connector.close()
                        return None
                finally:
                    # 确保资源总是被释放
                    if temp_socks_session:
                        await temp_socks_session.close()
                    if temp_socks_connector and not temp_socks_connector.closed:
                        await temp_socks_connector.close()
                
            elif check_type == "http":
                # 尝试HTTP验证
                proxy_url = f"http://{proxy_address}"
                try:
                    async with session.get(test_url_http, proxy=proxy_url, timeout=timeout_val) as response:
                        if response.status == 200:
                            detected_type = "HTTP"
                            
                            # 如果需要检测HTTPS支持
                            if check_type_https:
                                try:
                                    async with session.get(test_url_https, proxy=proxy_url, timeout=timeout_val) as https_response:
                                        if https_response.status == 200:
                                            https_support = "支持"
                                            # 如果支持HTTPS，考虑将类型更新为HTTPS
                                            if initial_type == "https":
                                                detected_type = "HTTPS"
                                except (aiohttp.ClientError, asyncio.TimeoutError, Exception):
                                    pass  # HTTPS不支持，保持默认值
                            
                            # 验证成功，设置结果并返回
                            proxy_details['validated'] = True
                            proxy_details['type'] = detected_type
                            proxy_details['https'] = https_support
                            proxy_details['last_check'] = datetime.now().isoformat()
                            proxy_details['region'] = proxy_details.get('region', '未知')
                            print(f"代理 {proxy_address} ({detected_type}) 验证通过，HTTPS: {https_support if check_type_https else '未检测'}")
                            return proxy_details
                except (aiohttp.ClientError, asyncio.TimeoutError, Exception):
                    # HTTP验证失败，继续尝试其他方式
                    pass
                
            elif check_type == "https" and check_type_https:
                # 尝试HTTPS验证
                proxy_url = f"http://{proxy_address}"
                try:
                    async with session.get(test_url_https, proxy=proxy_url, timeout=timeout_val) as response:
                        if response.status == 200:
                            # 验证成功，设置结果并返回
                            proxy_details['validated'] = True
                            proxy_details['type'] = "HTTPS"
                            proxy_details['https'] = "支持"
                            proxy_details['last_check'] = datetime.now().isoformat()
                            proxy_details['region'] = proxy_details.get('region', '未知')
                            print(f"代理 {proxy_address} (HTTPS) 验证通过")
                            return proxy_details
                except (aiohttp.ClientError, asyncio.TimeoutError, Exception):
                    # HTTPS验证失败，继续尝试其他方式
                    pass
        
        # 所有方式都验证失败
        print(f"代理 {proxy_address} 验证失败")
        return None

# 辅助函数：为代理检测地区信息
async def detect_region_for_proxy(session, proxy, rate_limiter, semaphore):
    """为代理检测地区信息"""
    async with semaphore:
        proxy_address = f"{proxy['ip']}:{proxy['port']}"
        try:
            proxy['region'] = await detect_region_async(session, proxy['ip'], rate_limiter)
            print(f"代理 {proxy_address} 地区检测结果: {proxy['region']}")
        except Exception as e:
            print(f"检测代理 {proxy_address} 地区信息时发生异常: {e}")
            proxy['region'] = "未知"
        return proxy

# 同步函数：获取代理列表
def get_proxies_from_site(site_name):
    """同步方式从指定站点获取代理列表"""
    config = SITE_CONFIGS[site_name]
    all_proxies_from_site = []
    session = requests.Session()
    session.headers.update({'User-Agent': ua.random})
    
    try:
        for page in range(1, config.get('pages', 1) + 1):
            headers = {'User-Agent': ua.random}
            url = config['url'].format(page=page) if '{page}' in config['url'] else config['url']
            print(f"正在从 {site_name} 第 {page} 页爬取代理: {url}")
            
            try:
                response = session.get(url, headers=headers, timeout=20)  # 设置超时
                response.raise_for_status()  # 确保请求成功
                
                if config['type'] == 'api':
                    if site_name in ['proxy_scdn', 'proxyscrape']:  # 这些API直接返回文本
                        response_text = response.text
                        proxies = config['extractor'](response_text)
                    else:  # 其他API返回JSON
                        try:
                            data = response.json()
                            proxies = config['extractor'](data)
                        except json.JSONDecodeError:
                            print(f"警告：{site_name} 第 {page} 页返回的JSON数据格式有误，跳过此页。")
                            continue
                else:  # 'web'
                    response_text = response.text
                    soup = BeautifulSoup(response_text, 'html.parser')  # 或者 'lxml'
                    rows = soup.select(config['parser'])
                    proxies = []
                    for row in rows:
                        try:
                            extracted = config['extractor'](row)
                            if extracted.get('ip') and extracted.get('port'):  # 确保核心字段存在
                                proxies.append(extracted)
                        except Exception as e_extract:
                            print(f"警告: {site_name} 第 {page} 页解析行失败: {e_extract}")

                # 统一处理提取到的代理，确保 ip 和 port 存在
                valid_extracted_proxies = []
                for p in proxies:
                    if p and p.get('ip') and p.get('port'):
                        # 确保类型和https字段存在，如果源没有提供，则设为待检测
                        p.setdefault('type', '待检测')
                        p.setdefault('https', '待检测')
                        p.setdefault('region', '未知')
                        p.setdefault('last_check', datetime.now().isoformat())
                        valid_extracted_proxies.append(p)

                all_proxies_from_site.extend(valid_extracted_proxies)
                print(f"从 {site_name} 第 {page} 页获取到 {len(valid_extracted_proxies)} 个代理。")
                
            except (requests.RequestException, Exception) as e_page:
                print(f"{site_name} 第 {page} 页爬取失败: {e_page}")
            
            if config.get('pages', 1) > 1:  # 如果有多页，则在页间稍作停留
                time.sleep(1)  # 同步休眠
    
    except Exception as e_site:  # 捕获站点级别的其他错误
        print(f"{site_name} 同步爬取过程中发生严重错误: {e_site}")
    
    return all_proxies_from_site

# 主异步函数：爬取和验证代理
async def scrape_and_validate_async(check_region=True, check_type_https=True):
    """爬取并验证代理，返回验证通过的代理列表"""
    print("开始爬取和验证代理...")
    
    # 使用aiohttp会话和地区API限速器
    async with aiohttp.ClientSession() as session:
        region_limiter = RegionAPIRateLimiter(REGION_API_QPS)

        # 步骤 1: 同步爬取代理
        print("正在从各源站爬取代理...")
        all_proxies_raw = []

        for site_name in SITE_CONFIGS:
            try:
                site_proxies = get_proxies_from_site(site_name)
                if site_proxies:
                    print(f"从 {site_name} 获取到 {len(site_proxies)} 个原始代理")
                    all_proxies_raw.extend(site_proxies)
                else:
                    print(f"站点 {site_name} 未返回任何代理。")
            except Exception as e:
                print(f"站点 {site_name} 爬取时发生异常: {e}")

        # 步骤 2: 去重
        unique_proxies_list = []
        seen_proxies = set()
        for p_proxy in all_proxies_raw:
            if p_proxy and p_proxy.get('ip') and p_proxy.get('port'):
                key = f"{p_proxy['ip']}:{p_proxy['port']}"
                if key not in seen_proxies:
                    seen_proxies.add(key)
                    unique_proxies_list.append(p_proxy)
        print(f"共获取到 {len(unique_proxies_list)} 个唯一代理")

        if not unique_proxies_list:
            print("未能获取到任何代理，返回空列表。")
            return []

        # 步骤 3: 验证代理可用性
        print("正在验证代理可用性...")
        processing_semaphore = asyncio.Semaphore(CONCURRENT_LIMIT)
        validation_tasks = []
        
        for proxy_item in unique_proxies_list:
            if not isinstance(proxy_item, dict):
                continue
            
            validation_tasks.append(
                asyncio.create_task(
                    validate_proxy_async(session, proxy_item.copy(), processing_semaphore, check_type_https)
                )
            )
        
        # 收集验证通过的代理
        valid_proxies = []
        for result in await asyncio.gather(*validation_tasks, return_exceptions=True):
            if isinstance(result, Exception):
                print(f"代理验证过程中发生异常: {result}")
            elif result and result.get('validated'):
                valid_proxies.append(result)
        
        print(f"验证完成，共有 {len(valid_proxies)} 个代理可用。")
        
        if not valid_proxies:
            print("没有找到可用的代理，返回空列表。")
            return []
        
        # 步骤 4: 为可用代理检测地区信息
        if check_region:
            print("正在为有效代理添加地区信息...")
            region_tasks = []
            
            for proxy in valid_proxies:
                if proxy.get('region') in [None, '', '未知']:
                    region_tasks.append(
                        asyncio.create_task(
                            detect_region_for_proxy(session, proxy, region_limiter, processing_semaphore)
                        )
                    )
            
            # 等待所有地区检测任务完成
            if region_tasks:
                region_success_count = 0
                for result in await asyncio.gather(*region_tasks, return_exceptions=True):
                    if not isinstance(result, Exception) and result and result.get('region') and result['region'] != "未知":
                        region_success_count += 1
                
                print(f"地区检测完成，成功检测 {region_success_count} 个代理的地区信息。")
        
        return valid_proxies

# 更新KV存储中的代理列表
async def update_proxies_kv(env, check_region=True):
    """更新Cloudflare KV中的代理列表"""
    try:
        print("开始更新代理列表...")
        # 获取并验证代理
        valid_proxies = await scrape_and_validate_async(check_region=check_region)
        
        if not valid_proxies:
            print("没有找到有效的代理，尝试保留现有代理数据")
            return
        
        print(f"准备存储 {len(valid_proxies)} 个有效代理")
        
        # 将有效代理转换为 JSON 字符串
        proxies_json = json.dumps(valid_proxies, ensure_ascii=False, indent=2)
        
        # 将代理数据写入本地文件
        output_path = os.path.join(os.path.dirname(__file__), 'worker', 'public', 'proxies.json')
        try:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(proxies_json)
            print(f"代理数据已保存到本地文件: {output_path}")
        except Exception as e:
            print(f"保存到本地文件时出错: {e}")
            
        print("代理列表更新完成")
        return valid_proxies
        
    except Exception as e:
        print(f"更新代理列表时出错: {e}")
        return None

# 主函数：定时更新代理
async def main():
    """主函数，定时更新代理"""
    failure_count = 0
    max_failures = 5  # 最大连续失败次数
    
    while True:
        try:
            # 尝试更新代理
            print(f"开始更新代理 ({time.strftime('%Y-%m-%d %H:%M:%S')})")
            result = await update_proxies_kv(None, check_region=True)
            
            if result:
                # 成功更新，重置失败计数
                failure_count = 0
                print(f"代理更新成功，共 {len(result)} 个有效代理")
            else:
                # 更新失败但没有抛出异常
                failure_count += 1
                print(f"代理更新未返回有效结果，这是第 {failure_count} 次连续失败")
                
            # 检查连续失败次数
            if failure_count >= max_failures:
                print(f"警告: 已连续 {failure_count} 次更新失败，将重试间隔缩短为 10 分钟")
                await asyncio.sleep(600)  # 10分钟后重试
            else:
                print(f"将在 {CHECK_INTERVAL} 秒后再次更新代理列表")
                await asyncio.sleep(CHECK_INTERVAL)
                
        except Exception as e:
            failure_count += 1
            print(f"定时更新过程中发生错误 ({failure_count}/{max_failures}): {e}")
            
            # 根据失败次数调整重试间隔
            if failure_count >= max_failures:
                retry_interval = 600  # 10分钟
            else:
                retry_interval = 60  # 1分钟
                
            print(f"将在 {retry_interval} 秒后重试")
            await asyncio.sleep(retry_interval)

# 程序入口
if __name__ == "__main__":
    # 检查命令行参数
    if len(sys.argv) > 1 and sys.argv[1] == '--once':
        # 只运行一次
        print("单次更新模式")
        asyncio.run(update_proxies_kv(None, check_region=True))
    else:
        # 定时运行
        print("定时更新模式，将每隔一段时间自动更新代理列表")
        asyncio.run(main())
