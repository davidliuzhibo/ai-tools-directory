# 阿里云服务器部署 - 快速指南

## 前置条件检查

✅ 阿里云 ECS 服务器已准备
✅ DNS 已解析到服务器 IP
✅ 项目已上传到 GitHub

## 部署步骤

### 第一步：登录服务器

```bash
# 使用 SSH 登录阿里云服务器
ssh root@你的服务器IP
# 或
ssh 你的用户名@你的服务器IP
```

### 第二步：从 GitHub 克隆项目

```bash
# 进入部署目录（推荐使用 /var/www）
cd /var/www

# 克隆项目（替换为您的 GitHub 仓库地址）
git clone https://github.com/你的用户名/你的仓库名.git aitools
# 例如: git clone https://github.com/username/ai-tools-directory.git aitools

# 进入项目目录
cd aitools

# 查看文件列表，确认克隆成功
ls -la
```

**如果仓库是私有的**，需要先配置 GitHub 访问：

```bash
# 方法 1: 使用 Personal Access Token
git clone https://你的token@github.com/你的用户名/你的仓库名.git aitools

# 方法 2: 配置 SSH Key（推荐）
# 1. 生成 SSH Key
ssh-keygen -t ed25519 -C "your-email@example.com"

# 2. 查看公钥并添加到 GitHub
cat ~/.ssh/id_ed25519.pub
# 复制内容，添加到 GitHub Settings -> SSH Keys

# 3. 使用 SSH 克隆
git clone git@github.com:你的用户名/你的仓库名.git aitools
```

### 第三步：检查 SSL 证书状态

```bash
# 给脚本执行权限
chmod +x scripts/check-ssl.sh

# 运行 SSL 检查脚本
bash scripts/check-ssl.sh
```

**输出示例与对应操作**：

#### 情况 A：证书已存在且已复制
```
✅ Let's Encrypt 证书存在
✅ nginx/ssl 目录存在
✅ fullchain.pem 存在
✅ privkey.pem 存在
✅ SSL 证书配置完成，可以开始部署！
```
→ **直接进入第四步**

#### 情况 B：证书存在但未复制到项目
```
✅ Let's Encrypt 证书存在
❌ nginx/ssl/fullchain.pem 不存在
```
→ **执行以下命令**：
```bash
sudo cp /etc/letsencrypt/live/aidaquanji.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/aidaquanji.com/privkey.pem ./nginx/ssl/
sudo chmod 644 ./nginx/ssl/*.pem
```

#### 情况 C：证书不存在，需要获取新证书
```
❌ 未发现 aidaquanji.com 的 Let's Encrypt 证书
```
→ **执行以下命令获取证书**：

```bash
# 1. 安装 certbot（如果未安装）
sudo apt install certbot -y        # Ubuntu/Debian
# 或
sudo yum install certbot -y        # CentOS

# 2. 停止可能占用 80 端口的服务
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl stop apache2 2>/dev/null || true

# 3. 获取证书
sudo certbot certonly --standalone \
  -d aidaquanji.com \
  -d www.aidaquanji.com \
  --email davidliuzhibo@foxmail.com \
  --agree-tos

# 4. 复制证书到项目
sudo cp /etc/letsencrypt/live/aidaquanji.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/aidaquanji.com/privkey.pem ./nginx/ssl/
sudo chmod 644 ./nginx/ssl/*.pem

# 5. 验证证书文件
ls -lh ./nginx/ssl/
```

### 第四步：一键部署

```bash
# 给部署脚本执行权限
chmod +x scripts/deploy.sh

# 运行部署脚本
bash scripts/deploy.sh
```

**部署脚本会自动完成以下操作**：
1. ✅ 检查 Docker 和 Docker Compose
2. ✅ 配置环境变量
3. ✅ 验证 SSL 证书
4. ✅ 停止旧容器
5. ✅ 构建 Docker 镜像
6. ✅ 启动服务
7. ✅ 运行数据库迁移
8. ✅ 检查服务状态

**预计耗时**: 5-10 分钟（取决于服务器网络速度）

### 第五步：验证部署

部署完成后，脚本会显示服务状态。手动验证：

```bash
# 1. 查看容器状态（应该都是 Up）
docker-compose -f docker-compose.prod.yml ps

# 2. 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 3. 测试 HTTP 访问
curl -I http://aidaquanji.com

# 4. 测试 HTTPS 访问
curl -I https://aidaquanji.com

# 5. 检查 SSL 证书
echo | openssl s_client -servername aidaquanji.com -connect aidaquanji.com:443 2>/dev/null | openssl x509 -noout -dates
```

### 第六步：浏览器访问

打开浏览器访问：
- https://aidaquanji.com
- https://www.aidaquanji.com

**检查项**：
- ✅ 网站可以访问
- ✅ SSL 证书有效（地址栏显示🔒）
- ✅ 首页显示正常
- ✅ 工具列表加载正常
- ✅ 分类页面可访问
- ✅ 搜索功能正常

## 常用管理命令

```bash
# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f nginx

# 重启服务
docker-compose -f docker-compose.prod.yml restart

# 重启特定服务
docker-compose -f docker-compose.prod.yml restart web

# 停止服务
docker-compose -f docker-compose.prod.yml down

# 重新部署（拉取最新代码）
git pull origin master
bash scripts/deploy.sh

# 进入容器 Shell
docker-compose -f docker-compose.prod.yml exec web sh
docker-compose -f docker-compose.prod.yml exec mysql bash

# 查看容器资源使用
docker stats
```

## 数据库管理

```bash
# 手动运行数据库迁移
docker-compose -f docker-compose.prod.yml exec web npm run prisma:migrate deploy

# 查看数据库连接
docker-compose -f docker-compose.prod.yml exec mysql mysql -uroot -p

# 备份数据库
docker-compose -f docker-compose.prod.yml exec mysql mysqldump -uroot -p aitools > backup_$(date +%Y%m%d).sql

# 恢复数据库
cat backup_20240101.sql | docker-compose -f docker-compose.prod.yml exec -T mysql mysql -uroot -p aitools
```

## 更新代码

```bash
# 1. 进入项目目录
cd /var/www/aitools

# 2. 拉取最新代码
git pull origin master

# 3. 重新部署
bash scripts/deploy.sh
```

## 故障排查

### 问题 1：容器无法启动

```bash
# 查看详细错误日志
docker-compose -f docker-compose.prod.yml logs

# 检查端口占用
sudo netstat -tlnp | grep -E '80|443|3000|3306'

# 手动停止占用端口的进程
sudo kill -9 <PID>
```

### 问题 2：网站 502 Bad Gateway

```bash
# 1. 检查 web 容器是否运行
docker-compose -f docker-compose.prod.yml ps web

# 2. 查看 web 容器日志
docker-compose -f docker-compose.prod.yml logs web

# 3. 重启 web 服务
docker-compose -f docker-compose.prod.yml restart web
```

### 问题 3：数据库连接失败

```bash
# 1. 检查 MySQL 容器
docker-compose -f docker-compose.prod.yml ps mysql

# 2. 查看 MySQL 日志
docker-compose -f docker-compose.prod.yml logs mysql

# 3. 测试数据库连接
docker-compose -f docker-compose.prod.yml exec web npx prisma db pull
```

### 问题 4：SSL 证书错误

```bash
# 1. 重新检查证书
bash scripts/check-ssl.sh

# 2. 验证证书有效期
openssl x509 -in nginx/ssl/fullchain.pem -text -noout | grep "Not After"

# 3. 重新获取证书（如果过期）
sudo certbot renew
sudo cp /etc/letsencrypt/live/aidaquanji.com/*.pem ./nginx/ssl/
docker-compose -f docker-compose.prod.yml restart nginx
```

## 性能优化

### 1. 启用日志清理

```bash
# 添加 cron job 清理 Docker 日志
(crontab -l 2>/dev/null; echo "0 0 * * 0 truncate -s 0 /var/lib/docker/containers/*/*-json.log") | crontab -
```

### 2. 定期清理 Docker 资源

```bash
# 清理未使用的镜像、容器、网络
docker system prune -a -f

# 添加 cron job 每周清理
(crontab -l 2>/dev/null; echo "0 2 * * 0 docker system prune -a -f") | crontab -
```

### 3. 监控磁盘空间

```bash
# 检查磁盘使用
df -h

# 检查 Docker 磁盘使用
docker system df
```

## 安全建议

1. **修改 SSH 端口** - 参考 DEPLOYMENT-ALIYUN.md
2. **配置防火墙** - 只开放必要端口
3. **定期备份数据** - 每天自动备份数据库
4. **监控证书过期** - Let's Encrypt 证书 90 天过期
5. **更新系统** - 定期更新服务器系统和软件

## 自动化部署（进阶）

如果需要 CI/CD 自动部署，可以配置 GitHub Actions：

1. 在服务器创建部署用户
2. 配置 SSH Key
3. 设置 GitHub Secrets
4. 创建 `.github/workflows/deploy.yml`

详细配置请参考项目文档。

---

## 需要帮助？

如遇问题：
1. 查看日志：`docker-compose -f docker-compose.prod.yml logs -f`
2. 参考完整文档：`DEPLOYMENT-ALIYUN.md`
3. SSL 问题：`nginx/ssl/README.md`
4. 查看故障排查章节

祝部署顺利！🚀
