# 阿里云 ECS 部署指南 - AI工具大全

本指南详细说明如何将 AI 工具大全网站部署到阿里云 ECS 服务器，并绑定域名 `aidaquanji.com`。

## 📋 前置要求

### 1. 阿里云 ECS 服务器
- **推荐配置：**
  - CPU：2核或以上
  - 内存：4GB 或以上
  - 硬盘：40GB 或以上
  - 带宽：3Mbps 或以上
  - 操作系统：Ubuntu 22.04 或 CentOS 8

### 2. 域名备案
- ⚠️ **重要：** 域名必须完成 ICP 备案才能在国内使用
- 备案流程详见：`docs/ICP_BEIAN.md`

### 3. 必备软件
- Node.js 18.x 或以上
- MySQL 8.0
- Nginx
- PM2（进程管理器）

---

## 🚀 部署步骤

### 步骤 1：购买和配置 ECS 服务器（10分钟）

#### 1.1 购买 ECS
1. 登录 [阿里云控制台](https://ecs.console.aliyun.com/)
2. 选择 **云服务器 ECS** > **实例** > **创建实例**
3. 选择配置：
   - 地域：选择离您用户最近的地域（如华东、华北）
   - 实例规格：ecs.t6-c1m2.large 或更高
   - 镜像：Ubuntu 22.04 64位
   - 存储：40GB 高效云盘
   - 网络：默认 VPC
   - 公网IP：分配
   - 带宽：按使用流量或固定带宽 3Mbps

4. 设置安全组规则（非常重要！）：
   - 入方向规则添加：
     - SSH：端口 22（源：0.0.0.0/0）
     - HTTP：端口 80（源：0.0.0.0/0）
     - HTTPS：端口 443（源：0.0.0.0/0）
     - MySQL：端口 3306（源：127.0.0.1/32，仅本机访问）
     - 自定义：端口 3000（源：127.0.0.1/32，Next.js 开发端口）

5. 完成购买并记录：
   - 公网 IP 地址
   - root 密码或密钥

---

### 步骤 2：连接服务器并安装环境（20分钟）

#### 2.1 连接到服务器

**Windows 用户：**
```bash
# 使用 PowerShell 或下载 PuTTY
ssh root@你的服务器IP
```

**Mac/Linux 用户：**
```bash
ssh root@你的服务器IP
```

#### 2.2 更新系统
```bash
apt update && apt upgrade -y
```

#### 2.3 安装 Node.js
```bash
# 安装 nvm（Node Version Manager）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载 shell
source ~/.bashrc

# 安装 Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

# 验证安装
node --version  # 应该显示 v18.x.x
npm --version   # 应该显示 9.x.x
```

#### 2.4 安装 MySQL
```bash
# 安装 MySQL
apt install mysql-server -y

# 启动 MySQL
systemctl start mysql
systemctl enable mysql

# 安全配置
mysql_secure_installation
# 按提示设置 root 密码（记住这个密码！）
# 其他选项全部选 Y
```

#### 2.5 创建数据库
```bash
# 登录 MySQL
mysql -u root -p

# 在 MySQL 中执行：
CREATE DATABASE aitools CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'aitools'@'localhost' IDENTIFIED BY '你的数据库密码';
GRANT ALL PRIVILEGES ON aitools.* TO 'aitools'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 2.6 安装 Nginx
```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

#### 2.7 安装 PM2
```bash
npm install -g pm2
```

#### 2.8 安装 Git
```bash
apt install git -y
```

---

### 步骤 3：部署项目代码（15分钟）

#### 3.1 创建项目目录
```bash
mkdir -p /var/www
cd /var/www
```

#### 3.2 克隆代码（或上传代码）

**方式 A：从 Git 仓库克隆**
```bash
git clone https://github.com/你的用户名/ai-tools-directory.git
cd ai-tools-directory
```

**方式 B：手动上传**
```bash
# 在本地电脑上，使用 scp 上传
scp -r C:\Private\Trae\Projects\2.AIBook root@你的服务器IP:/var/www/ai-tools-directory
```

#### 3.3 安装依赖
```bash
cd /var/www/ai-tools-directory
npm install
```

#### 3.4 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

配置以下内容：
```bash
# 数据库配置
DATABASE_URL="mysql://aitools:你的数据库密码@localhost:3306/aitools"

# Next Auth 配置
NEXTAUTH_URL="https://aidaquanji.com"
NEXTAUTH_SECRET="生成一个随机密钥"  # 运行: openssl rand -base64 32

# GitHub API Token（可选，用于数据采集）
GITHUB_TOKEN="你的GitHub token"

# Product Hunt API Token（可选）
PRODUCTHUNT_API_TOKEN="你的token"

# 管理员邮箱
ADMIN_EMAIL="your-email@example.com"

# Cron Job 密钥
CRON_SECRET="生成一个随机密钥"  # 运行: openssl rand -base64 32
```

保存并退出（Ctrl+X，然后 Y，然后 Enter）

#### 3.5 初始化数据库
```bash
# 生成 Prisma 客户端
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate deploy

# 填充初始数据（可选）
npm run prisma:seed
```

#### 3.6 构建项目
```bash
npm run build
```

---

### 步骤 4：配置 PM2 和 Nginx（10分钟）

#### 4.1 创建 PM2 配置文件
```bash
nano ecosystem.config.js
```

内容：
```javascript
module.exports = {
  apps: [{
    name: 'ai-tools-directory',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/ai-tools-directory',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/ai-tools-directory/logs/error.log',
    out_file: '/var/www/ai-tools-directory/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G'
  }]
};
```

#### 4.2 创建日志目录
```bash
mkdir -p /var/www/ai-tools-directory/logs
```

#### 4.3 启动应用
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# 按照提示复制命令并执行
```

#### 4.4 配置 Nginx
```bash
# 创建 Nginx 配置文件
nano /etc/nginx/sites-available/aidaquanji.com
```

内容（暂时使用 HTTP，SSL 在备案后配置）：
```nginx
server {
    listen 80;
    server_name aidaquanji.com www.aidaquanji.com;

    # 访问日志
    access_log /var/log/nginx/aidaquanji.access.log;
    error_log /var/log/nginx/aidaquanji.error.log;

    # 代理到 Next.js 应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # 图片缓存
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

保存并启用配置：
```bash
# 创建软链接
ln -s /etc/nginx/sites-available/aidaquanji.com /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 如果测试通过，重启 Nginx
systemctl reload nginx
```

---

### 步骤 5：配置域名解析（5分钟）

#### 5.1 登录阿里云域名控制台
访问 [阿里云域名控制台](https://dc.console.aliyun.com/)

#### 5.2 添加 DNS 解析记录

找到域名 `aidaquanji.com`，点击"解析"，添加记录：

**主域名：**
| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| A | @ | 你的ECS公网IP | 600 |

**www 子域名：**
| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| CNAME | www | aidaquanji.com | 600 |

#### 5.3 等待生效
DNS 解析通常 10 分钟内生效。

---

### 步骤 6：配置 SSL 证书（备案后）

⚠️ **注意：** 必须先完成 ICP 备案才能使用域名和配置 SSL

备案完成后，按照以下步骤配置 HTTPS：

#### 6.1 安装 Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

#### 6.2 申请免费 SSL 证书
```bash
certbot --nginx -d aidaquanji.com -d www.aidaquanji.com
```

按提示操作：
- 输入邮箱
- 同意服务条款
- 选择是否接收邮件
- 选择是否重定向 HTTP 到 HTTPS（选择 2，强制 HTTPS）

#### 6.3 自动续期
```bash
# 测试续期
certbot renew --dry-run

# 自动续期已经配置，无需额外操作
```

---

## 🔍 验证部署

### 检查服务状态
```bash
# 检查 PM2 状态
pm2 status

# 检查 PM2 日志
pm2 logs ai-tools-directory

# 检查 Nginx 状态
systemctl status nginx

# 检查 MySQL 状态
systemctl status mysql
```

### 测试访问

**备案前（仅 IP 访问）：**
```bash
curl http://你的服务器IP
```

**备案后（域名访问）：**
- http://aidaquanji.com
- https://aidaquanji.com（配置 SSL 后）

---

## 🔄 配置定时任务

在服务器上配置 cron job 来定期更新数据：

```bash
# 编辑 crontab
crontab -e

# 添加以下任务（每天凌晨 2 点更新）
0 2 * * * cd /var/www/ai-tools-directory && /root/.nvm/versions/node/v18.*/bin/npm run update:all >> /var/www/ai-tools-directory/logs/cron.log 2>&1
```

---

## 🛠️ 常用管理命令

### PM2 管理
```bash
# 查看状态
pm2 status

# 重启应用
pm2 restart ai-tools-directory

# 停止应用
pm2 stop ai-tools-directory

# 查看日志
pm2 logs ai-tools-directory

# 查看实时日志
pm2 logs ai-tools-directory --lines 100
```

### Nginx 管理
```bash
# 重启 Nginx
systemctl restart nginx

# 重新加载配置
systemctl reload nginx

# 测试配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/aidaquanji.error.log
```

### 应用更新
```bash
cd /var/www/ai-tools-directory

# 拉取最新代码
git pull

# 安装依赖
npm install

# 运行数据库迁移（如有）
npm run prisma:migrate deploy

# 重新构建
npm run build

# 重启应用
pm2 restart ai-tools-directory
```

---

## 🐛 常见问题

### Q1: 端口 3000 已被占用
```bash
# 查看端口占用
lsof -i :3000

# 杀死进程
kill -9 进程ID
```

### Q2: PM2 应用反复重启
```bash
# 查看详细日志
pm2 logs ai-tools-directory --err

# 常见原因：
# - 数据库连接失败
# - 环境变量配置错误
# - 内存不足
```

### Q3: Nginx 502 Bad Gateway
```bash
# 检查 Next.js 应用是否运行
pm2 status

# 检查端口 3000 是否监听
netstat -tlnp | grep 3000

# 重启应用
pm2 restart ai-tools-directory
```

### Q4: 数据库连接失败
```bash
# 检查 MySQL 状态
systemctl status mysql

# 测试连接
mysql -u aitools -p -h localhost

# 检查 .env 中的 DATABASE_URL 是否正确
```

---

## 📊 性能优化建议

### 1. 启用 Redis 缓存（可选）
```bash
apt install redis-server -y
systemctl start redis
systemctl enable redis
```

### 2. 配置 CDN
建议使用阿里云 CDN 加速静态资源

### 3. 数据库优化
```bash
# 编辑 MySQL 配置
nano /etc/mysql/mysql.conf.d/mysqld.cnf

# 添加优化参数
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
```

### 4. 应用监控
```bash
# 安装 PM2 监控
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

---

## 🔒 安全建议

### 1. 配置防火墙
```bash
apt install ufw -y
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 2. 禁用 root SSH 登录
```bash
nano /etc/ssh/sshd_config
# 修改: PermitRootLogin no
systemctl restart sshd
```

### 3. 定期备份数据库
```bash
# 创建备份脚本
nano /root/backup-db.sh
```

内容：
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u aitools -p你的数据库密码 aitools > /root/backups/aitools_$DATE.sql
find /root/backups -name "aitools_*.sql" -mtime +7 -delete
```

```bash
chmod +x /root/backup-db.sh
mkdir -p /root/backups

# 添加到 crontab（每天凌晨 3 点备份）
crontab -e
# 添加: 0 3 * * * /root/backup-db.sh
```

---

## ✅ 部署检查清单

- [ ] ECS 服务器已购买并配置
- [ ] 安全组规则已设置
- [ ] Node.js 已安装
- [ ] MySQL 已安装并创建数据库
- [ ] Nginx 已安装并配置
- [ ] PM2 已安装
- [ ] 项目代码已部署
- [ ] 环境变量已配置
- [ ] 数据库迁移已完成
- [ ] 项目已构建
- [ ] PM2 应用已启动
- [ ] Nginx 配置已生效
- [ ] 域名解析已配置
- [ ] ICP 备案已完成（或进行中）
- [ ] SSL 证书已配置（备案后）
- [ ] 定时任务已配置
- [ ] 可以通过域名访问网站

---

## 📞 获取帮助

如遇到问题：
1. 查看应用日志：`pm2 logs ai-tools-directory`
2. 查看 Nginx 日志：`tail -f /var/log/nginx/aidaquanji.error.log`
3. 查看系统日志：`journalctl -xe`

---

**部署完成后，您的网站将运行在：**
- http://aidaquanji.com（备案前用 IP 访问）
- https://aidaquanji.com（备案后配置 SSL）

🎉 祝部署顺利！
