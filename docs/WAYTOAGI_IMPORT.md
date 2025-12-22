# WaytoAGI 数据导入指南

本指南说明如何从 WaytoAGI 飞书文档导入 AI 工具数据到本系统。

## 🎯 功能概述

- ✅ 自动从 WaytoAGI 飞书文档抓取 AI 工具数据
- ✅ 支持手动登录飞书账号
- ✅ 自动映射分类
- ✅ 去重和更新已有工具
- ✅ 保存 WaytoAGI 排名信息

## 📋 前置要求

1. **飞书账号**：能够访问 WaytoAGI 文档的飞书账号
2. **Node.js**：已安装 Node.js 和 npm
3. **数据库**：MySQL 数据库已配置并运行

## 🔧 数据库更新

导入前需要先更新数据库结构以支持新字段：

### 步骤1：应用数据库迁移

```bash
# 创建并应用新的数据库迁移
npm run prisma:migrate

# 或者手动执行（如果上面命令有问题）
npx prisma migrate dev --name add_waytoagi_support
```

迁移会添加以下字段：
- `tools.dataSource` - 标识工具来源（MANUAL, WAYTOAGI, GITHUB 等）
- `ranking_metrics.waytoagiRanking` - WaytoAGI 排名
- `ranking_metrics.waytoagiUrl` - WaytoAGI 文档链接
- `ranking_metrics.aiProductRanking` - AI产品榜排名（预留）

### 步骤2：生成 Prisma 客户端

```bash
npm run prisma:generate
```

## 🚀 使用方法

### 方式一：使用 npm 脚本（推荐）

```bash
npm run import:waytoagi
```

### 方式二：直接运行脚本

```bash
npx ts-node --project tsconfig.node.json scripts/import-waytoagi.ts
```

## 📖 导入流程

1. **启动浏览器**
   - 脚本会自动打开一个Chrome浏览器窗口
   - 浏览器会自动导航到 WaytoAGI 飞书文档

2. **手动登录**
   - 如果需要登录，请在浏览器窗口中手动完成登录
   - 登录成功后，脚本会自动继续

3. **数据抓取**
   - 脚本会自动等待表格加载
   - 然后提取所有工具数据

4. **数据导入**
   - 自动映射分类（WaytoAGI分类 → 本地分类）
   - 检查工具是否已存在：
     - 已存在：更新描述和 WaytoAGI 排名
     - 不存在：创建新工具记录
   - 更新或创建 ranking_metrics 记录

5. **完成**
   - 显示导入统计（新导入、更新、跳过的数量）
   - 自动关闭浏览器
   - 断开数据库连接

## 🗺️ 分类映射

脚本会自动将 WaytoAGI 的分类映射到本地分类：

| WaytoAGI 分类 | 本地分类 | Slug |
|--------------|---------|------|
| 对话、语言、AI对话 | 语言 | language |
| 画图、图像、图像生成 | 画图 | image |
| 编程、代码、开发 | 编程 | code |
| 视频、音频 | 视频 | video |
| 笔记、写作 | 笔记 | note |
| 助理、智能助手 | 个人助理 | assistant |

> 如果分类无法匹配，默认归类为"语言"类别

## 🔍 数据处理规则

### 工具查重

基于工具名称生成的 slug 进行查重：

```typescript
slug = toolName
  .toLowerCase()
  .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
  .replace(/^-+|-+$/g, '');
```

### 更新策略

对于已存在的工具：
- ✅ 更新 `description`（如果 WaytoAGI 有数据）
- ✅ 更新 `websiteUrl`（如果 WaytoAGI 有数据）
- ✅ 更新 `dataSource` 为 "WAYTOAGI"
- ✅ 更新 `waytoagiRanking` 和 `lastUpdated`
- ⛔ 不修改 `name`、`slug`、`categoryId`

## 📊 输出示例

```
🚀 开始从 WaytoAGI 导入数据...

📥 正在抓取 WaytoAGI 数据...
正在访问 WaytoAGI 飞书文档...
⚠️  请在浏览器窗口中手动登录飞书账号
登录后，脚本将自动继续...
✓ 登录成功！
正在等待表格加载...
正在提取数据...
✓ 成功抓取 150 个工具

💾 正在导入到数据库...

✓ 导入新工具: ChatGPT
✓ 更新工具: Midjourney
✓ 导入新工具: Claude
...

📊 导入统计:
  新导入: 85 个
  更新: 50 个
  跳过: 15 个
  总计: 150 个

✅ 导入完成！
```

## ⚙️ 高级配置

### 修改分类映射

编辑 `scripts/import-waytoagi.ts` 中的 `CATEGORY_MAPPING` 对象：

```typescript
const CATEGORY_MAPPING: CategoryMapping = {
  '对话': 'language',
  '你的分类名': '本地分类slug',
  // ...
};
```

### 自动登录（可选）

如果想要自动登录，可以在脚本中传入飞书凭证：

```typescript
const scraper = new WaytoAGIScraper({
  feishuEmail: 'your@email.com',
  feishuPassword: 'your-password',
  headless: true, // 无头模式
});
```

> ⚠️ 注意：不推荐在代码中硬编码密码，建议使用环境变量

### 调整选择器

如果飞书文档的 DOM 结构发生变化，需要修改 `src/lib/scrapers/WaytoAGIScraper.ts` 中的选择器：

```typescript
// 在 scrape() 方法中
const rows = document.querySelectorAll('.table-row, [data-testid="table-row"]');
const cells = row.querySelectorAll('.table-cell, [data-testid="table-cell"]');
```

## 🐛 常见问题

### 1. 浏览器无法启动

**问题**：`Error: Failed to launch chrome`

**解决**：
```bash
# Windows
npm install puppeteer

# 如果还不行，手动下载 Chrome
npx puppeteer browsers install chrome
```

### 2. 权限错误

**问题**：`EPERM: operation not permitted`

**解决**：
- 关闭所有运行中的开发服务器
- 关闭 VS Code 或其他可能锁定文件的程序
- 重新运行命令

### 3. 登录超时

**问题**：`Error: waiting for function failed: timeout 300000ms exceeded`

**解决**：
- 登录超时时间为 5 分钟
- 如需更长时间，修改 `WaytoAGIScraper.ts` 中的 timeout 值

### 4. 数据提取为空

**问题**：成功抓取但显示 `成功抓取 0 个工具`

**解决**：
- 检查飞书文档是否有权限限制
- 检查 DOM 选择器是否正确
- 打开浏览器的开发者工具查看实际的 HTML 结构

### 5. 分类映射失败

**问题**：大量工具被跳过，提示"分类不存在"

**解决**：
```bash
# 先运行种子数据，确保分类存在
npm run prisma:seed
```

## 📝 手动导出数据（备用方案）

如果自动化导入失败，可以使用手动导出方案：

1. 在飞书文档中导出 CSV/Excel 文件
2. 将数据转换为 JSON 格式
3. 使用通用导入脚本导入

## 🔄 定期更新

建议设置定期任务来更新 WaytoAGI 数据：

```bash
# Linux/Mac Cron Job
0 2 * * 0 cd /path/to/project && npm run import:waytoagi

# Windows 计划任务
# 在任务计划程序中创建每周任务运行脚本
```

## 📚 相关文档

- [WaytoAGI 飞书文档](https://waytoagi.feishu.cn/wiki/BVmWwpSJGioFyJkfAI3crXWTnyb)
- [Puppeteer 文档](https://pptr.dev/)
- [Prisma 文档](https://www.prisma.io/docs)

## 🤝 贡献

如果发现问题或有改进建议，欢迎提交 Issue 或 Pull Request。
