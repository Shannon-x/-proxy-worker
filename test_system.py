#!/usr/bin/env python3
"""
全面测试代理系统的各个组件，确保它们能正常协同工作
"""
import os
import sys
import json
import time
import argparse
import asyncio
import requests
from datetime import datetime

# 为了确保本地导入正常工作，添加当前目录到搜索路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 导入自定义模块
from auto_proxy_scraper import detect_region_async, RegionAPIRateLimiter
import aiohttp

# 常量定义
PROXIES_PATH = os.path.join(os.path.dirname(__file__), 'worker', 'public', 'proxies.json')
WORKER_URL = None  # 将在运行时确定，默认为本地开发服务器

async def test_region_detection():
    """测试地区检测功能"""
    print("\n=== 测试地区检测功能 ===")
    
    test_ips = [
        "8.8.8.8",         # Google DNS
        "1.1.1.1",         # Cloudflare DNS
        "114.114.114.114", # 114 DNS
        "223.5.5.5"        # 阿里 DNS
    ]
    
    region_limiter = RegionAPIRateLimiter(qps=5)
    
    async with aiohttp.ClientSession() as session:
        for ip in test_ips:
            print(f"正在检测 IP: {ip}")
            region = await detect_region_async(session, ip, region_limiter)
            print(f"  → 地区结果: {region}")
            await asyncio.sleep(1)  # 稍作暂停，避免请求过于频繁

async def test_proxy_file():
    """测试代理文件格式和内容"""
    print("\n=== 测试代理文件 ===")
    
    if not os.path.exists(PROXIES_PATH):
        print(f"代理文件不存在: {PROXIES_PATH}")
        return False
    
    try:
        with open(PROXIES_PATH, 'r', encoding='utf-8') as f:
            proxies = json.load(f)
        
        if not isinstance(proxies, list):
            print("错误: 代理数据不是列表格式")
            return False
            
        if not proxies:
            print("警告: 代理列表为空")
            return False
            
        print(f"代理文件格式正确，包含 {len(proxies)} 个代理")
        
        # 检查所需字段
        required_fields = ['ip', 'port', 'type', 'https', 'region', 'last_check']
        all_fields_present = True
        
        for i, proxy in enumerate(proxies[:5]):  # 只检查前5个，避免输出过多
            missing_fields = [field for field in required_fields if field not in proxy]
            if missing_fields:
                print(f"代理 #{i+1} 缺少字段: {', '.join(missing_fields)}")
                all_fields_present = False
        
        if all_fields_present:
            print("所有必需字段均已存在")
        
        # 统计信息
        regions = {}
        types = {}
        https = {}
        validated_count = 0
        
        for proxy in proxies:
            # 区域统计
            region = proxy.get('region', '未知')
            regions[region] = regions.get(region, 0) + 1
            
            # 类型统计
            proxy_type = proxy.get('type', '未知')
            types[proxy_type] = types.get(proxy_type, 0) + 1
            
            # HTTPS支持统计
            https_support = proxy.get('https', '未知')
            https[https_support] = https.get(https_support, 0) + 1
            
            # 验证状态统计
            if proxy.get('validated') is True:
                validated_count += 1
        
        # 输出统计结果
        print("\n代理类型分布:")
        for t, count in types.items():
            print(f"  - {t}: {count} ({count/len(proxies)*100:.1f}%)")
        
        print("\nHTTPS支持分布:")
        for h, count in https.items():
            print(f"  - {h}: {count} ({count/len(proxies)*100:.1f}%)")
        
        print("\n验证状态:")
        print(f"  - 已验证: {validated_count} ({validated_count/len(proxies)*100:.1f}%)")
        print(f"  - 未验证: {len(proxies) - validated_count} ({(len(proxies) - validated_count)/len(proxies)*100:.1f}%)")
        
        print("\n地区信息分布 (前10个):")
        sorted_regions = sorted(regions.items(), key=lambda x: x[1], reverse=True)
        for region, count in sorted_regions[:10]:
            print(f"  - {region}: {count} ({count/len(proxies)*100:.1f}%)")
        
        # 检查最后更新时间
        latest_update = max([datetime.fromisoformat(p.get('last_check', '2000-01-01T00:00:00')) 
                            for p in proxies if p.get('last_check')])
        print(f"\n最新更新时间: {latest_update}")
        
        # 检查时间差距
        now = datetime.now()
        time_diff = now - latest_update
        print(f"距今时间: {time_diff}")
        
        if time_diff.days > 1:
            print("警告: 最新代理更新时间超过1天")
        
        return True
            
    except Exception as e:
        print(f"读取或解析代理文件失败: {e}")
        return False

def test_start_worker():
    """启动本地Worker服务器用于测试"""
    print("\n=== 启动Worker开发服务器 ===")
    
    try:
        # 检查是否已有wrangler进程
        import subprocess
        import psutil
        
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            if proc.info['name'] and 'wrangler' in proc.info['name'].lower():
                print(f"发现已存在的wrangler进程: {proc.info['pid']}")
                return True
            
            if proc.info['cmdline'] and any('wrangler' in cmd.lower() for cmd in proc.info['cmdline']):
                print(f"发现已存在的wrangler进程: {proc.info['pid']}")
                return True
        
        # 未找到已有进程，启动新的Worker
        print("启动新的Worker开发服务器...")
        worker_dir = os.path.join(os.path.dirname(__file__), 'worker')
        os.chdir(worker_dir)
        
        # 使用nohup启动，这样即使脚本终止，服务器仍继续运行
        subprocess.Popen(
            "nohup npx wrangler dev --port 8787 &", 
            shell=True, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE
        )
        
        print("Worker开发服务器已启动，等待服务就绪...")
        time.sleep(5)  # 给服务器一些启动时间
        return True
        
    except Exception as e:
        print(f"启动Worker服务器失败: {e}")
        return False

def test_worker_api(worker_url=None):
    """测试Worker API是否正常工作"""
    print("\n=== 测试Worker API ===")
    
    global WORKER_URL
    WORKER_URL = worker_url or "http://localhost:8787"
    
    # 测试根URL
    try:
        print(f"测试Worker根URL: {WORKER_URL}")
        response = requests.get(WORKER_URL, timeout=10)
        if response.status_code == 200:
            print("✓ Worker根URL访问正常")
        else:
            print(f"✗ Worker根URL返回异常状态码: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ 无法访问Worker: {e}")
        return False
    
    # 测试代理API
    try:
        print(f"测试代理API: {WORKER_URL}/proxies.json")
        # 添加缓存控制头和随机参数，确保获取最新数据
        headers = {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
        params = {'t': int(time.time()), 'r': hash(str(time.time()))}
        
        response = requests.get(f"{WORKER_URL}/proxies.json", 
                               headers=headers, 
                               params=params, 
                               timeout=10)
        
        if response.status_code == 200:
            proxies = response.json()
            if isinstance(proxies, list):
                print(f"✓ 成功获取代理列表，共 {len(proxies)} 个代理")
                
                # 比较从文件读取的代理和从API获取的代理
                try:
                    with open(PROXIES_PATH, 'r', encoding='utf-8') as f:
                        file_proxies = json.load(f)
                    
                    if len(file_proxies) == len(proxies):
                        print("✓ API返回的代理数量与文件一致")
                    else:
                        print(f"✗ API返回的代理数量({len(proxies)})与文件({len(file_proxies)})不一致")
                except Exception as e:
                    print(f"✗ 读取文件代理进行比较时出错: {e}")
            else:
                print(f"✗ API返回的不是有效的代理列表: {proxies}")
                return False
        else:
            print(f"✗ 代理API返回异常状态码: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ 访问代理API时出错: {e}")
        return False
    
    return True

def main():
    """主函数，运行全面测试"""
    parser = argparse.ArgumentParser(description='测试代理系统')
    parser.add_argument('--worker-url', help='Worker URL，默认为http://localhost:8787')
    parser.add_argument('--skip-worker', action='store_true', help='跳过启动Worker')
    args = parser.parse_args()
    
    print("=== 代理系统全面测试开始 ===")
    print(f"当前时间: {datetime.now()}")
    
    # 测试代理文件
    file_test_result = asyncio.run(test_proxy_file())
    
    # 测试地区检测
    asyncio.run(test_region_detection())
    
    # 启动和测试Worker
    if not args.skip_worker:
        worker_started = test_start_worker()
    else:
        worker_started = True
        print("跳过Worker启动步骤")
    
    if worker_started:
        api_test_result = test_worker_api(args.worker_url)
    else:
        api_test_result = False
    
    # 总结测试结果
    print("\n=== 测试结果摘要 ===")
    print(f"代理文件测试: {'通过' if file_test_result else '失败'}")
    if not args.skip_worker:
        print(f"Worker API测试: {'通过' if api_test_result else '失败'}")
    
    if file_test_result and (args.skip_worker or api_test_result):
        print("\n✅ 所有测试通过！")
        return 0
    else:
        print("\n❌ 测试失败，请查看详细输出")
        return 1

if __name__ == "__main__":
    sys.exit(main())
