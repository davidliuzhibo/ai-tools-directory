# WaytoAGI 数据导入 - 快速开始

## ✅ 已完成

CSV导入功能已经开发完成并测试通过！现在可以轻松从WaytoAGI导入数据。

## 🚀 快速开始（3步）

### 1. 从WaytoAGI导出数据

访问 [WaytoAGI飞书文档](https://waytoagi.feishu.cn/wiki/BVmWwpSJGioFyJkfAI3crXWTnyb?table=tblXKIWDjaTx7Lkl&view=vewYE1Jfjg)

1. 登录飞书账号
2. 点击表格右上角「...」→「导出」→「导出为 CSV」
3. 保存为 `data/waytoagi-tools.csv`

### 2. 运行导入命令

```bash
npm run import:csv
```

### 3. 查看结果

```bash
npm run check:data
```

## 📋 CSV格式要求

必填字段：
- `name` - 工具名称
- `category` - 分类（对话/画图/编程/视频/笔记/助理/办公等）

可选字段：
- `description` - 工具描述
- `url` - 官网链接
- `tags` - 标签（逗号分隔）

## 💡 使用示例

示例CSV文件已创建在 `data/waytoagi-tools-example.csv`：

```csv
name,category,description,url,tags
Gamma,演示文稿PPT,最棒的AI幻灯片工具,https://gamma.app,办公,PPT,AI
Tome,演示文稿PPT,非常好的AI幻灯片工具,https://beta.tome.app,办公,PPT,AI
```

## ✨ 功能特点

- ✅ **智能去重**：自动识别已存在的工具并更新
- ✅ **分类映射**：自动将中文分类映射到数据库分类
- ✅ **批量导入**：一次导入数百个工具
- ✅ **数据验证**：自动跳过无效数据
- ✅ **详细日志**：显示导入/更新/跳过统计

## 📖 完整文档

详细说明请查看：`docs/waytoagi-import-guide.md`

## 🎯 测试结果

刚刚的测试导入：
- ✅ 新导入: 2 个工具（Gamma, Tome）
- ✅ 更新: 3 个工具（ChatGPT, Midjourney, GitHub Copilot）
- ✅ 总工具数: 64 个
- ✅ 所有分类正常

现在可以正式使用了！🎉
