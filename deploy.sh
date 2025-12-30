#!/bin/bash

# AI工具大全 - 阿里云部署脚本
# 使用方法：./deploy.sh

set -e

echo "================================"
echo "  AI工具大全 - 阿里云部署"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 权限运行此脚本${NC}"
    echo "使用: sudo ./deploy.sh"
    exit 1
fi

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker 未安装！${NC}"
    echo "请先安装 Docker: https://docs.docker.com/engine/install/"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose 未安装！${NC}"
    echo "请先安装 Docker Compose"
    exit 1
fi

echo -e "${GREEN}✓ Docker 环境检查通过${NC}"
echo ""

# 检查环境变量文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}警告: .env 文件不存在${NC}"
    echo "正在从 .env.example 创建..."
    cp .env.example .env
    echo -e "${RED}请编辑 .env 文件，配置必要的环境变量！${NC}"
    echo "编辑完成后，重新运行此脚本"
    exit 1
fi

if [ ! -f .env.docker ]; then
    echo -e "${YELLOW}警告: .env.docker 文件不存在${NC}"
    echo "请创建 .env.docker 文件并配置数据库密码"
    cat > .env.docker << 'EOF'
# MySQL 配置
MYSQL_ROOT_PASSWORD=change_this_root_password
MYSQL_DATABASE=aitools
MYSQL_USER=aitools_user
MYSQL_PASSWORD=change_this_password

# 从 .env 继承其他变量
EOF
    echo -e "${RED}已创建 .env.docker 模板，请修改密码后重新运行！${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 环境变量配置检查通过${NC}"
echo ""

# 检查域名配置
echo "请输入你的域名（例如：aidaquanji.com）："
read DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}域名不能为空！${NC}"
    exit 1
fi

echo ""
echo "正在更新 Nginx 配置中的域名..."
sed -i "s/aidaquanji.com/$DOMAIN/g" nginx/conf.d/default.conf
echo -e "${GREEN}✓ 域名配置更新完成${NC}"
echo ""

# 询问是否已准备 SSL 证书
echo "是否已准备好 SSL 证书？(y/n)"
read HAS_SSL

if [ "$HAS_SSL" = "y" ]; then
    if [ ! -f nginx/ssl/fullchain.pem ] || [ ! -f nginx/ssl/privkey.pem ]; then
        echo -e "${RED}错误: 证书文件不存在！${NC}"
        echo "请将证书文件放置在 nginx/ssl/ 目录："
        echo "  - nginx/ssl/fullchain.pem"
        echo "  - nginx/ssl/privkey.pem"
        exit 1
    fi
    echo -e "${GREEN}✓ SSL 证书检查通过${NC}"
else
    echo -e "${YELLOW}警告: 未配置 SSL 证书${NC}"
    echo "网站将仅支持 HTTP 访问"
    echo "建议使用阿里云 SSL 证书或 Let's Encrypt"
    # 临时禁用 HTTPS 配置
    sed -i 's/listen 443/#listen 443/g' nginx/conf.d/default.conf
    sed -i 's/ssl_/#ssl_/g' nginx/conf.d/default.conf
fi

echo ""
echo "================================"
echo "开始部署..."
echo "================================"
echo ""

# 停止现有服务（如果存在）
if docker compose ps | grep -q "Up"; then
    echo "停止现有服务..."
    docker compose down
fi

# 构建并启动服务
echo "构建 Docker 镜像..."
docker compose --env-file .env.docker build

echo ""
echo "启动服务..."
docker compose --env-file .env.docker up -d

echo ""
echo "等待数据库启动..."
sleep 10

# 检查服务状态
echo ""
echo "检查服务状态..."
docker compose ps

echo ""
echo "================================"
echo "部署完成！"
echo "================================"
echo ""
echo -e "${GREEN}网站访问地址:${NC}"
if [ "$HAS_SSL" = "y" ]; then
    echo "  https://$DOMAIN"
    echo "  https://www.$DOMAIN"
else
    echo "  http://$DOMAIN"
    echo "  http://www.$DOMAIN"
fi

echo ""
echo -e "${YELLOW}后续步骤:${NC}"
echo "1. 配置域名 DNS 解析（A 记录指向本服务器 IP）"
echo "2. 配置阿里云安全组，开放 80 和 443 端口"
echo "3. 访问网站并注册管理员账号"
echo "4. 查看日志: docker compose logs -f"
echo ""

# 显示日志
echo "按 Ctrl+C 退出日志查看"
sleep 3
docker compose logs -f
