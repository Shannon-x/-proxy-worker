#!/usr/bin/env python3
"""
设置定时更新代理的脚本
支持Linux (cron) 和 Windows (计划任务)
"""
import sys
import os
import platform
import subprocess
import argparse
from datetime import datetime

# 获取脚本所在目录的绝对路径
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def setup_linux_cron(interval_minutes=60):
    """在Linux系统上设置cron任务"""
    # 获取update_proxies.py的绝对路径
    update_script = os.path.join(SCRIPT_DIR, 'update_proxies.py')
    python_path = sys.executable
    
    # 构建cron表达式，每interval_minutes分钟执行一次
    cron_expression = f"*/{interval_minutes} * * * * {python_path} {update_script}"
    
    # 临时保存当前crontab
    temp_cron_file = os.path.join(SCRIPT_DIR, 'temp_crontab')
    try:
        # 获取当前crontab
        subprocess.run(['crontab', '-l'], stdout=open(temp_cron_file, 'w'), stderr=subprocess.PIPE)
        
        # 读取当前crontab并检查是否已存在相同任务
        with open(temp_cron_file, 'r') as f:
            current_crontab = f.read()
        
        if update_script in current_crontab:
            print(f"已存在更新代理的cron任务，将更新为每{interval_minutes}分钟执行一次")
            # 删除旧任务
            lines = current_crontab.split('\n')
            lines = [line for line in lines if update_script not in line]
            current_crontab = '\n'.join(lines)
        
        # 添加新任务
        new_crontab = current_crontab.strip() + f"\n{cron_expression}\n"
        
        # 写入新crontab
        with open(temp_cron_file, 'w') as f:
            f.write(new_crontab)
        
        # 应用新crontab
        subprocess.run(['crontab', temp_cron_file])
        print(f"成功设置cron任务，每{interval_minutes}分钟执行一次代理更新")
        
    except Exception as e:
        print(f"设置cron任务失败: {e}")
    finally:
        # 清理临时文件
        if os.path.exists(temp_cron_file):
            os.remove(temp_cron_file)

def setup_windows_task(interval_minutes=60):
    """在Windows系统上设置计划任务"""
    task_name = "ProxyUpdater"
    update_script = os.path.join(SCRIPT_DIR, 'update_proxies.py')
    python_path = sys.executable
    
    # 删除可能存在的旧任务
    try:
        subprocess.run(['schtasks', '/delete', '/tn', task_name, '/f'], stderr=subprocess.PIPE)
    except:
        pass
    
    # 创建新任务，每interval_minutes分钟执行一次
    try:
        subprocess.run([
            'schtasks', '/create', '/tn', task_name, '/tr',
            f'"{python_path}" "{update_script}"',
            '/sc', 'minute', '/mo', str(interval_minutes),
            '/st', datetime.now().strftime('%H:%M')
        ])
        print(f"成功设置Windows计划任务，每{interval_minutes}分钟执行一次代理更新")
    except Exception as e:
        print(f"设置Windows计划任务失败: {e}")

def setup_daemon():
    """将程序设置为后台守护进程（适用于所有系统）"""
    update_script = os.path.join(SCRIPT_DIR, 'update_proxies.py')
    python_path = sys.executable
    
    try:
        # 使用--daemon参数启动守护进程
        subprocess.Popen([python_path, update_script, '--daemon'])
        print("已成功启动代理更新守护进程")
    except Exception as e:
        print(f"启动守护进程失败: {e}")

def main():
    parser = argparse.ArgumentParser(description='设置代理更新定时任务')
    parser.add_argument('--method', choices=['cron', 'task', 'daemon'], default='daemon',
                      help='设置方法: cron (Linux), task (Windows), daemon (所有系统)')
    parser.add_argument('--interval', type=int, default=60,
                      help='更新间隔(分钟)')
    
    args = parser.parse_args()
    
    if args.method == 'daemon':
        setup_daemon()
    elif args.method == 'cron':
        if platform.system() != 'Linux':
            print("cron方法仅适用于Linux系统")
            return
        setup_linux_cron(args.interval)
    elif args.method == 'task':
        if platform.system() != 'Windows':
            print("task方法仅适用于Windows系统")
            return
        setup_windows_task(args.interval)

if __name__ == "__main__":
    main()
