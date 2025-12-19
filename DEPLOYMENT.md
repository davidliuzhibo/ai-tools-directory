# AI工具大全 - 部署指南

## 部署到 Vercel

### 准备工作

1. **注册 Vercel 账号**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录

2. **准备生产数据库**

   您需要一个 MySQL 数据库。推荐选项：

   **选项 A: PlanetScale (推荐，免费层)**
   - 访问 https://planetscale.com
   - 创建免费数据库
   - 获取连接字符串

   **选项 B: Railway**
   - 访问 https://railway.app
   - 创建 MySQL 数据库

   **选项 C: 腾讯云 MySQL**
   - 购买腾讯云 MySQL 实例
   - 配置公网访问

### 部署步骤

#### 方法 1: 通过 Vercel Dashboard（推荐）

1. **推送代码到 GitHub**
   ```bash
   # 如果还没有 GitHub 仓库
   gh repo create ai-tools-directory --public --source=. --remote=origin
   git push -u origin master
   ```

2. **导入到 Vercel**
   - 访问 https://vercel.com/new
   - 选择 "Import Git Repository"
   - 选择您的 GitHub 仓库
   - 点击 "Import"

3. **配置环境变量**
   在 Vercel 项目设置中添加以下环境变量：

   **必需的环境变量：**
   ```
   DATABASE_URL=mysql://user:password@host:3306/database
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-generated-secret
   ```

   **可选的环境变量（用于数据采集功能）：**
   ```
   GITHUB_TOKEN=your-github-token
   PRODUCTHUNT_API_TOKEN=your-producthunt-token
   CRON_SECRET=your-cron-secret
   ```

   生成 NEXTAUTH_SECRET 和 CRON_SECRET:
   ```bash
   openssl rand -base64 32
   ```

   获取 API Tokens:
   - GitHub Token: https://github.com/settings/tokens (无需特殊权限)
   - Product Hunt Token: https://www.producthunt.com/v2/oauth/applications

4. **部署**
   - Vercel 会自动检测 Next.js 项目
   - 点击 "Deploy"

5. **运行数据库迁移**
   部署后，需要在生产数据库运行 migrations：

   ```bash
   # 方法 A: 使用 Vercel CLI
   npm i -g vercel
   vercel env pull .env.production
   npx prisma migrate deploy

   # 方法 B: 在本地连接生产数据库
   # 临时修改 .env 的 DATABASE_URL 为生产数据库
   npx prisma migrate deploy
   npx ts-node --project tsconfig.node.json prisma/seed.ts
   ```

#### 方法 2: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 添加环境变量
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production

# 部署到生产环境
vercel --prod
```

### 部署后检查清单

- [ ] 网站可以正常访问
- [ ] 首页显示正常
- [ ] 分类页面可以访问
- [ ] 工具详情页可以访问
- [ ] 搜索功能正常
- [ ] 管理后台可以访问 (/admin/tools)

### 常见问题

**Q: Prisma 无法连接数据库**
A: 确保 DATABASE_URL 正确，并且数据库允许来自 Vercel 的连接

**Q: 构建失败**
A: 检查 package.json 中的依赖是否完整

**Q: API 路由 404**
A: 确保使用 Next.js App Router，所有 API 在 src/app/api 目录

### 自定义域名

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加您的域名
3. 按照提示配置 DNS 记录

### 性能优化建议

1. 启用 Vercel Analytics
2. 配置图片优化
3. 启用 Edge Functions（如需要）
4. 配置 ISR (Incremental Static Regeneration)

### 监控和日志

- Vercel Dashboard 查看部署日志
- 使用 Vercel Analytics 监控性能
- 配置错误追踪（Sentry）

### 数据采集功能

本项目支持自动采集 GitHub Stars 和 Product Hunt 投票数等排名数据。

#### 本地手动更新数据

```bash
# 更新 GitHub Stars 数据
npm run update:github

# 更新 Product Hunt 投票数据
npm run update:producthunt

# 一次更新所有数据
npm run update:all
```

#### 自动定时任务（Vercel Cron Jobs）

项目已配置 Vercel Cron Jobs，每天凌晨 2 点（UTC时间）自动更新排名数据。

**配置说明：**
1. `vercel.json` 中已配置定时任务
2. 定时任务调用 `/api/cron/update-metrics` 端点
3. 需要在 Vercel 环境变量中设置 `CRON_SECRET` 以保护端点

**手动触发定时任务：**
```bash
curl -X GET https://your-domain.vercel.app/api/cron/update-metrics \
  -H "Authorization: Bearer your-cron-secret"
```

**注意事项：**
- GitHub API 有速率限制（无 token: 60次/小时，有 token: 5000次/小时）
- Product Hunt API 需要申请 API Token
- 建议配置 GITHUB_TOKEN 以提高限制
- 定时任务会自动处理 API 限制和错误
