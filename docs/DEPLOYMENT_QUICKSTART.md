# 阿里云部署快速指南

这是一个简化的部署指南，帮助你快速在阿里云 ECS 上部署 AI工具大全。

## 前置要求

- ✅ 阿里云 ECS 服务器（2核4G以上）
- ✅ 域名已备案
- ✅ Ubuntu 20.04+ 或 CentOS 7+

## 快速部署（5步）

### 1️⃣ 连接服务器并安装 Docker

```bash
# SSH 连接
ssh root@你的服务器IP

# 安装 Docker（Ubuntu）
curl -fsSL https://get.docker.com | bash
systemctl start docker
systemctl enable docker
```

### 2️⃣ 上传代码到服务器

```bash
# 方式1：使用 Git
cd /opt
git clone <你的仓库> aitools
cd aitools

# 方式2：打包上传
# 本地: tar -czf aitools.tar.gz .
# 本地: scp aitools.tar.gz root@IP:/opt/
# 服务器: cd /opt && tar -xzf aitools.tar.gz -C aitools && cd aitools
```

### 3️⃣ 配置环境变量

```bash
# 复制并编辑配置
cp .env.example .env
nano .env

# 修改以下关键配置：
# DATABASE_URL="mysql://aitools_user:你的密码@mysql:3306/aitools"
# NEXTAUTH_URL="https://你的域名.com"
# NEXTAUTH_SECRET="运行: openssl rand -base64 32"
# ADMIN_EMAIL="你的邮箱"
```

创建 Docker 环境变量：
```bash
cat > .env.docker << EOF
MYSQL_ROOT_PASSWORD=你的root密码
MYSQL_DATABASE=aitools
MYSQL_USER=aitools_user
MYSQL_PASSWORD=你的数据库密码
EOF
```

### 4️⃣ 配置 SSL 证书（可选）

上传阿里云 SSL 证书：
```bash
mkdir -p nginx/ssl
# 上传 fullchain.pem 和 privkey.pem 到 nginx/ssl/
```

或使用 Let's Encrypt：
```bash
apt-get install -y certbot
certbot certonly --standalone -d 你的域名.com
ln -s /etc/letsencrypt/live/你的域名.com/fullchain.pem nginx/ssl/
ln -s /etc/letsencrypt/live/你的域名.com/privkey.pem nginx/ssl/
```

### 5️⃣ 一键部署

```bash
# 赋予执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

## 配置域名解析

登录阿里云控制台 → 域名解析：

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| A | @ | 服务器IP |
| A | www | 服务器IP |

## 配置安全组

在 ECS 安全组中添加规则：
- 80/TCP（HTTP）
- 443/TCP（HTTPS）
- 22/TCP（SSH，建议限制来源IP）

## 验证部署

访问 `https://你的域名.com` 检查网站是否正常运行。

## 常用命令

```bash
# 查看日志
docker compose logs -f web

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 更新代码
git pull && docker compose up -d --build web

# 备份数据库
docker compose exec mysql mysqldump -u root -p aitools > backup.sql
```

## 需要帮助？

详细文档请查看：`docs/ALIYUN_DEPLOYMENT_GUIDE.md`
