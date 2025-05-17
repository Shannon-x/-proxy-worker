#!/usr/bin/env bash
# deploy.sh - 自动部署代理Worker和配置代理更新服务的脚本

# 确保脚本在出错时终止
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 无颜色

echo -e "${BLUE}=== 代理IP Worker一键部署脚本 ===${NC}"

# 检查Python版本
check_python() {
  if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
  elif command -v python &> /dev/null; then
    PY_VER=$(python --version 2>&1 | awk '{print $2}' | cut -d. -f1)
    if [ "$PY_VER" -ge 3 ]; then
      PYTHON_CMD="python"
    else
      echo -e "${RED}错误: 需要Python 3.7+版本${NC}"
      exit 1
    fi
  else
    echo -e "${RED}错误: 未找到Python${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}使用Python解释器: $(which $PYTHON_CMD) - $($PYTHON_CMD --version)${NC}"
}

# 安装依赖
install_dependencies() {
  echo -e "${BLUE}安装Python依赖...${NC}"
  $PYTHON_CMD -m pip install --upgrade pip
  $PYTHON_CMD -m pip install -r requirements.txt
  echo -e "${GREEN}Python依赖安装完成${NC}"
  
  echo -e "${BLUE}安装Node.js依赖...${NC}"
  if [ -d "worker" ]; then
    cd worker
    npm install
    cd ..
    echo -e "${GREEN}Node.js依赖安装完成${NC}"
  else
    echo -e "${YELLOW}警告: 未找到worker目录，跳过Node.js依赖安装${NC}"
  fi
}

# 运行代理爬取测试
test_proxy_scraping() {
  echo -e "${BLUE}测试代理爬取功能...${NC}"
  $PYTHON_CMD test_proxy_scraper.py
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}代理爬取测试成功${NC}"
  else
    echo -e "${YELLOW}警告: 代理爬取测试未完全成功，但将继续部署${NC}"
  fi
}

# 设置定时更新
setup_scheduler() {
  echo -e "${BLUE}配置代理定时更新服务...${NC}"
  
  # 询问更新方式
  echo "请选择更新方式:"
  echo "1) 守护进程 (推荐)"
  echo "2) Cron 任务"
  read -p "请输入选项 [1]: " SCHEDULER_OPTION
  
  SCHEDULER_OPTION=${SCHEDULER_OPTION:-1}
  
  if [ "$SCHEDULER_OPTION" == "1" ]; then
    # 配置为后台守护进程
    echo -e "${BLUE}配置为守护进程模式...${NC}"
    $PYTHON_CMD setup_scheduler.py --method daemon
    
    # 创建systemd服务（如果是root用户）
    if [ "$(id -u)" -eq 0 ]; then
      echo -e "${BLUE}创建systemd服务...${NC}"
      cat > /etc/systemd/system/proxy-updater.service << EOL
[Unit]
Description=Proxy List Updater Service
After=network.target

[Service]
ExecStart=${PYTHON_CMD} $(pwd)/auto_proxy_scraper.py
WorkingDirectory=$(pwd)
Restart=always
User=$(logname)

[Install]
WantedBy=multi-user.target
EOL
      systemctl daemon-reload
      systemctl enable proxy-updater.service
      systemctl start proxy-updater.service
      echo -e "${GREEN}systemd服务已创建并启动${NC}"
    else
      echo -e "${YELLOW}提示: 非root用户无法创建systemd服务，将使用普通守护进程模式${NC}"
    fi
  else
    # 配置为Cron任务
    echo -e "${BLUE}配置为Cron任务...${NC}"
    read -p "请输入更新间隔(分钟) [60]: " UPDATE_INTERVAL
    UPDATE_INTERVAL=${UPDATE_INTERVAL:-60}
    $PYTHON_CMD setup_scheduler.py --method cron --interval $UPDATE_INTERVAL
  fi
  
  echo -e "${GREEN}定时更新服务已配置${NC}"
}

# 执行Wrangler部署
deploy_worker() {
  echo -e "${BLUE}部署Worker到Cloudflare...${NC}"
  
  if [ -d "worker" ]; then
    cd worker
    
    # 检查wrangler是否已安装
    if ! command -v wrangler &> /dev/null; then
      echo -e "${YELLOW}未找到wrangler，尝试通过npm安装...${NC}"
      npm install -g wrangler
    fi
    
    # 执行部署
    echo -e "${BLUE}正在部署Worker...${NC}"
    wrangler publish
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Worker部署成功${NC}"
    else
      echo -e "${RED}Worker部署失败${NC}"
      cd ..
      return 1
    fi
    
    cd ..
  else
    echo -e "${RED}错误: 未找到worker目录${NC}"
    return 1
  fi
  
  return 0
}

# 主函数
main() {
  check_python
  install_dependencies
  test_proxy_scraping
  
  # 自动设置为守护进程模式
  echo -e "${BLUE}配置为守护进程模式...${NC}"
  $PYTHON_CMD setup_scheduler.py --method daemon
  
  # 创建systemd服务（如果是root用户）
  if [ "$(id -u)" -eq 0 ]; then
    echo -e "${BLUE}创建systemd服务...${NC}"
    cat > /etc/systemd/system/proxy-updater.service << EOL
[Unit]
Description=Proxy List Updater Service
After=network.target

[Service]
ExecStart=${PYTHON_CMD} $(pwd)/auto_proxy_scraper.py
WorkingDirectory=$(pwd)
Restart=always
User=$(logname)

[Install]
WantedBy=multi-user.target
EOL
    systemctl daemon-reload
    systemctl enable proxy-updater.service
    systemctl start proxy-updater.service
    echo -e "${GREEN}systemd服务已创建并启动${NC}"
  else
    echo -e "${YELLOW}提示: 非root用户无法创建systemd服务，将使用普通守护进程模式${NC}"
    # 直接执行脚本作为后台进程
    nohup $PYTHON_CMD auto_proxy_scraper.py > proxy_updater.log 2>&1 &
    echo -e "${GREEN}代理更新后台进程已启动，PID: $!${NC}"
  fi
  
  # 自动部署Worker
  deploy_worker
  
  echo -e "${GREEN}=== 部署完成! ===${NC}"
  echo -e "${YELLOW}提示: Worker已设置为每10分钟自动更新代理列表${NC}"
  echo -e "${YELLOW}提示: 您可以在浏览器中访问Worker URL查看代理列表${NC}"
}

# 执行主函数
main
