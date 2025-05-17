import sys
import asyncio
import aiohttp
import json
import time # 仅用于同步代码中的 time.sleep，异步代码使用 asyncio.sleep
import requests # 用于同步HTTP请求
from datetime import datetime
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
import aiohttp_socks # 用于 SOCKS5 代理

# 在Windows平台上设置SelectorEventLoop，解决aiodns需要SelectorEventLoop的问题
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# 全局常量
CONCURRENT_LIMIT = 100 # 并发限制，自己控制，window开多了或报错
REGION_API_QPS = 100   # 每秒最多查询地区API的次数

# 地区API请求限速器类
class RegionAPIRateLimiter:
    """地区API请求限速器，控制地区API的请求频率"""
    
    def __init__(self, qps):
        """
        初始化限速器
        
        Args:
            qps: 每秒允许的最大查询次数
        """
        self.qps = qps
        self.last_request_time = 0
        self.lock = asyncio.Lock()  # 用于同步访问last_request_time
    
    async def acquire(self):
        """
        获取请求许可，必要时进行等待
        """
        async with self.lock:
            current_time = time.time()
            time_since_last_request = current_time - self.last_request_time
            wait_time = max(0, 1/self.qps - time_since_last_request)
            if wait_time > 0:
                await asyncio.sleep(wait_time)
            self.last_request_time = time.time()
            return True

# 初始化配置 (与原脚本保持一致)
# 使用 fallback UA，避免 fake-useragent 在 CI 环境下加载失败
ua = UserAgent(fallback='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36')
SITE_CONFIGS = {
	'proxy_scdn': {
		'url': 'https://proxy.scdn.io/text.php',
		'type': 'api',
		'parser': 'pre', # 'pre' 表示直接处理文本，不是标准的解析器选择器
		'extractor': lambda text: [
			{
				'ip': line.split(':')[0],
				'port': line.split(':')[1].strip(),
				'type': '待检测', # 异步版本中会检测
				'https': '待检测' # 异步版本中会检测
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
		'pages': 5,
		'type': 'web',
		'parser': 'table.bg tr.cells',
		'extractor': lambda row: {
			'ip': row.find_all('td')[1].get_text(),
			'port': row.find_all('td')[2].get_text(),
			'type': row.find_all('td')[6].get_text().upper(), # 统一大写
			'https': '支持' if 'yes' in row.find_all('td')[5].get_text().lower() else '不支持'
		}
	},
	'geonode': {
		'url': 'https://proxylist.geonode.com/api/proxy-list?limit=100&page={page}',
		'pages': 5,
		'type': 'api',
		'extractor': lambda data: [
			{
				'ip': item['ip'],
				'port': item['port'],
				'type': item['protocols'][0].upper() if item.get('protocols') else '待检测',
				'https': '支持' if 'https' in item.get('protocols', []) else '不支持'
			} for item in data.get('data', []) # 确保 'data' 存在
		]
	},
	'89ip': {
		'url': 'https://www.89ip.cn/index_{page}.html',
		'pages': 5,
		'type': 'web',
		'parser': 'table.layui-table tbody tr',
		'extractor': lambda row: {
			'ip': row.find_all('td')[0].get_text().strip(),
			'port': row.find_all('td')[1].get_text().strip(),
			'type': 'HTTP', # 默认 HTTP，后续检测
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
				'type': 'HTTP', # 默认 HTTP，后续检测
				'https': '待检测' # 假设支持，后续验证
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
			'type': 'HTTPS', # 该源明确为 SSL 代理
			'https': '支持'
		}
	}
}

# 异步函数：检测地区
async def detect_region_async(
    session: aiohttp.ClientSession, 
    ip: str,
    rate_limiter: RegionAPIRateLimiter
) -> str:
    """
    异步检测IP地区信息，使用限速器控制请求频率
    
    Args:
        session: aiohttp会话对象
        ip: 要检测的IP地址
        rate_limiter: 地区API限速器
        
    Returns:
        str: 地区信息，格式为"国家/省份/城市"
    """
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
async def detect_proxy_type_and_https_async(
    session: aiohttp.ClientSession,
    proxy_address: str
) -> tuple[str, str]:
    """
    异步检测代理类型和HTTPS支持情况
    
    Args:
        session: aiohttp会话对象
        proxy_address: 代理地址字符串，格式为"ip:port"
        
    Returns:
        tuple[str, str]: 代理类型和HTTPS支持情况
    """
    # 分割IP和端口但不再保存未使用的port变量
    ip = proxy_address.split(':')[0]
    detected_type = "未知"
    https_support = "不支持" # 默认不支持

    test_urls_http_https = [
        ('http://httpbin.org/ip', 'HTTP'),
        ('https://httpbin.org/ip', 'HTTPS') # HTTPS 类型的代理也应该能访问 HTTPS 网站
    ]

    # 尝试 HTTP/HTTPS
    for url, p_type_candidate in test_urls_http_https:
        try:
            # 对于 HTTP/HTTPS 代理，aiohttp 的 proxy 参数格式为 http://user:pass@host:port
            proxy_url = f"http://{proxy_address}" # 假设是 HTTP/HTTPS 代理
            async with session.get(url, proxy=proxy_url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status == 200:
                    detected_type = p_type_candidate # 如果能访问 HTTP，则为 HTTP；如果能访问 HTTPS，则为 HTTPS
                    if p_type_candidate == 'HTTPS': # 如果能通过 HTTPS 代理访问 HTTPS 网站
                        https_support = "支持"
                    # 如果是 HTTP 代理，还需要额外测试 HTTPS 支持
                    elif detected_type == 'HTTP':
                        try:
                            async with session.get('https://httpbin.org/ip', proxy=proxy_url, timeout=aiohttp.ClientTimeout(total=10)) as https_res:
                                if https_res.status == 200:
                                    https_support = "支持" # HTTP 代理也支持转发 HTTPS 请求
                        except:
                            pass # HTTP 代理访问 HTTPS 失败，则 https_support 保持 "不支持"
                    return detected_type, https_support # 一旦成功，立即返回
        except (aiohttp.ClientError, asyncio.TimeoutError):
            pass # 继续尝试下一个或 SOCKS

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
                    https_support = "不支持" # SOCKS5 访问 HTTPS 目标失败
                
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
async def validate_proxy_async(
    session: aiohttp.ClientSession,
    proxy_details: dict,
    semaphore: asyncio.Semaphore,
    check_type_https: bool = True
) -> dict | None:
    """
    验证代理可用性，并根据需要检测代理类型和HTTPS支持
    
    Args:
        session: aiohttp会话
        proxy_details: 代理详情字典
        semaphore: 并发控制信号量
        check_type_https: 是否检测代理类型和HTTPS支持
        
    Returns:
        dict: 验证通过的代理详情
        None: 验证失败
    """
    async with semaphore:
        proxy_address = f"{proxy_details['ip']}:{proxy_details['port']}"
        proxy_type = proxy_details.get('type', '未知').lower() # 获取类型，转小写
        test_url_http = 'http://httpbin.org/ip' # 通用测试目标
        test_url_https = 'https://httpbin.org/ip' # HTTPS测试目标
        timeout_val = aiohttp.ClientTimeout(total=5) # 减少超时时间，提高效率

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
                            proxy_details['validated_ok'] = True
                            proxy_details['type'] = detected_type
                            proxy_details['https'] = https_support
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
                            proxy_details['validated_ok'] = True
                            proxy_details['type'] = detected_type
                            proxy_details['https'] = https_support
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
                            proxy_details['validated_ok'] = True
                            proxy_details['type'] = "HTTPS"
                            proxy_details['https'] = "支持"
                            print(f"代理 {proxy_address} (HTTPS) 验证通过")
                            return proxy_details
                except (aiohttp.ClientError, asyncio.TimeoutError, Exception):
                    # HTTPS验证失败，继续尝试其他方式
                    pass
        
        # 所有方式都验证失败
        print(f"代理 {proxy_address} 验证失败")
        return None

# 辅助函数：为代理检测地区信息
async def detect_region_for_proxy(
    session: aiohttp.ClientSession,
    proxy: dict,
    rate_limiter: RegionAPIRateLimiter,
    semaphore: asyncio.Semaphore
) -> dict:
    """
    为代理检测地区信息
    
    Args:
        session: aiohttp会话对象
        proxy: 代理详情字典
        rate_limiter: 地区API限速器
        semaphore: 并发控制信号量
        
    Returns:
        dict: 更新后的代理详情字典
    """
    async with semaphore:
        proxy_address = f"{proxy['ip']}:{proxy['port']}"
        try:
            proxy['region'] = await detect_region_async(session, proxy['ip'], rate_limiter)
            print(f"代理 {proxy_address} 地区检测结果: {proxy['region']}")
        except Exception as e:
            print(f"检测代理 {proxy_address} 地区信息时发生异常: {e}")
            proxy['region'] = "未知"
        return proxy

# 保存代理
def save_proxies(proxies_to_save: list, format_type: str, filename: str, only_ip: bool = False):
    if not proxies_to_save:
        print(f"没有代理可保存到 {filename}")
        return

    if format_type == 'json':
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(proxies_to_save, f, ensure_ascii=False, indent=4)
    elif format_type == 'txt':
        with open(filename, 'w', encoding='utf-8') as f:
            if only_ip:
                for proxy in proxies_to_save:
                    f.write(f"{proxy['ip']}:{proxy['port']}\n")
            else:
                f.write("地区 | 类型 | HTTPS | 代理地址\n")
                f.write("-" * 60 + "\n") # 调整分隔线长度
                for p_item in proxies_to_save:
                    addr = f"{p_item['ip']}:{p_item['port']}"
                    # 使用 .get() 并提供默认值，以防某些键不存在
                    region = p_item.get('region', '未知')
                    ptype = p_item.get('type', '未知')
                    https_s = p_item.get('https', '未知')
                    f.write(f"{region} | {ptype} | {https_s} | {addr}\n")
    print(f"代理已保存到 {filename}")

# 同步函数：获取代理列表
def get_proxies_from_site(site_name: str) -> list[dict]:
    """
    同步方式从指定站点获取代理列表
    
    Args:
        site_name: 代理源站点名称，必须在SITE_CONFIGS中定义
        
    Returns:
        list[dict]: 代理列表，每个代理是一个字典
    """
    config = SITE_CONFIGS[site_name]
    all_proxies_from_site = []
    session = requests.Session()
    session.headers.update({'User-Agent': ua.random})
    
    try:
        for page in range(1, config.get('pages', 1) + 1):
            headers = {'User-Agent': ua.random}
            url = config['url'].format(page=page) if '{page}' in config['url'] else config['url']
            print(f"正在同步爬取 {site_name} 第 {page} 页: {url}")
            
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
                            print(f"警告: {site_name} 第 {page} 页解析行失败: {e_extract}, Row: {str(row)[:100]}")

                # 统一处理提取到的代理，确保 ip 和 port 存在
                valid_extracted_proxies = []
                for p in proxies:
                    if p and p.get('ip') and p.get('port'):
                        # 确保类型和https字段存在，如果源没有提供，则设为待检测
                        p.setdefault('type', '待检测')
                        p.setdefault('https', '待检测')
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

# 主异步函数
async def main_async():
    print("=" * 50)
    print("多源代理 IP 爬虫 v3.0 (异步优化版)")
    print("=" * 50)

    # 使用aiohttp会话和地区API限速器
    async with aiohttp.ClientSession() as session:
        region_limiter = RegionAPIRateLimiter(REGION_API_QPS)

        # 步骤 1: 同步爬取代理
        print("\n正在同步爬取代理源...")
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
        print(f"\n共获取到 {len(unique_proxies_list)} 个唯一代理")

        if not unique_proxies_list:
            print("未能获取到任何代理，程序即将退出。")
            return

        # 步骤 3: 询问用户需要多少代理
        while True:
            input_num_str = input(f"请输入你需要的代理数量 (可用: {len(unique_proxies_list)}, 直接回车代表全部): ")


                break
            try:
                num_to_select = int(input_num_str)
                if 0 < num_to_select <= len(unique_proxies_list):
                    selected_proxies_for_processing = unique_proxies_list[:num_to_select]
                    break
                elif num_to_select > len(unique_proxies_list):
                    print(f"输入的数量超过了可用代理数量 ({len(unique_proxies_list)})，请重新输入。")
                else:
                    print("请输入一个正整数。")
            except ValueError:
                print("输入无效，请输入一个有效的整数或直接回车。")
        
        print(f"已选择 {len(selected_proxies_for_processing)} 个代理进行后续处理。")

        # 生成时间戳用于文件名
        current_time_str = datetime.now().strftime("%Y%m%d%H%M%S")

        # 步骤 4: 保存未过滤的代理 IP
        while True:
            format_choice_unfiltered = input("请选择未过滤代理 IP 的输出格式 (json/txt): ").strip().lower()
            if format_choice_unfiltered in ['json', 'txt']:
                unfiltered_filename_path = f'unfiltered_proxies_{current_time_str}.{format_choice_unfiltered}'
                save_proxies(selected_proxies_for_processing, format_choice_unfiltered, unfiltered_filename_path, False)
                break
            else:
                print("输入无效，请输入 'json' 或 'txt'。")

        # 步骤 5: 询问检测选项
        check_region_flag = input("是否需要检测代理 IP 的地区信息？(y/n, 默认n): ").strip().lower() == 'y'
        check_type_https_flag = input("是否需要检测代理类型和HTTPS支持？(y/n, 默认y): ").strip().lower() != 'n'

        # 步骤 6: 验证代理可用性
        print("\n正在异步验证代理可用性...")
        processing_semaphore = asyncio.Semaphore(CONCURRENT_LIMIT)
        validation_tasks = []
        
        for proxy_item in selected_proxies_for_processing:
            if not isinstance(proxy_item, dict):
                print(f"发现无效的代理项: {proxy_item}, 跳过验证。")
                continue
            
            validation_tasks.append(
                asyncio.create_task(
                    validate_proxy_async(session, proxy_item.copy(), processing_semaphore, check_type_https_flag)
                )
            )
        
        # 收集验证通过的代理
        valid_proxies = []
        for result in await asyncio.gather(*validation_tasks, return_exceptions=True):
            if isinstance(result, Exception):
                print(f"代理验证过程中发生异常: {result}")
            elif result and result.get('validated_ok'):
                valid_proxies.append(result)
        
        print(f"验证完成，共有 {len(valid_proxies)} 个代理可用。")
        
        if not valid_proxies:
            print("没有找到可用的代理，程序结束。")
            return
        
        # 步骤 7: 为可用代理检测地区信息
        if check_region_flag:
            print("\n正在为有效代理添加地区信息...")
            region_tasks = []
            
            for proxy in valid_proxies:
                if proxy.get('region') is None:
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
        
        # 步骤 8: 保存有效代理
        print(f"\n处理完成，找到 {len(valid_proxies)} 个有效代理。")
        
        if valid_proxies:
            while True:
                format_choice_valid = input("请选择有效代理 IP 的输出格式 (json/txt): ").strip().lower()
                if format_choice_valid in ['json', 'txt']:
                    output_filename_path = f'valid_proxies_{current_time_str}.{format_choice_valid}'
                    only_ip_output = False
                    if format_choice_valid == 'txt':
                        only_ip_output = input("是否仅输出代理 IP (ip:port)，每行一个？(y/n, 默认n): ").strip().lower() == 'y'
                    
                    save_proxies(valid_proxies, format_choice_valid, output_filename_path, only_ip_output)
                    break
                else:
                    print("输入无效，请输入 'json' 或 'txt'。")
        else:
            print("没有找到可用的有效代理。")

    print("\n代理爬取和验证任务完成。")

# 新增：异步爬取并验证代理，返回有效代理列表
async def scrape_and_validate():
    """
    异步爬取所有代理源并验证代理可用性，返回有效代理列表
    """
    all_proxies_raw = []
    for site_name in SITE_CONFIGS:
        try:
            site_proxies = get_proxies_from_site(site_name)
            all_proxies_raw.extend(site_proxies)
        except Exception as e:
            print(f"爬取 {site_name} 失败: {e}")

    # 去重
    unique = {}
    for p in all_proxies_raw:
        key = f"{p['ip']}:{p['port']}"
        if key not in unique:
            unique[key] = p

    # 异步验证代理可用性
    valid = []
    semaphore = asyncio.Semaphore(CONCURRENT_LIMIT)
    async with aiohttp.ClientSession() as session:
        tasks = [
            asyncio.create_task(validate_proxy_async(session, p.copy(), semaphore, True))
            for p in unique.values()
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for res in results:
            if isinstance(res, Exception):
                print(f"验证时出错: {res}")
            elif res and res.get('validated_ok'):
                valid.append(res)

    # 执行完代理验证后进行地区检测
    from proxy_scraper import RegionAPIRateLimiter, detect_region_async
    rate_limiter = RegionAPIRateLimiter(REGION_API_QPS)
    async with aiohttp.ClientSession() as region_session:
        region_tasks = [
            asyncio.create_task(detect_region_async(region_session, p['ip'], rate_limiter))
            for p in valid
        ]
        regions = await asyncio.gather(*region_tasks, return_exceptions=True)
        for p, region in zip(valid, regions):
            if not isinstance(region, Exception):
                p['region'] = region
            else:
                p['region'] = '未知'
    
    return valid

# 程序入口
if __name__ == "__main__":
    asyncio.run(main_async())