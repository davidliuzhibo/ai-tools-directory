#!/bin/bash

echo "======================================"
echo "SSL 证书状态检查"
echo "======================================"
echo ""

# 检查 certbot 是否安装
echo "1. 检查 certbot 是否安装..."
if command -v certbot &> /dev/null; then
    echo "✅ certbot 已安装"
    certbot --version
else
    echo "❌ certbot 未安装"
    echo "   安装命令: sudo apt install certbot -y  (Ubuntu/Debian)"
    echo "   安装命令: sudo yum install certbot -y  (CentOS)"
fi
echo ""

# 检查 Let's Encrypt 证书
echo "2. 检查 Let's Encrypt 证书..."
if [ -d "/etc/letsencrypt/live/aidaquanji.com" ]; then
    echo "✅ 发现 Let's Encrypt 证书目录"
    echo "   证书路径: /etc/letsencrypt/live/aidaquanji.com/"

    # 检查证书文件
    if [ -f "/etc/letsencrypt/live/aidaquanji.com/fullchain.pem" ]; then
        echo "   ✅ fullchain.pem 存在"
        echo ""
        echo "   证书详情:"
        sudo openssl x509 -in /etc/letsencrypt/live/aidaquanji.com/fullchain.pem -text -noout | grep -A 2 "Subject:"
        echo ""
        echo "   证书有效期:"
        sudo openssl x509 -in /etc/letsencrypt/live/aidaquanji.com/fullchain.pem -text -noout | grep "Not After"
    else
        echo "   ❌ fullchain.pem 不存在"
    fi

    if [ -f "/etc/letsencrypt/live/aidaquanji.com/privkey.pem" ]; then
        echo "   ✅ privkey.pem 存在"
    else
        echo "   ❌ privkey.pem 不存在"
    fi
else
    echo "❌ 未发现 aidaquanji.com 的 Let's Encrypt 证书"
fi
echo ""

# 检查项目 nginx/ssl 目录
echo "3. 检查项目 nginx/ssl 目录..."
PROJECT_SSL_DIR="./nginx/ssl"

if [ -d "$PROJECT_SSL_DIR" ]; then
    echo "✅ nginx/ssl 目录存在"

    if [ -f "$PROJECT_SSL_DIR/fullchain.pem" ]; then
        echo "   ✅ fullchain.pem 存在"
        echo "   证书有效期:"
        openssl x509 -in $PROJECT_SSL_DIR/fullchain.pem -text -noout | grep "Not After" || echo "   ⚠️  无法读取证书（可能需要 sudo）"
    else
        echo "   ❌ fullchain.pem 不存在"
    fi

    if [ -f "$PROJECT_SSL_DIR/privkey.pem" ]; then
        echo "   ✅ privkey.pem 存在"
    else
        echo "   ❌ privkey.pem 不存在"
    fi

    echo ""
    echo "   目录内容:"
    ls -lh $PROJECT_SSL_DIR/
else
    echo "❌ nginx/ssl 目录不存在"
    echo "   当前工作目录: $(pwd)"
fi
echo ""

# 检查证书续期状态
echo "4. 检查证书续期配置..."
if command -v certbot &> /dev/null; then
    echo "尝试列出所有证书:"
    sudo certbot certificates 2>/dev/null || echo "   需要 sudo 权限查看"
fi
echo ""

# 提供建议
echo "======================================"
echo "建议操作:"
echo "======================================"

if [ ! -d "/etc/letsencrypt/live/aidaquanji.com" ]; then
    echo "📌 需要获取新的 SSL 证书"
    echo ""
    echo "运行以下命令获取证书:"
    echo "sudo certbot certonly --standalone \\"
    echo "  -d aidaquanji.com \\"
    echo "  -d www.aidaquanji.com \\"
    echo "  --email davidliuzhibo@foxmail.com \\"
    echo "  --agree-tos"
    echo ""
elif [ ! -f "$PROJECT_SSL_DIR/fullchain.pem" ] || [ ! -f "$PROJECT_SSL_DIR/privkey.pem" ]; then
    echo "📌 证书已存在，但需要复制到项目目录"
    echo ""
    echo "运行以下命令复制证书:"
    echo "sudo cp /etc/letsencrypt/live/aidaquanji.com/fullchain.pem $PROJECT_SSL_DIR/"
    echo "sudo cp /etc/letsencrypt/live/aidaquanji.com/privkey.pem $PROJECT_SSL_DIR/"
    echo "sudo chmod 644 $PROJECT_SSL_DIR/*.pem"
    echo ""
else
    echo "✅ SSL 证书配置完成，可以开始部署！"
fi

echo "======================================"
