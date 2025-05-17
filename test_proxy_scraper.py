#!/usr/bin/env python3
import asyncio
import json
import time
from auto_proxy_scraper import scrape_and_validate_async

async def test_scraper():
    """测试爬虫和验证功能"""
    print("开始测试代理爬取和验证功能...")
    start_time = time.time()
    
    # 只爬取并验证少量代理用于测试
    try:
        proxies = await scrape_and_validate_async(check_region=True, check_type_https=True)
        
        if not proxies:
            print("未找到任何有效代理")
            return
        
        print(f"成功验证 {len(proxies)} 个代理，耗时 {time.time() - start_time:.2f} 秒")
        
        # 显示前5个代理的详细信息
        print("\n有效代理示例:")
        for i, proxy in enumerate(proxies[:5]):
            print(f"代理 {i+1}:")
            print(f"  IP: {proxy['ip']}")
            print(f"  端口: {proxy['port']}")
            print(f"  类型: {proxy['type']}")
            print(f"  HTTPS: {proxy['https']}")
            print(f"  地区: {proxy['region']}")
        
        # 输出统计信息
        type_count = {}
        https_count = {"支持": 0, "不支持": 0, "待检测": 0}
        region_count = {}
        
        for p in proxies:
            # 统计代理类型
            p_type = p.get('type', '未知')
            type_count[p_type] = type_count.get(p_type, 0) + 1
            
            # 统计HTTPS支持情况
            p_https = p.get('https', '待检测')
            https_count[p_https] = https_count.get(p_https, 0) + 1
            
            # 统计地区分布
            p_region = p.get('region', '未知').split('/')[0]  # 只取国家名称
            region_count[p_region] = region_count.get(p_region, 0) + 1
        
        print("\n代理类型分布:")
        for t, count in type_count.items():
            print(f"  {t}: {count} ({count/len(proxies)*100:.1f}%)")
        
        print("\nHTTPS支持情况:")
        for h, count in https_count.items():
            print(f"  {h}: {count} ({count/len(proxies)*100:.1f}%)")
        
        print("\n主要地区分布:")
        for r, count in sorted(region_count.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"  {r}: {count} ({count/len(proxies)*100:.1f}%)")
        
        # 保存测试结果到临时文件
        with open('test_proxies.json', 'w', encoding='utf-8') as f:
            json.dump(proxies, f, ensure_ascii=False, indent=2)
        print("\n已将完整代理列表保存到 test_proxies.json")
        
    except Exception as e:
        print(f"测试过程中发生错误: {e}")

if __name__ == "__main__":
    asyncio.run(test_scraper())
