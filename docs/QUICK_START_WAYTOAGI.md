# WaytoAGI 数据导入 - 快速开始

## ✅ 数据库已准备就绪

数据库迁移已成功完成，新增字段：
- `tools.dataSource` - 工具来源标识
- `ranking_metrics.waytoagiRanking` - WaytoAGI排名
- `ranking_metrics.waytoagiUrl` - WaytoAGI链接
- `ranking_metrics.aiProductRanking` - AI产品榜排名

## 🚀 立即开始导入

### 步骤1：运行导入命令

```bash
npm run import:waytoagi
```

### 步骤2：登录飞书

导入脚本会自动打开浏览器，显示：

```
🚀 开始从 WaytoAGI 导入数据...

📥 正在抓取 WaytoAGI 数据...
正在访问 WaytoAGI 飞书文档...
⚠️  请在浏览器窗口中手动登录飞书账号
登录后，脚本将自动继续...
```

**在打开的浏览器窗口中：**
1. 使用您的飞书账号登录
2. 确保能看到 WaytoAGI 的 AI 工具表格
3. 保持浏览器窗口打开

### 步骤3：等待自动完成

登录成功后，脚本会自动：
- ✅ 提取所有工具数据
- ✅ 映射分类
- ✅ 导入到数据库
- ✅ 显示统计结果

## 📊 预期输出

```
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

## 🔍 验证导入结果

导入完成后，可以：

### 1. 查看数据库（Prisma Studio）

```bash
npm run prisma:studio
```

在 Prisma Studio 中查看：
- `tools` 表 - 查看新导入的工具
- `ranking_metrics` 表 - 查看 WaytoAGI 排名数据

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看网站上的新工具。

### 3. 检查数据源标识

所有从 WaytoAGI 导入的工具，`dataSource` 字段都会标记为 "WAYTOAGI"。

## 🔄 定期更新

建议每周运行一次以更新数据：

```bash
# 每周运行
npm run import:waytoagi
```

已存在的工具会被更新（描述、链接、排名），新工具会被导入。

## ⚠️ 常见问题

### Q: 浏览器没有打开？

**A:** 确保已安装 Puppeteer：
```bash
npm install puppeteer
```

### Q: 登录超时？

**A:** 登录时限为 5 分钟。如果超时，重新运行命令即可。

### Q: 提取到 0 个工具？

**A:** 可能的原因：
1. 飞书文档权限不足
2. DOM 结构变化（需要更新选择器）
3. 表格未完全加载

**解决方法：**
- 确认您有访问文档的权限
- 查看 `src/lib/scrapers/WaytoAGIScraper.ts` 中的选择器
- 联系支持

### Q: 某些工具被跳过？

**A:** 可能原因：
1. 分类映射失败
2. 本地分类不存在

**解决方法：**
```bash
# 确保分类数据存在
npm run prisma:seed
```

## 📚 详细文档

完整文档请查看：
- `docs/WAYTOAGI_IMPORT.md` - 完整使用指南
- `scripts/import-waytoagi.ts` - 导入脚本源代码
- `src/lib/scrapers/WaytoAGIScraper.ts` - 爬虫实现

## 🎉 准备就绪！

现在您可以运行 `npm run import:waytoagi` 开始导入 WaytoAGI 数据了！

如有问题，请查看详细文档或联系支持。
