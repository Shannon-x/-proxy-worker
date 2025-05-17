#!/usr/bin/env python3
"""
全功能测试脚本，用于验证代理爬虫、验证和更新流程
"""
import asyncio
import json
import os
import sys
import time
from auto_proxy_scraper import scrape_and_validate_async, update_proxies_kv

async def test_system():
    """全功能测试"""
    print("===== 代理系统功能测试 =====")
    start_time = time.time()
    
    # 步骤 1: 测试代理爬取和验证
    print("\n1. 测试代理爬取和验证功能...")
    proxies = await scrape_and_validate_async(check_region=True, check_type_https=True)
    
    if not proxies:
        print("ERROR: 爬取代理失败，未能获取任何有效代理")
        return False
    
    print(f"成功爬取 {len(proxies)} 个有效代理，耗时 {time.time() - start_time:.1f} 秒")
    
    # 步骤 2: 测试代理更新到文件
    print("\n2. 测试代理更新到文件...")
    update_start = time.time()
    
    result = await update_proxies_kv(None, check_region=True)
    if not result:
        print("ERROR: 更新代理到文件失败")
        return False
    
    output_path = os.path.join(os.path.dirname(__file__), 'worker', 'public', 'proxies.json')
    if not os.path.exists(output_path):
        print(f"ERROR: 输出文件 {output_path} 不存在")
        return False
    
    with open(output_path, 'r', encoding='utf-8') as f:
        saved_proxies = json.load(f)
    
    if len(saved_proxies) != len(proxies):
        print(f"WARNING: 保存的代理数量 ({len(saved_proxies)}) 与爬取的代理数量 ({len(proxies)}) 不一致")
    
    print(f"成功更新代理到文件，耗时 {time.time() - update_start:.1f} 秒")
    
    # 步骤 3: 分析代理数据质量
    print("\n3. 代理数据质量分析...")
    
    # 代理类型分布
    type_stats = {}
    for p in saved_proxies:
        p_type = p.get('type', '未知')
        type_stats[p_type] = type_stats.get(p_type, 0) + 1
    
    print("代理类型分布:")
    for t, count in sorted(type_stats.items()):
        print(f"  {t}: {count} ({count/len(saved_proxies)*100:.1f}%)")
    
    # HTTPS支持情况
    https_stats = {"支持": 0, "不支持": 0, "待检测": 0}
    for p in saved_proxies:
        p_https = p.get('https', '待检测')
        https_stats[p_https] = https_stats.get(p_https, 0) + 1
    
    print("\nHTTPS支持情况:")
    for h, count in https_stats.items():
        print(f"  {h}: {count} ({count/len(saved_proxies)*100:.1f}%)")
    
    # 地区分布
    region_stats = {}
    for p in saved_proxies:
        region = p.get('region', '未知')
        if '/' in region:
            country = region.split('/')[0]
        else:
            country = region
        region_stats[country] = region_stats.get(country, 0) + 1
    
    print("\n地区分布 (前10):")
    for r, count in sorted(region_stats.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {r}: {count} ({count/len(saved_proxies)*100:.1f}%)")
    
    # 总结
    print(f"\n测试完成! 总耗时: {time.time() - start_time:.1f} 秒")
    print(f"成功获取并保存了 {len(saved_proxies)} 个有效代理")
    return True

if __name__ == "__main__":
    success = asyncio.run(test_system())
    sys.exit(0 if success else 1)
