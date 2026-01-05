#!/bin/bash
# AI工具大全 - 阿里云服务器部署命令清单
# 请按顺序执行每一步，遇到问题及时反馈

echo "=================================================="
echo "AI工具大全 - 阿里云服务器部署"
echo "=================================================="
echo ""

echo "第一步：检查并安装必要软件"
echo "--------------------------------------------------"
echo "检查 Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker 已安装: $(docker --version)"
else
    echo "❌ Docker 未安装"
    echo ""
    echo "请执行以下命令安装 Docker:"
    echo "curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun"
    echo "sudo systemctl start docker"
    echo "sudo systemctl enable docker"
    echo ""
    read -p "是否现在安装 Docker? (y/N): " install_docker
    if [[ $install_docker =~ ^[Yy]$ ]]; then
        curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
        sudo systemctl start docker
        sudo systemctl enable docker
        echo "✅ Docker 安装完成"
    else
        echo "请先安装 Docker 后再继续"
        exit 1
    fi
fi

echo ""
echo "检查 Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose 已安装: $(docker-compose --version)"
else
    echo "❌ Docker Compose 未安装"
    echo ""
    echo "正在安装 Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose 安装完成"
fi

echo ""
echo "检查 Git..."
if command -v git &> /dev/null; then
    echo "✅ Git 已安装: $(git --version)"
else
    echo "❌ Git 未安装，正在安装..."
    sudo apt install git -y || sudo yum install git -y
    echo "✅ Git 安装完成"
fi

echo ""
echo ""
echo "第二步：克隆项目代码"
echo "--------------------------------------------------"

# 检查是否为交互式终端
if [ -t 0 ]; then
    read -p "请输入部署目录路径 (默认: /var/www): " deploy_dir
fi

# 设置默认部署目录
if [ -z "$deploy_dir" ]; then
    deploy_dir="/var/www"
fi

echo "部署目录: $deploy_dir"

# 创建目录
sudo mkdir -p "$deploy_dir"
cd "$deploy_dir"

# 检查是否已存在项目
if [ -d "aitools" ]; then
    echo "⚠️  发现已存在的 aitools 目录"
    read -p "是否删除并重新克隆? (y/N): " remove_old
    if [[ $remove_old =~ ^[Yy]$ ]]; then
        sudo rm -rf aitools
        echo "已删除旧目录"
    else
        echo "进入现有目录..."
        cd aitools
        echo "拉取最新代码..."
        git pull origin master
        echo "✅ 代码已更新"
    fi
fi

if [ ! -d "aitools" ]; then
    echo "正在克隆项目..."
    git clone https://github.com/davidliuzhibo/ai-tools-directory.git aitools
    echo "✅ 项目克隆完成"
fi

cd aitools || exit 1
echo "当前目录: $(pwd)"

echo ""
echo ""
echo "第三步：检查 SSL 证书"
echo "--------------------------------------------------"

# 运行 SSL 检查脚本
chmod +x scripts/check-ssl.sh
bash scripts/check-ssl.sh

echo ""
echo ""
echo "根据上面的检查结果，请执行以下操作："
echo ""
echo "【情况 A】如果证书已存在但未复制到项目："
echo "sudo cp /etc/letsencrypt/live/aidaquanji.com/fullchain.pem ./nginx/ssl/"
echo "sudo cp /etc/letsencrypt/live/aidaquanji.com/privkey.pem ./nginx/ssl/"
echo "sudo chmod 644 ./nginx/ssl/*.pem"
echo ""
echo "【情况 B】如果证书不存在，需要获取新证书："
echo "sudo certbot certonly --standalone -d aidaquanji.com -d www.aidaquanji.com --email davidliuzhibo@foxmail.com --agree-tos"
echo "sudo cp /etc/letsencrypt/live/aidaquanji.com/fullchain.pem ./nginx/ssl/"
echo "sudo cp /etc/letsencrypt/live/aidaquanji.com/privkey.pem ./nginx/ssl/"
echo "sudo chmod 644 ./nginx/ssl/*.pem"
echo ""

# 检查 SSL 证书是否已配置
if [ -f "./nginx/ssl/fullchain.pem" ] && [ -f "./nginx/ssl/privkey.pem" ]; then
    echo "✅ SSL 证书已配置，继续部署..."
    ssl_ready="y"
else
    echo "⚠️  SSL 证书尚未配置到项目目录"
    # 检查是否为交互式终端
    if [ -t 0 ]; then
        read -p "SSL 证书是否已配置完成? (y/N): " ssl_ready
    else
        echo "非交互模式：请先配置 SSL 证书"
        echo "运行以下命令："
        echo "sudo cp /etc/letsencrypt/live/aidaquanji.com/fullchain.pem ./nginx/ssl/"
        echo "sudo cp /etc/letsencrypt/live/aidaquanji.com/privkey.pem ./nginx/ssl/"
        echo "sudo chmod 644 ./nginx/ssl/*.pem"
        exit 1
    fi
fi

if [[ ! $ssl_ready =~ ^[Yy]$ ]]; then
    echo "请先配置 SSL 证书后再继续部署"
    exit 1
fi

echo ""
echo ""
echo "第四步：一键部署"
echo "--------------------------------------------------"
chmod +x scripts/deploy.sh
echo "开始部署，预计需要 5-10 分钟..."
echo ""

bash scripts/deploy.sh

echo ""
echo ""
echo "=================================================="
echo "部署流程完成！"
echo "=================================================="
echo ""
echo "请检查上面的输出，确认所有服务都已成功启动"
echo ""
echo "常用管理命令："
echo "  查看日志: docker-compose -f docker-compose.prod.yml logs -f"
echo "  查看状态: docker-compose -f docker-compose.prod.yml ps"
echo "  重启服务: docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "访问网站: https://aidaquanji.com"
echo ""
