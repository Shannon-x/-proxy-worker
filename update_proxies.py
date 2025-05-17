#!/usr/bin/env python3
import asyncio
import os
import json
import sys
import time
import argparse
from datetime import datetime
from auto_proxy_scraper import scrape_and_validate_async

# 最大重试次数
MAX_RETRIES = 3
# 代理存储路径
PROXIES_PATH = os.path.join(os.path.dirname(__file__), 'worker', 'public', 'proxies.json')

async def main(force_update=False, check_region=True):
    """更新代理数据到Worker中"""
    print(f"开始更新代理列表 - {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 获取现有代理数据
    existing_proxies = []
    if os.path.exists(PROXIES_PATH):
        try:
            with open(PROXIES_PATH, 'r', encoding='utf-8') as f:
                existing_proxies = json.load(f)
            if existing_proxies:
                print(f"读取到现有代理数据，共 {len(existing_proxies)} 个")
            
                # 检查是否有需要更新地区信息的代理
                need_region_update = [p for p in existing_proxies if not p.get('region') or p.get('region') == '未知' or p.get('region') == '未检测']
                if need_region_update and not force_update:
                    print(f"发现 {len(need_region_update)} 个代理需要更新地区信息")
                    print("将只对这些代理进行地区信息更新，而不是重新爬取所有代理")
                    # TODO: 实现仅更新地区信息的功能
                    # 由于当前实现限制，我们仍然需要执行完整的爬取和验证
        except Exception as e:
            print(f"读取现有代理数据出错: {e}")
    
    # 重试机制
    for retry in range(MAX_RETRIES):
        try:
            # 爬取并验证代理
            valid_proxies = await scrape_and_validate_async(check_region=check_region, check_type_https=True)
            
            if not valid_proxies:
                print(f"没有找到有效代理 (尝试 {retry+1}/{MAX_RETRIES})")
                if retry < MAX_RETRIES - 1:
                    print("等待30秒后重试...")
                    await asyncio.sleep(30)
                continue
            
            # 如果新采集的代理数量明显少于现有代理，可能是网络问题导致的采集不全
            if existing_proxies and len(valid_proxies) < len(existing_proxies) * 0.5 and not force_update:
                print(f"警告: 新采集的代理数量 ({len(valid_proxies)}) 明显少于现有代理 ({len(existing_proxies)})")
                
                # 如果不是最后一次重试，尝试再次爬取
                if retry < MAX_RETRIES - 1:
                    print("等待30秒后重试爬取...")
                    await asyncio.sleep(30)
                    continue
                
                # 这是最后一次重试，合并数据
                print("已达到最大重试次数，将合并新旧代理数据")
                
                # 按IP:PORT创建代理映射以便合并
                existing_map = {f"{p['ip']}:{p['port']}": p for p in existing_proxies}
                new_map = {f"{p['ip']}:{p['port']}": p for p in valid_proxies}
                
                # 将新代理添加到现有代理中，并更新重叠的条目
                for key, proxy in new_map.items():
                    if key in existing_map:
                        # 对于同样的代理，优先使用最新验证的数据
                        if proxy.get('last_check'):
                            existing_time = datetime.fromisoformat(existing_map[key].get('last_check', '2000-01-01'))
                            new_time = datetime.fromisoformat(proxy.get('last_check'))
                            
                            if new_time > existing_time:
                                existing_map[key] = proxy
                                print(f"更新了代理 {key} 的最新验证数据")
                        
                        # 如果新代理有地区信息但现有代理没有，更新地区信息
                        if proxy.get('region') and proxy.get('region') not in ['未知', '未检测', ''] and \
                           (not existing_map[key].get('region') or existing_map[key].get('region') in ['未知', '未检测', '']):
                            existing_map[key]['region'] = proxy.get('region')
                            print(f"更新了代理 {key} 的地区信息: {proxy.get('region')}")
                    else:
                        # 新的代理，直接添加
                        existing_map[key] = proxy
                
                # 将合并后的数据转回列表
                valid_proxies = list(existing_map.values())
                print(f"合并后共有 {len(valid_proxies)} 个代理")
            
            # 确保目标目录存在
            os.makedirs(os.path.dirname(PROXIES_PATH), exist_ok=True)
            
            # 将有效代理保存到文件
            with open(PROXIES_PATH, "w", encoding="utf-8") as f:
                json.dump(valid_proxies, f, ensure_ascii=False, indent=2)
                
            print(f"成功更新了 {len(valid_proxies)} 个代理到 {PROXIES_PATH}")
            
            # 打印一些统计信息
            type_stats = {}
            https_stats = {"支持": 0, "不支持": 0, "待检测": 0}
            region_stats = {"有地区信息": 0, "未知地区": 0}
            
            for proxy in valid_proxies:
                # 代理类型统计
                proxy_type = proxy.get('type', '未知')
                type_stats[proxy_type] = type_stats.get(proxy_type, 0) + 1
                
                # HTTPS支持统计
                https = proxy.get('https', '待检测')
                https_stats[https] = https_stats.get(https, 0) + 1
                
                # 地区信息统计
                if proxy.get('region') and proxy.get('region') not in ['未知', '未检测', '']:
                    region_stats["有地区信息"] += 1
                else:
                    region_stats["未知地区"] += 1
            
            print("代理类型统计:")
            for t, count in type_stats.items():
                print(f"  - {t}: {count} ({count/len(valid_proxies)*100:.1f}%)")
            
            print("HTTPS支持统计:")
            for h, count in https_stats.items():
                print(f"  - {h}: {count} ({count/len(valid_proxies)*100:.1f}%)")
                
            print("地区信息统计:")
            for r, count in region_stats.items():
                print(f"  - {r}: {count} ({count/len(valid_proxies)*100:.1f}%)")
            
            return valid_proxies
            
        except Exception as e:
            print(f"更新过程中发生错误 (尝试 {retry+1}/{MAX_RETRIES}): {e}")
            if retry < MAX_RETRIES - 1:
                print("等待30秒后重试...")
                await asyncio.sleep(30)
    
    print(f"经过 {MAX_RETRIES} 次尝试后仍然失败，无法更新代理列表")
    return None

if __name__ == "__main__":
    # 解析命令行参数
    parser = argparse.ArgumentParser(description='更新代理列表')
    parser.add_argument('--daemon', action='store_true', help='作为守护进程运行')
    parser.add_argument('--force', action='store_true', help='强制更新，不考虑现有数据')
    parser.add_argument('--skip-region', action='store_true', help='跳过地区检测')
    args = parser.parse_args()

    if args.daemon:
        print("作为守护进程运行...")
        # 执行auto_proxy_scraper.py的定时更新功能
        import subprocess
        subprocess.Popen([sys.executable, "auto_proxy_scraper.py"])
        sys.exit(0)
    else:
        # 单次运行
        asyncio.run(main(force_update=args.force, check_region=not args.skip_region))