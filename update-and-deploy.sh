#!/bin/bash
# AI工具大全 - 更新并部署脚本（适用于已存在的项目）
# 项目路径: /opt/aitools
# 服务器IP: 8.130.157.251

set -e

echo "=================================================="
echo "AI工具大全 - 更新并部署"
echo "服务器: 8.130.157.251"
echo "项目路径: /opt/aitools"
echo "=================================================="
echo ""

# 进入项目目录
PROJECT_DIR="/opt/aitools"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ 错误: 项目目录 $PROJECT_DIR 不存在"
    exit 1
fi

cd $PROJECT_DIR
echo "✅ 已进入项目目录: $(pwd)"
echo ""

# 检查必要软件
echo "第一步：检查必要软件"
echo "--------------------------------------------------"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，正在安装..."
    curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
    sudo systemctl start docker
    sudo systemctl enable docker
    echo "✅ Docker 安装完成"
else
    echo "✅ Docker 已安装: $(docker --version)"
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，正在安装..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose 安装完成"
else
    echo "✅ Docker Compose 已安装: $(docker-compose --version)"
fi

echo ""
echo ""
echo "第二步：更新代码"
echo "--------------------------------------------------"

# 检查 Git 状态
if [ -d ".git" ]; then
    echo "检测到 Git 仓库，拉取最新代码..."

    # 显示当前分支和提交
    echo "当前分支: $(git branch --show-current)"
    echo "当前提交: $(git log -1 --oneline)"
    echo ""

    # 保存本地修改（如果有）
    if ! git diff-index --quiet HEAD --; then
        echo "⚠️  检测到本地修改，暂存中..."
        git stash push -m "Auto stash before deployment $(date +%Y%m%d_%H%M%S)"
        STASHED=1
    fi

    # 拉取最新代码
    echo "正在拉取最新代码..."
    git pull origin master || git pull origin main

    echo "✅ 代码已更新到最新版本"
    echo "最新提交: $(git log -1 --oneline)"

    if [ "$STASHED" = "1" ]; then
        echo ""
        echo "⚠️  注意: 您的本地修改已暂存"
        echo "如需恢复: git stash pop"
    fi
else
    echo "⚠️  未检测到 Git 仓库"
    echo "项目可能不是通过 Git 克隆的"
    echo "建议手动确认代码是否为最新版本"
fi

echo ""
echo ""
echo "第三步：检查 SSL 证书"
echo "--------------------------------------------------"

# 给脚本执行权限
chmod +x scripts/check-ssl.sh 2>/dev/null || true
chmod +x scripts/deploy.sh 2>/dev/null || true

# 运行 SSL 检查
if [ -f "scripts/check-ssl.sh" ]; then
    bash scripts/check-ssl.sh
else
    echo "⚠️  check-ssl.sh 脚本不存在，跳过自动检查"
    echo ""
    echo "请手动检查 SSL 证书："
    echo "  ls -la /etc/letsencrypt/live/aidaquanji.com/"
    echo "  ls -la ./nginx/ssl/"
fi

echo ""
echo ""
echo "SSL 证书配置指南："
echo "【如果证书存在但未复制】"
echo "  sudo cp /etc/letsencrypt/live/aidaquanji.com/fullchain.pem ./nginx/ssl/"
echo "  sudo cp /etc/letsencrypt/live/aidaquanji.com/privkey.pem ./nginx/ssl/"
echo "  sudo chmod 644 ./nginx/ssl/*.pem"
echo ""
echo "【如果证书不存在】"
echo "  sudo certbot certonly --standalone \\"
echo "    -d aidaquanji.com -d www.aidaquanji.com \\"
echo "    --email davidliuzhibo@foxmail.com --agree-tos"
echo "  sudo cp /etc/letsencrypt/live/aidaquanji.com/fullchain.pem ./nginx/ssl/"
echo "  sudo cp /etc/letsencrypt/live/aidaquanji.com/privkey.pem ./nginx/ssl/"
echo "  sudo chmod 644 ./nginx/ssl/*.pem"
echo ""

read -p "SSL 证书是否已配置完成? (输入 y 继续，其他键退出): " ssl_ready
if [[ ! $ssl_ready =~ ^[Yy]$ ]]; then
    echo ""
    echo "部署已暂停，请先配置 SSL 证书"
    echo ""
    echo "配置完成后，再次运行此脚本："
    echo "  cd /opt/aitools"
    echo "  bash update-and-deploy.sh"
    exit 0
fi

echo ""
echo ""
echo "第四步：部署应用"
echo "--------------------------------------------------"

if [ -f "scripts/deploy.sh" ]; then
    echo "使用自动化部署脚本..."
    bash scripts/deploy.sh
else
    echo "⚠️  deploy.sh 不存在，使用手动部署方式..."
    echo ""

    # 手动部署流程
    echo "停止旧容器..."
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || docker-compose down 2>/dev/null || true

    echo "构建镜像..."
    docker-compose -f docker-compose.prod.yml build --no-cache || docker-compose build --no-cache

    echo "启动服务..."
    docker-compose -f docker-compose.prod.yml up -d || docker-compose up -d

    echo "等待服务启动..."
    sleep 15

    echo "运行数据库迁移..."
    docker-compose -f docker-compose.prod.yml exec -T web npm run prisma:migrate deploy || true

    echo "检查服务状态..."
    docker-compose -f docker-compose.prod.yml ps || docker-compose ps
fi

echo ""
echo ""
echo "=================================================="
echo "部署完成！"
echo "=================================================="
echo ""
echo "访问网站: https://aidaquanji.com"
echo ""
echo "常用管理命令："
echo "  查看日志: docker-compose -f docker-compose.prod.yml logs -f"
echo "  查看状态: docker-compose -f docker-compose.prod.yml ps"
echo "  重启服务: docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "如遇问题，请查看日志："
echo "  docker-compose -f docker-compose.prod.yml logs --tail=100"
echo ""
