# 阿里云 ECS 部署指南

本指南将帮助你在阿里云 ECS 服务器上部署 AI工具大全网站，并绑定你的域名。

## 前提条件

- ✅ 已购买阿里云 ECS 服务器（推荐 2核4G 或以上配置）
- ✅ 域名已在阿里云备案（国内服务器必需）
- ✅ 服务器系统：Ubuntu 20.04/22.04 或 CentOS 7/8
- ✅ 已获取服务器 root 权限

## 一、服务器环境准备

### 1. 连接到你的 ECS 服务器

```bash
# 使用 SSH 连接
ssh root@你的服务器IP
```

### 2. 安装 Docker 和 Docker Compose

**Ubuntu/Debian:**
```bash
# 更新包索引
sudo apt-get update

# 安装必要的依赖
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# 添加 Docker 官方 GPG 密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 设置 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker
```

**CentOS:**
```bash
# 安装 Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### 3. 验证安装

```bash
docker --version
docker compose version
```

## 二、部署应用

### 1. 上传项目代码到服务器

**方式 A：使用 Git（推荐）**
```bash
# 在服务器上克隆代码
cd /opt
git clone <你的仓库地址> aitools
cd aitools
```

**方式 B：手动上传**
```bash
# 在本地打包项目
tar -czf aitools.tar.gz .

# 使用 scp 上传到服务器
scp aitools.tar.gz root@你的服务器IP:/opt/

# 在服务器上解压
ssh root@你的服务器IP
cd /opt
tar -xzf aitools.tar.gz -C aitools
cd aitools
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

重要配置项：
```bash
# 数据库配置（使用 Docker Compose 会自动创建）
DATABASE_URL="mysql://aitools_user:你的密码@mysql:3306/aitools"

# 网站 URL（替换为你的域名）
NEXTAUTH_URL="https://aidaquanji.com"

# 生成随机密钥
NEXTAUTH_SECRET="<使用以下命令生成>"
# openssl rand -base64 32

# 管理员邮箱
ADMIN_EMAIL="your-email@example.com"

# Cron 密钥
CRON_SECRET="<使用以下命令生成>"
# openssl rand -base64 32

# 其他 API Token（可选）
GITHUB_TOKEN="your-github-token"
PRODUCTHUNT_API_TOKEN="your-producthunt-token"
```

### 3. 创建 Docker Compose 环境变量文件

```bash
# 创建 .env.docker（用于 docker-compose）
nano .env.docker
```

添加以下内容：
```bash
MYSQL_ROOT_PASSWORD=your_root_password_here
MYSQL_DATABASE=aitools
MYSQL_USER=aitools_user
MYSQL_PASSWORD=your_database_password_here

# 从 .env 复制其他变量
NEXTAUTH_URL=https://aidaquanji.com
NEXTAUTH_SECRET=your_nextauth_secret
ADMIN_EMAIL=your-email@example.com
CRON_SECRET=your_cron_secret
```

### 4. 修改 nginx 配置

编辑域名：
```bash
nano nginx/conf.d/default.conf
```

将 `aidaquanji.com` 替换为你的实际域名。

### 5. 启动服务

```bash
# 构建并启动所有服务
docker compose --env-file .env.docker up -d --build

# 查看日志
docker compose logs -f web

# 等待数据库初始化完成
docker compose logs -f mysql
```

### 6. 初始化数据库

```bash
# 进入 web 容器
docker compose exec web sh

# 运行数据库迁移
npx prisma migrate deploy

# （可选）导入初始数据
npm run prisma:seed

# 退出容器
exit
```

## 三、配置 SSL 证书

### 方式 A：使用阿里云 SSL 证书（推荐）

1. 在阿里云控制台申请免费 SSL 证书
2. 下载 Nginx 格式的证书文件
3. 上传到服务器：

```bash
# 创建证书目录
mkdir -p /opt/aitools/nginx/ssl

# 上传证书文件（在本地执行）
scp fullchain.pem root@你的服务器IP:/opt/aitools/nginx/ssl/
scp privkey.pem root@你的服务器IP:/opt/aitools/nginx/ssl/
```

### 方式 B：使用 Let's Encrypt 免费证书

```bash
# 安装 certbot
sudo apt-get install -y certbot

# 获取证书
sudo certbot certonly --standalone -d aidaquanji.com -d www.aidaquanji.com

# 证书会保存在 /etc/letsencrypt/live/aidaquanji.com/
# 创建软链接
ln -s /etc/letsencrypt/live/aidaquanji.com/fullchain.pem /opt/aitools/nginx/ssl/
ln -s /etc/letsencrypt/live/aidaquanji.com/privkey.pem /opt/aitools/nginx/ssl/
```

### 重启 Nginx

```bash
docker compose restart nginx
```

## 四、配置域名解析

登录阿里云控制台 → 域名 → 解析设置：

### 添加 A 记录

| 记录类型 | 主机记录 | 解析线路 | 记录值 | TTL |
|---------|---------|---------|--------|-----|
| A | @ | 默认 | 你的服务器公网IP | 600 |
| A | www | 默认 | 你的服务器公网IP | 600 |

### 验证解析

```bash
# 在本地终端测试
ping aidaquanji.com
ping www.aidaquanji.com

# 或使用
nslookup aidaquanji.com
```

## 五、配置防火墙和安全组

### 1. 阿里云安全组规则

在 ECS 控制台配置安全组，开放以下端口：

| 端口 | 协议 | 说明 |
|-----|------|------|
| 80 | TCP | HTTP |
| 443 | TCP | HTTPS |
| 22 | TCP | SSH（建议限制IP） |

### 2. 服务器防火墙

**Ubuntu (ufw):**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

**CentOS (firewalld):**
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 六、验证部署

1. 访问 `https://aidaquanji.com`
2. 检查 SSL 证书是否有效
3. 测试网站功能：
   - 用户注册/登录
   - 浏览工具列表
   - 搜索功能
   - 管理后台（使用管理员账号）

## 七、日常运维

### 查看日志

```bash
# 查看所有服务日志
docker compose logs

# 查看特定服务
docker compose logs web
docker compose logs nginx
docker compose logs mysql

# 实时查看
docker compose logs -f web
```

### 重启服务

```bash
# 重启所有服务
docker compose restart

# 重启特定服务
docker compose restart web
docker compose restart nginx
```

### 更新代码

```bash
cd /opt/aitools
git pull
docker compose up -d --build web
```

### 备份数据库

```bash
# 手动备份
docker compose exec mysql mysqldump -u root -p aitools > backup_$(date +%Y%m%d).sql

# 设置定时备份（crontab）
0 2 * * * cd /opt/aitools && docker compose exec -T mysql mysqldump -u root -pYOUR_PASSWORD aitools > /backup/aitools_$(date +\%Y\%m\%d).sql
```

### 停止服务

```bash
# 停止所有服务
docker compose down

# 停止并删除数据
docker compose down -v
```

## 八、性能优化建议

1. **启用 CDN**：使用阿里云 CDN 加速静态资源
2. **数据库优化**：升级到阿里云 RDS MySQL（更稳定）
3. **对象存储**：图片存储使用阿里云 OSS
4. **监控告警**：配置云监控，设置 CPU/内存/磁盘告警

## 九、故障排查

### 无法访问网站

```bash
# 检查服务状态
docker compose ps

# 检查端口占用
netstat -tuln | grep -E '80|443'

# 检查 Nginx 配置
docker compose exec nginx nginx -t
```

### 数据库连接失败

```bash
# 检查 MySQL 状态
docker compose exec mysql mysql -u root -p -e "SHOW DATABASES;"

# 查看数据库日志
docker compose logs mysql
```

### SSL 证书问题

```bash
# 检查证书文件
ls -la /opt/aitools/nginx/ssl/

# 测试 SSL
openssl s_client -connect aidaquanji.com:443 -servername aidaquanji.com
```

## 需要帮助？

如有问题，请检查：
1. 服务器日志：`docker compose logs -f`
2. 网络连接：防火墙和安全组设置
3. DNS 解析：确保域名正确指向服务器
4. SSL 证书：确保证书文件存在且有效
