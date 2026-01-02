#!/bin/bash

# AI工具大全 - 阿里云部署脚本
# 用途: 自动化部署到阿里云 ECS 服务器
# 使用: bash scripts/deploy.sh

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================"
echo "AI工具大全 - 阿里云部署脚本"
echo "======================================${NC}"
echo ""

# 1. 检查必要软件
echo -e "${YELLOW}[1/8] 检查必要软件...${NC}"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装${NC}"
    echo "请先安装 Docker:"
    echo "curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun"
    exit 1
else
    echo -e "${GREEN}✅ Docker 已安装${NC}"
    docker --version
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose 未安装${NC}"
    echo "请先安装 Docker Compose:"
    echo 'sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose'
    echo "sudo chmod +x /usr/local/bin/docker-compose"
    exit 1
else
    echo -e "${GREEN}✅ Docker Compose 已安装${NC}"
    docker-compose --version
fi

echo ""

# 2. 检查环境变量
echo -e "${YELLOW}[2/8] 检查环境变量...${NC}"
echo ""

if [ ! -f ".env.docker" ]; then
    echo -e "${RED}❌ .env.docker 文件不存在${NC}"
    echo "请先创建 .env.docker 文件并配置环境变量"
    exit 1
fi

# 复制环境变量文件
cp .env.docker .env
echo -e "${GREEN}✅ 环境变量已配置${NC}"
echo ""

# 3. 检查 SSL 证书
echo -e "${YELLOW}[3/8] 检查 SSL 证书...${NC}"
echo ""

if [ ! -f "nginx/ssl/fullchain.pem" ] || [ ! -f "nginx/ssl/privkey.pem" ]; then
    echo -e "${RED}❌ SSL 证书文件不完整${NC}"
    echo ""
    echo "请运行以下命令检查证书状态:"
    echo "  bash scripts/check-ssl.sh"
    echo ""
    echo "如果需要获取新证书，运行:"
    echo "  sudo certbot certonly --standalone -d aidaquanji.com -d www.aidaquanji.com --email davidliuzhibo@foxmail.com --agree-tos"
    echo ""
    echo "然后复制证书:"
    echo "  sudo cp /etc/letsencrypt/live/aidaquanji.com/fullchain.pem ./nginx/ssl/"
    echo "  sudo cp /etc/letsencrypt/live/aidaquanji.com/privkey.pem ./nginx/ssl/"
    echo "  sudo chmod 644 ./nginx/ssl/*.pem"
    echo ""
    read -p "是否已经配置好证书？继续部署 (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "部署已取消"
        exit 1
    fi
else
    echo -e "${GREEN}✅ SSL 证书文件存在${NC}"
    echo "证书有效期:"
    openssl x509 -in nginx/ssl/fullchain.pem -text -noout | grep "Not After" || true
fi
echo ""

# 4. 停止旧容器（如果存在）
echo -e "${YELLOW}[4/8] 停止旧容器...${NC}"
echo ""

if [ -f "docker-compose.prod.yml" ]; then
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    echo -e "${GREEN}✅ 旧容器已停止${NC}"
else
    docker-compose down 2>/dev/null || true
    echo -e "${GREEN}✅ 旧容器已停止${NC}"
fi
echo ""

# 5. 构建镜像
echo -e "${YELLOW}[5/8] 构建 Docker 镜像...${NC}"
echo ""

if [ -f "docker-compose.prod.yml" ]; then
    docker-compose -f docker-compose.prod.yml build --no-cache
else
    docker-compose build --no-cache
fi

echo -e "${GREEN}✅ 镜像构建完成${NC}"
echo ""

# 6. 启动容器
echo -e "${YELLOW}[6/8] 启动容器...${NC}"
echo ""

if [ -f "docker-compose.prod.yml" ]; then
    docker-compose -f docker-compose.prod.yml up -d
else
    docker-compose up -d
fi

echo -e "${GREEN}✅ 容器已启动${NC}"
echo ""

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 7. 数据库迁移
echo -e "${YELLOW}[7/8] 运行数据库迁移...${NC}"
echo ""

if [ -f "docker-compose.prod.yml" ]; then
    docker-compose -f docker-compose.prod.yml exec -T web npm run prisma:generate || true
    docker-compose -f docker-compose.prod.yml exec -T web npm run prisma:migrate deploy || true
else
    docker-compose exec -T web npm run prisma:generate || true
    docker-compose exec -T web npm run prisma:migrate deploy || true
fi

echo -e "${GREEN}✅ 数据库迁移完成${NC}"
echo ""

# 8. 检查服务状态
echo -e "${YELLOW}[8/8] 检查服务状态...${NC}"
echo ""

if [ -f "docker-compose.prod.yml" ]; then
    docker-compose -f docker-compose.prod.yml ps
else
    docker-compose ps
fi

echo ""
echo -e "${GREEN}======================================"
echo "部署完成！"
echo "======================================${NC}"
echo ""
echo "服务访问地址:"
echo "  - HTTP:  http://aidaquanji.com"
echo "  - HTTPS: https://aidaquanji.com"
echo ""
echo "查看日志:"
if [ -f "docker-compose.prod.yml" ]; then
    echo "  docker-compose -f docker-compose.prod.yml logs -f"
else
    echo "  docker-compose logs -f"
fi
echo ""
echo "管理命令:"
echo "  重启服务: docker-compose -f docker-compose.prod.yml restart"
echo "  停止服务: docker-compose -f docker-compose.prod.yml down"
echo "  查看状态: docker-compose -f docker-compose.prod.yml ps"
echo ""

# 验证网站是否可访问
echo "验证网站访问..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ HTTP 服务正常${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP 服务可能未就绪，请稍后检查${NC}"
fi

echo ""
echo -e "${GREEN}🚀 部署成功！${NC}"
echo ""
