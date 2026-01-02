# SSL证书配置指南

## 证书文件要求

nginx配置需要以下两个文件：
- `fullchain.pem` - 完整证书链（包含域名证书和中间证书）
- `privkey.pem` - 私钥文件

## 方案一：Let's Encrypt 免费证书（推荐）

### 使用 Certbot 自动获取

1. **在阿里云服务器上安装 Certbot**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install certbot

# CentOS/AlmaLinux
sudo yum install certbot
```

2. **停止当前 nginx 容器（如果运行中）**
```bash
docker-compose down
```

3. **使用 standalone 模式获取证书**
```bash
sudo certbot certonly --standalone \
  -d aidaquanji.com \
  -d www.aidaquanji.com \
  --email your-email@example.com \
  --agree-tos
```

4. **复制证书到项目目录**
```bash
sudo cp /etc/letsencrypt/live/aidaquanji.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/aidaquanji.com/privkey.pem ./nginx/ssl/
sudo chmod 644 ./nginx/ssl/*.pem
```

5. **设置自动续期**
```bash
# 测试续期命令
sudo certbot renew --dry-run

# 添加自动续期到 crontab（每天检查两次）
sudo crontab -e
# 添加以下行：
0 0,12 * * * certbot renew --quiet --deploy-hook "docker-compose -f /path/to/project/docker-compose.yml restart nginx"
```

### 使用 docker-compose 集成 Certbot（推荐用于生产环境）

创建 `docker-compose.certbot.yml`:
```yaml
version: '3.8'
services:
  certbot:
    image: certbot/certbot
    volumes:
      - ./nginx/ssl:/etc/letsencrypt
      - ./nginx/certbot-webroot:/var/www/certbot
    command: certonly --webroot --webroot-path=/var/www/certbot \
      --email your-email@example.com \
      --agree-tos --no-eff-email \
      -d aidaquanji.com -d www.aidaquanji.com
```

运行：
```bash
docker-compose -f docker-compose.certbot.yml run --rm certbot
```

## 方案二：阿里云 SSL 证书

### 免费证书（DV SSL）

1. 登录阿里云控制台
2. 进入"SSL证书" -> "证书购买"
3. 选择"DV单域名证书（免费试用）"
4. 填写域名：aidaquanji.com
5. 选择验证方式（推荐DNS验证）
6. 完成验证后下载证书

### 付费证书（OV/EV SSL）

提供更高信任等级和质保，适合商业网站。

## 方案三：其他商业证书提供商

- DigiCert
- GlobalSign
- Comodo/Sectigo
- GoDaddy

购买后下载 nginx 格式证书，通常包含：
- 域名证书.crt/.pem
- 私钥.key
- 中间证书.crt（如果单独提供）

合并为 fullchain.pem：
```bash
cat domain.crt intermediate.crt > fullchain.pem
cp private.key privkey.pem
```

## 证书安装后的验证

1. **检查证书文件**
```bash
ls -l nginx/ssl/
# 应该看到 fullchain.pem 和 privkey.pem
```

2. **验证证书内容**
```bash
openssl x509 -in nginx/ssl/fullchain.pem -text -noout | grep -A 2 "Subject:"
openssl x509 -in nginx/ssl/fullchain.pem -text -noout | grep "Not After"
```

3. **启动服务**
```bash
docker-compose up -d
```

4. **测试 HTTPS**
```bash
curl -I https://aidaquanji.com
```

5. **在线 SSL 测试**
访问 https://www.ssllabs.com/ssltest/ 测试配置

## 证书续期

### Let's Encrypt 证书
- 有效期：90天
- 建议：在过期前30天续期
- 自动续期：使用 cron job 或 certbot timer

### 商业证书
- 有效期：通常1年
- 需要手动续期或设置提醒

## 故障排查

### nginx 启动失败
```bash
# 检查 nginx 日志
docker-compose logs nginx

# 常见错误：
# 1. 证书文件不存在或路径错误
# 2. 证书文件权限问题
# 3. 证书与域名不匹配
```

### 证书不受信任
- 检查是否包含完整证书链（fullchain.pem应包含中间证书）
- 验证证书颁发机构是否被浏览器信任
- 检查证书是否过期

## 安全建议

1. **保护私钥文件**
   - 权限设置为 600 或 644
   - 不要提交到版本控制系统
   - 定期备份

2. **使用强加密协议**
   - 当前配置已启用 TLSv1.2 和 TLSv1.3
   - 禁用过时的 SSL 协议

3. **启用 HSTS**
   - 当前配置已启用 Strict-Transport-Security
   - 强制浏览器使用 HTTPS

4. **定期更新证书**
   - 设置提醒或自动续期
   - 监控证书过期时间

## 参考资源

- Let's Encrypt 文档: https://letsencrypt.org/zh-cn/docs/
- Certbot 用户指南: https://certbot.eff.org/instructions
- 阿里云 SSL 证书: https://www.aliyun.com/product/cas
- SSL Labs 测试工具: https://www.ssllabs.com/ssltest/
