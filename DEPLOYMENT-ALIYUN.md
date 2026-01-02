# 阿里云生产环境部署指南

## 一、环境变量配置

### 1.1 创建生产环境配置文件

在项目根目录创建 `.env.production` 文件（不要提交到 Git）：

```bash
# 数据库配置（使用 Docker MySQL 服务）
DATABASE_URL="mysql://root:your-strong-password@mysql:3306/aitools"

# Next Auth 配置
NEXTAUTH_URL="https://aidaquanji.com"
NEXTAUTH_SECRET="生成一个强随机密钥"

# GitHub API Token（可选，用于数据采集）
GITHUB_TOKEN="your-github-personal-access-token"

# Product Hunt API（可选，用于数据采集）
PRODUCTHUNT_API_TOKEN="your-producthunt-api-token"

# 腾讯云 COS（如果使用）
COS_SECRET_ID="your-tencent-cloud-secret-id"
COS_SECRET_KEY="your-tencent-cloud-secret-key"
COS_BUCKET="your-bucket-name"
COS_REGION="ap-guangzhou"

# 管理员邮箱（多个用逗号分隔）
ADMIN_EMAIL="davidliuzhibo@foxmail.com"

# Cron Job 密钥（用于定时任务）
CRON_SECRET="生成一个强随机密钥"
```

### 1.2 生成强随机密钥

```bash
# 生成 NEXTAUTH_SECRET（方法1）
openssl rand -base64 32

# 生成 NEXTAUTH_SECRET（方法2）
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 生成 CRON_SECRET
openssl rand -hex 32
```

### 1.3 环境变量说明

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| DATABASE_URL | ✅ | MySQL数据库连接字符串 | mysql://user:pass@host:3306/db |
| NEXTAUTH_URL | ✅ | 网站完整URL | https://aidaquanji.com |
| NEXTAUTH_SECRET | ✅ | NextAuth加密密钥 | 32位随机字符串 |
| GITHUB_TOKEN | ❌ | GitHub API令牌 | ghp_xxxxxxxxxxxx |
| PRODUCTHUNT_API_TOKEN | ❌ | Product Hunt API令牌 | - |
| ADMIN_EMAIL | ✅ | 管理员邮箱 | admin@example.com |
| CRON_SECRET | ⚠️ | 定时任务密钥 | 用于验证cron请求 |

## 二、数据库准备

### 2.1 修改 docker-compose.yml 中的密码

编辑 `docker-compose.yml`，修改 MySQL 密码：

```yaml
services:
  mysql:
    environment:
      MYSQL_ROOT_PASSWORD: "你的强密码"  # ⚠️ 务必修改
      MYSQL_DATABASE: aitools
```

### 2.2 数据库迁移

首次部署时需要初始化数据库：

```bash
# 在本地或服务器上执行
npm run prisma:generate
npm run prisma:migrate
```

如果使用 Docker，可以进入容器执行：

```bash
docker-compose exec web npm run prisma:migrate
```

## 三、阿里云 ECS 服务器配置

### 3.1 服务器要求

- **配置推荐**: 2核4G及以上
- **操作系统**: Ubuntu 20.04/22.04 LTS 或 CentOS 7/8
- **硬盘**: 至少 40GB
- **带宽**: 至少 1Mbps（建议 3Mbps+）

### 3.2 安全组配置

在阿里云控制台配置安全组规则：

| 规则方向 | 端口范围 | 授权对象 | 说明 |
|----------|----------|----------|------|
| 入方向 | 22 | 你的IP | SSH登录 |
| 入方向 | 80 | 0.0.0.0/0 | HTTP |
| 入方向 | 443 | 0.0.0.0/0 | HTTPS |
| 入方向 | 3306 | 拒绝 | 禁止外网访问MySQL |

### 3.3 安装必要软件

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户添加到 docker 组（可选）
sudo usermod -aG docker $USER
```

### 3.4 安装 Git（如果需要）

```bash
sudo apt install git -y
```

## 四、域名和 DNS 配置

### 4.1 域名解析

在阿里云域名控制台添加 A 记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|----------|----------|--------|-----|
| A | @ | 你的ECS公网IP | 600 |
| A | www | 你的ECS公网IP | 600 |

### 4.2 验证 DNS 解析

```bash
# 等待5-10分钟后验证
ping aidaquanji.com
ping www.aidaquanji.com
```

## 五、部署步骤

### 5.1 上传项目到服务器

**方式一：使用 Git（推荐）**

```bash
# 在服务器上
cd /var/www  # 或其他目录
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

**方式二：使用 SCP 上传**

```bash
# 在本地
scp -r ./2.AIBook user@your-server-ip:/var/www/
```

### 5.2 配置环境变量

```bash
# 进入项目目录
cd /var/www/2.AIBook

# 复制环境变量模板
cp .env.example .env.production

# 编辑环境变量
nano .env.production
# 或使用 vim
vim .env.production
```

**⚠️ 重要**：确保填写所有必需的环境变量！

### 5.3 配置 SSL 证书

按照 `nginx/ssl/README.md` 的指南获取 SSL 证书：

```bash
# 推荐使用 Let's Encrypt
sudo certbot certonly --standalone \
  -d aidaquanji.com \
  -d www.aidaquanji.com \
  --email davidliuzhibo@foxmail.com \
  --agree-tos

# 复制证书
sudo cp /etc/letsencrypt/live/aidaquanji.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/aidaquanji.com/privkey.pem ./nginx/ssl/
sudo chmod 644 ./nginx/ssl/*.pem
```

### 5.4 构建和启动服务

```bash
# 构建 Docker 镜像并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 查看运行状态
docker-compose ps
```

### 5.5 初始化数据库

```bash
# 运行数据库迁移
docker-compose exec web npm run prisma:migrate

# （可选）导入初始数据
docker-compose exec web npm run seed
```

### 5.6 验证部署

1. **检查服务状态**
```bash
docker-compose ps
# 应该看到 mysql、web、nginx 三个服务都是 Up 状态
```

2. **测试 HTTP 访问**
```bash
curl http://aidaquanji.com
# 应该自动重定向到 HTTPS
```

3. **测试 HTTPS 访问**
```bash
curl https://aidaquanji.com
# 应该返回网站 HTML
```

4. **浏览器访问**
   - 访问 https://aidaquanji.com
   - 检查 SSL 证书是否有效（浏览器地址栏显示锁图标）
   - 测试网站功能

## 六、生产环境维护

### 6.1 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f web
docker-compose logs -f nginx
docker-compose logs -f mysql

# 查看最近100行日志
docker-compose logs --tail=100 web
```

### 6.2 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart web
docker-compose restart nginx
```

### 6.3 更新代码

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose up -d --build

# 运行新的数据库迁移（如果有）
docker-compose exec web npm run prisma:migrate
```

### 6.4 数据库备份

```bash
# 创建备份目录
mkdir -p backups

# 备份数据库
docker-compose exec mysql mysqldump -uroot -p aitools > backups/aitools_$(date +%Y%m%d_%H%M%S).sql

# 设置定时备份（crontab）
crontab -e
# 添加：每天凌晨2点备份
0 2 * * * cd /var/www/2.AIBook && docker-compose exec mysql mysqldump -uroot -pYOUR_PASSWORD aitools > backups/aitools_$(date +\%Y\%m\%d).sql
```

### 6.5 SSL 证书续期

```bash
# Let's Encrypt 证书 90 天过期，建议60天续期
sudo certbot renew

# 复制新证书
sudo cp /etc/letsencrypt/live/aidaquanji.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/aidaquanji.com/privkey.pem ./nginx/ssl/

# 重启 nginx
docker-compose restart nginx

# 设置自动续期（crontab）
crontab -e
# 添加：每月1号检查续期
0 0 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/aidaquanji.com/*.pem /var/www/2.AIBook/nginx/ssl/ && cd /var/www/2.AIBook && docker-compose restart nginx
```

### 6.6 监控和性能

```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
df -h

# 清理 Docker 不用的资源
docker system prune -a
```

## 七、常见问题排查

### 7.1 无法访问网站

**检查清单**：
1. ✅ DNS 解析是否正确：`ping aidaquanji.com`
2. ✅ 安全组端口是否开放（80, 443）
3. ✅ Docker 服务是否运行：`docker-compose ps`
4. ✅ Nginx 日志：`docker-compose logs nginx`

### 7.2 SSL 证书错误

**检查清单**：
1. ✅ 证书文件是否存在：`ls -l nginx/ssl/`
2. ✅ 证书是否过期：`openssl x509 -in nginx/ssl/fullchain.pem -text -noout | grep "Not After"`
3. ✅ 域名是否匹配：`openssl x509 -in nginx/ssl/fullchain.pem -text -noout | grep "Subject:"`
4. ✅ Nginx 配置是否正确：`docker-compose exec nginx nginx -t`

### 7.3 数据库连接失败

**检查清单**：
1. ✅ MySQL 容器是否运行：`docker-compose ps mysql`
2. ✅ 环境变量 DATABASE_URL 是否正确
3. ✅ MySQL 日志：`docker-compose logs mysql`
4. ✅ 测试连接：`docker-compose exec web npx prisma db push`

### 7.4 页面加载慢

**优化建议**：
1. 启用 Nginx 缓存（已配置）
2. 检查数据库查询性能
3. 使用 CDN 加速静态资源
4. 升级服务器带宽

### 7.5 构建失败

**常见原因**：
1. Node.js 内存不足：在 docker-compose.yml 增加内存限制
2. 依赖安装失败：检查网络，使用国内镜像
3. Prisma 生成失败：手动运行 `docker-compose exec web npm run prisma:generate`

## 八、安全加固建议

### 8.1 修改 SSH 端口

```bash
# 编辑 SSH 配置
sudo nano /etc/ssh/sshd_config
# 修改：Port 22 改为 Port 2222

# 重启 SSH
sudo systemctl restart sshd

# ⚠️ 记得在安全组添加新端口规则！
```

### 8.2 配置防火墙

```bash
# 安装 UFW
sudo apt install ufw

# 配置规则
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable
```

### 8.3 禁用 root SSH 登录

```bash
# 创建普通用户
sudo adduser deploy
sudo usermod -aG sudo deploy

# 禁用 root 登录
sudo nano /etc/ssh/sshd_config
# 修改：PermitRootLogin no

sudo systemctl restart sshd
```

### 8.4 定期更新系统

```bash
# 设置自动安全更新
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## 九、成本估算

### 阿里云 ECS（按量付费）

| 配置 | 月费用（约） | 适用场景 |
|------|-------------|----------|
| 2核2G + 1Mbps | ¥70-100 | 个人项目/测试 |
| 2核4G + 3Mbps | ¥150-200 | 小型项目 |
| 4核8G + 5Mbps | ¥300-400 | 生产环境 |

### SSL 证书

- Let's Encrypt: 免费
- 阿里云 DV SSL: 免费（单域名，1年）
- 商业 OV SSL: ¥1000-3000/年

### 域名

- .com 域名: ¥55-70/年
- .cn 域名: ¥29-40/年

### 数据库

- 使用 Docker MySQL: 免费
- 阿里云 RDS: ¥100-500/月

## 十、下一步优化

部署成功后可以考虑：

1. ✅ **CDN 加速** - 使用阿里云 CDN 或 Cloudflare
2. ✅ **对象存储** - 图片上传到腾讯云 COS 或阿里云 OSS
3. ✅ **监控告警** - 配置阿里云监控或 Prometheus
4. ✅ **日志分析** - ELK Stack 或阿里云日志服务
5. ✅ **CI/CD** - GitHub Actions 自动化部署
6. ✅ **负载均衡** - 多台服务器 + SLB
7. ✅ **Redis 缓存** - 提升性能

---

## 联系支持

如遇问题，请检查：
- 项目文档：`README.md`
- SSL 配置：`nginx/ssl/README.md`
- Vercel部署：`DEPLOYMENT.md`
- GitHub Issues

祝部署顺利！🚀
