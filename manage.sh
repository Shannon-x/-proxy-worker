#!/bin/bash
# 代理系统启动和管理脚本

# 设置颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 显示帮助信息
show_help() {
    echo -e "${YELLOW}代理系统管理脚本${NC}"
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  start           启动代理爬虫守护进程"
    echo "  stop            停止代理爬虫守护进程"
    echo "  update          立即更新代理列表（一次性运行）"
    echo "  deploy          部署Worker到Cloudflare"
    echo "  test            测试整个系统"
    echo "  dev             在开发模式下启动Worker"
    echo "  help            显示此帮助信息"
}

# 检查Python依赖
check_dependencies() {
    echo -e "${YELLOW}检查Python依赖...${NC}"
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo -e "${RED}安装依赖失败，请检查错误信息${NC}"
        exit 1
    fi
    echo -e "${GREEN}依赖检查完成${NC}"
}

# 启动爬虫守护进程
start_daemon() {
    echo -e "${YELLOW}启动代理爬虫守护进程...${NC}"
    check_dependencies
    
    # 检查是否已有进程运行
    pgrep -f "python.*auto_proxy_scraper.py" > /dev/null
    if [ $? -eq 0 ]; then
        echo -e "${RED}爬虫进程已在运行，请先停止或使用 restart 命令${NC}"
        return 1
    fi
    
    # 使用nohup启动守护进程并将输出重定向到日志文件
    nohup python3 auto_proxy_scraper.py > proxy_scraper.log 2>&1 &
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}守护进程已启动，PID: $!${NC}"
        echo -e "日志输出重定向到 proxy_scraper.log"
    else
        echo -e "${RED}启动守护进程失败${NC}"
        return 1
    fi
}

# 停止爬虫守护进程
stop_daemon() {
    echo -e "${YELLOW}停止代理爬虫守护进程...${NC}"
    pkill -f "python.*auto_proxy_scraper.py"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}守护进程已停止${NC}"
    else
        echo -e "${RED}未找到运行中的爬虫进程${NC}"
        return 1
    fi
}

# 一次性更新代理列表
update_proxies() {
    echo -e "${YELLOW}立即更新代理列表...${NC}"
    check_dependencies
    python3 update_proxies.py "$@"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}代理列表更新完成${NC}"
    else
        echo -e "${RED}代理列表更新失败${NC}"
        return 1
    fi
}

# 部署Worker到Cloudflare
deploy_worker() {
    echo -e "${YELLOW}部署Worker到Cloudflare...${NC}"
    
    # 确保Node环境正常
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}未找到npm，请安装Node.js${NC}"
        return 1
    fi
    
    # 安装Wrangler（如果需要）
    if ! command -v npx wrangler &> /dev/null; then
        echo -e "${YELLOW}正在安装Wrangler...${NC}"
        npm install -g wrangler
    fi
    
    # 进入Worker目录
    cd worker
    
    # 执行部署
    echo -e "${YELLOW}正在发布Worker...${NC}"
    npx wrangler deploy
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Worker部署成功${NC}"
    else
        echo -e "${RED}Worker部署失败${NC}"
        return 1
    fi
}

# 测试系统
test_system() {
    echo -e "${YELLOW}测试代理系统...${NC}"
    check_dependencies
    python3 test_system.py "$@"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}系统测试通过${NC}"
    else
        echo -e "${RED}系统测试失败，请检查详细输出${NC}"
        return 1
    fi
}

# 开发模式
dev_mode() {
    echo -e "${YELLOW}在开发模式下启动Worker...${NC}"
    
    # 确保Node环境正常
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}未找到npm，请安装Node.js${NC}"
        return 1
    fi
    
    # 进入Worker目录
    cd worker
    
    # 启动开发服务器
    echo -e "${YELLOW}启动开发服务器...${NC}"
    npx wrangler dev
}

# 主逻辑
case "$1" in
    start)
        start_daemon
        ;;
    stop)
        stop_daemon
        ;;
    restart)
        stop_daemon
        start_daemon
        ;;
    update)
        shift
        update_proxies "$@"
        ;;
    deploy)
        deploy_worker
        ;;
    test)
        shift
        test_system "$@"
        ;;
    dev)
        dev_mode
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}未知选项: $1${NC}"
        show_help
        exit 1
        ;;
esac

exit $?
