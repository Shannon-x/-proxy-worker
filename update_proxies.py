#!/usr/bin/env python3
import asyncio
import os
import json
import sys
import time
from auto_proxy_scraper import scrape_and_validate_async

# 最大重试次数
MAX_RETRIES = 3
# 代理存储路径
PROXIES_PATH = os.path.join(os.path.dirname(__file__), 'worker', 'public', 'proxies.json')

async def main():
    """更新代理数据到Worker中"""
    print(f"开始更新代理列表 - {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 重试机制
    for retry in range(MAX_RETRIES):
        try:
            # 爬取并验证代理
            valid_proxies = await scrape_and_validate_async(check_region=True, check_type_https=True)
            
            if not valid_proxies:
                print(f"没有找到有效代理 (尝试 {retry+1}/{MAX_RETRIES})")
                if retry < MAX_RETRIES - 1:
                    print("等待30秒后重试...")
                    await asyncio.sleep(30)
                continue
            
            # 检查是否有现有代理数据
            existing_proxies = []
            if os.path.exists(PROXIES_PATH):
                try:
                    with open(PROXIES_PATH, 'r', encoding='utf-8') as f:
                        existing_proxies = json.load(f)
                    print(f"读取到现有代理数据，共 {len(existing_proxies)} 个")
                except Exception as e:
                    print(f"读取现有代理数据出错: {e}")
            
            # 如果新采集的代理数量明显少于现有代理，可能是网络问题导致的采集不全
            if existing_proxies and len(valid_proxies) < len(existing_proxies) * 0.5:
                print(f"警告: 新采集的代理数量 ({len(valid_proxies)}) 明显少于现有代理 ({len(existing_proxies)})")
                if retry < MAX_RETRIES - 1:
                    print("等待30秒后重试...")
                    await asyncio.sleep(30)
                    continue
                else:
                    print("已达到最大重试次数，使用现有数据")
                    valid_proxies = existing_proxies
            
            # 确保目标目录存在
            os.makedirs(os.path.dirname(PROXIES_PATH), exist_ok=True)
            
            # 将有效代理保存到文件
            with open(PROXIES_PATH, "w", encoding="utf-8") as f:
                json.dump(valid_proxies, f, ensure_ascii=False, indent=2)
                
            print(f"成功更新了 {len(valid_proxies)} 个代理到 {PROXIES_PATH}")
            
            # 打印一些统计信息
            type_stats = {}
            https_stats = {"支持": 0, "不支持": 0, "待检测": 0}
            
            for proxy in valid_proxies:
                proxy_type = proxy.get('type', '未知')
                type_stats[proxy_type] = type_stats.get(proxy_type, 0) + 1
                
                https = proxy.get('https', '待检测')
                https_stats[https] = https_stats.get(https, 0) + 1
            
            print("代理类型统计:")
            for t, count in type_stats.items():
                print(f"  - {t}: {count} ({count/len(valid_proxies)*100:.1f}%)")
            
            print("HTTPS支持统计:")
            for h, count in https_stats.items():
                print(f"  - {h}: {count} ({count/len(valid_proxies)*100:.1f}%)")
            
            return valid_proxies
            
        except Exception as e:
            print(f"更新过程中发生错误 (尝试 {retry+1}/{MAX_RETRIES}): {e}")
            if retry < MAX_RETRIES - 1:
                print("等待30秒后重试...")
                await asyncio.sleep(30)
    
    print(f"经过 {MAX_RETRIES} 次尝试后仍然失败，无法更新代理列表")
    return None

if __name__ == "__main__":
    # 检查是否为守护进程模式
    if len(sys.argv) > 1 and sys.argv[1] == '--daemon':
        print("作为守护进程运行...")
        # 执行auto_proxy_scraper.py的定时更新功能
        import subprocess
        subprocess.Popen([sys.executable, "auto_proxy_scraper.py"])
        sys.exit(0)
    else:
        # 单次运行
        asyncio.run(main())