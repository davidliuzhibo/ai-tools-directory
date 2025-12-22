# 阿里云 ECS 部署总结 - AI工具大全

## ✅ 已完成的准备工作

我已经为您准备好了完整的阿里云 ECS 部署方案，包括：

### 1. 部署文档
- ✅ `docs/ALIYUN_DEPLOYMENT.md` - 完整的阿里云 ECS 部署指南
- ✅ `docs/ICP_BEIAN.md` - ICP 备案完全指南

### 2. 配置文件
- ✅ `ecosystem.config.js` - PM2 进程管理配置
- ✅ `nginx.conf` - Nginx 反向代理配置
- ✅ `.env.example` - 环境变量模板（已更新）

---

## 🎯 部署路线图

### 阶段一：准备工作（1-3天）

**1. 购买阿里云 ECS**
- 配置：2核4G，40GB存储，3Mbps带宽
- 地域：选择离用户近的地域
- 操作系统：Ubuntu 22.04

**2. 开始 ICP 备案**
- 准备材料（身份证、照片等）
- 提交备案申请
- **预计时间：10-25天**

**3. 配置服务器环境**
- 安装 Node.js 18
- 安装 MySQL 8.0
- 安装 Nginx
- 安装 PM2

---

### 阶段二：部署应用（备案期间，1天）

**1. 上传代码到服务器**
```bash
# 方式A：Git克隆
git clone 你的仓库地址

# 方式B：SCP上传
scp -r C:\Private\Trae\Projects\2.AIBook root@服务器IP:/var/www/
```

**2. 配置应用**
```bash
cd /var/www/ai-tools-directory
cp .env.example .env
nano .env  # 编辑环境变量
npm install
npm run prisma:generate
npm run prisma:migrate deploy
npm run build
```

**3. 启动应用**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**4. 配置 Nginx**
```bash
cp nginx.conf /etc/nginx/sites-available/aidaquanji.com
ln -s /etc/nginx/sites-available/aidaquanji.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

**此时可以通过 IP 地址访问网站测试**

---

### 阶段三：备案完成后配置（1天）

**1. 配置域名解析**
- 阿里云控制台 > 域名 > 解析
- 添加 A 记录指向服务器 IP

**2. 配置 SSL 证书**
```bash
certbot --nginx -d aidaquanji.com -d www.aidaquanji.com
```

**3. 在网站添加备案号**
编辑 Footer 组件，添加备案号链接

**4. 正式上线**
- 访问 https://aidaquanji.com
- 测试所有功能
- 通知用户

---

## 📋 文件清单

### 部署相关
```
项目根目录/
├── ecosystem.config.js          # PM2 配置（已创建✅）
├── nginx.conf                   # Nginx 配置（已创建✅）
├── .env.example                 # 环境变量模板（已更新✅）
├── vercel.json                  # Vercel配置（保留，参考定时任务）
└── docs/
    ├── ALIYUN_DEPLOYMENT.md     # 阿里云部署指南（已创建✅）
    └── ICP_BEIAN.md             # 备案指南（已创建✅）
```

### 已删除的文件
```
❌ docs/DOMAIN_SETUP.md           # Vercel域名配置
❌ docs/DOMAIN_QUICK_START.md     # Vercel快速配置
❌ docs/DOMAIN_SUMMARY.md         # Vercel域名总结
```

---

## 🔑 关键配置项

### 1. 环境变量 (.env)

**必须配置：**
```bash
DATABASE_URL="mysql://aitools:密码@localhost:3306/aitools"
NEXTAUTH_URL="https://aidaquanji.com"
NEXTAUTH_SECRET="随机生成的密钥"
```

**可选配置：**
```bash
GITHUB_TOKEN="用于GitHub数据采集"
PRODUCTHUNT_API_TOKEN="用于ProductHunt数据采集"
ADMIN_EMAIL="管理员邮箱"
CRON_SECRET="定时任务密钥"
```

### 2. PM2 配置 (ecosystem.config.js)

**关键参数：**
- `instances: 2` - 启动2个进程（根据CPU核心数调整）
- `exec_mode: 'cluster'` - 集群模式
- `max_memory_restart: '1G'` - 内存限制
- `cron_restart: '0 2 * * *'` - 每天凌晨2点重启

### 3. Nginx 配置 (nginx.conf)

**关键功能：**
- 反向代理到 Next.js (端口3000)
- 静态资源缓存
- Gzip 压缩
- SSL 支持（Certbot 自动配置）

---

## 🔄 定时任务配置

由于不使用 Vercel Cron，需要在服务器上配置 crontab：

### 配置方法
```bash
crontab -e
```

### 添加任务

**每天凌晨2点更新GitHub和ProductHunt数据：**
```cron
0 2 * * * cd /var/www/ai-tools-directory && /root/.nvm/versions/node/v18.*/bin/npm run update:all >> /var/www/ai-tools-directory/logs/cron.log 2>&1
```

**每周日凌晨3点备份数据库：**
```cron
0 3 * * 0 /root/backup-db.sh
```

---

## ⚡ 快速部署检查清单

### 服务器准备
- [ ] ECS服务器已购买（2核4G+）
- [ ] 安全组规则已配置（22, 80, 443端口）
- [ ] SSH已连接到服务器

### 环境安装
- [ ] Node.js 18 已安装
- [ ] MySQL 8.0 已安装
- [ ] Nginx 已安装
- [ ] PM2 已安装
- [ ] Git 已安装

### 应用部署
- [ ] 代码已上传到 /var/www/ai-tools-directory
- [ ] npm install 已完成
- [ ] .env 已配置
- [ ] 数据库已创建
- [ ] prisma migrate 已完成
- [ ] npm run build 已完成
- [ ] PM2 应用已启动
- [ ] Nginx 配置已生效

### 域名和备案
- [ ] ICP 备案已提交
- [ ] 备案号已获得
- [ ] 域名DNS已配置
- [ ] SSL证书已配置
- [ ] 网站已添加备案号

### 测试验证
- [ ] 可以通过域名访问
- [ ] HTTPS 正常工作
- [ ] 登录功能正常
- [ ] 管理后台正常
- [ ] 数据采集功能正常
- [ ] 定时任务配置正常

---

## 📊 部署时间线

| 阶段 | 任务 | 预计时间 |
|------|------|---------|
| 准备 | 购买ECS、提交备案 | 1天 |
| 备案 | 等待备案审核 | 10-25天 |
| 部署 | 配置服务器、部署应用 | 1天 |
| 上线 | 配置域名、SSL | 1天 |
| **总计** | - | **12-28天** |

---

## 💰 成本估算

### 阿里云 ECS
- **配置：** 2核4G，40GB，3Mbps
- **价格：** 约 ¥100-150/月（包年优惠更低）

### 域名
- **.com域名：** 约 ¥60-80/年

### SSL证书
- **Let's Encrypt：** 免费

### 总计
- **首年：** 约 ¥1200-1800（ECS） + ¥60-80（域名） = ¥1260-1880
- **续费：** 约 ¥1200-1800/年

---

## 🆘 获取帮助

### 部署问题
查看文档：`docs/ALIYUN_DEPLOYMENT.md`

### 备案问题
查看文档：`docs/ICP_BEIAN.md`

### 阿里云支持
- 技术支持：95187
- 工单系统：阿里云控制台

---

## 📝 重要提示

### ⚠️ 备案期间
- ❌ 域名不能解析到服务器
- ✅ 可以用IP地址测试
- ✅ 准备好网站内容

### ⚠️ 个人备案限制
如果使用个人备案：
- 网站名称不能包含"AI"、"工具"等行业词
- 建议改为：某某的个人网站
- 不能有经营性内容

### ⚠️ 网站内容要求
- 必须在首页底部显示备案号
- 内容必须合法合规
- 不能有前置审批项目

---

## ✅ 下一步行动

### 立即开始（今天）

**1. 购买阿里云ECS**
```
访问：https://ecs.console.aliyun.com/
选择配置：2核4G，Ubuntu 22.04
```

**2. 提交ICP备案**
```
访问：https://beian.aliyun.com/
准备材料，填写信息
```

**3. 阅读部署文档**
```
详细阅读：docs/ALIYUN_DEPLOYMENT.md
了解每个步骤
```

### 备案期间（10-25天）

**1. 配置服务器环境**
按照 `ALIYUN_DEPLOYMENT.md` 安装所有软件

**2. 部署应用**
上传代码，配置应用，启动服务

**3. 通过IP测试**
确保所有功能正常

### 备案完成后（1天）

**1. 配置域名**
添加DNS解析

**2. 配置SSL**
使用 Certbot 配置 HTTPS

**3. 正式上线**
通知用户，网站上线

---

## 🎉 总结

所有部署文档和配置文件已准备就绪！

**您现在可以：**
1. 开始购买阿里云ECS
2. 提交ICP备案申请
3. 参考文档进行部署

**部署文档：**
- 完整指南：`docs/ALIYUN_DEPLOYMENT.md`
- 备案指南：`docs/ICP_BEIAN.md`

**配置文件：**
- PM2：`ecosystem.config.js`
- Nginx：`nginx.conf`
- 环境变量：`.env.example`

**域名：** aidaquanji.com
**服务器：** 阿里云 ECS
**数据库：** MySQL 8.0
**Web服务器：** Nginx
**进程管理：** PM2

祝部署顺利！🚀
