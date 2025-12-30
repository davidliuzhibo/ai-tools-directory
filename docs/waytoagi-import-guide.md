# WaytoAGI 数据导入指南

本指南说明如何从 WaytoAGI 飞书文档导入工具数据到数据库。

## 方法：CSV 导入（推荐）

### 步骤 1: 从 WaytoAGI 导出数据

1. 访问 [WaytoAGI 飞书文档](https://waytoagi.feishu.cn/wiki/BVmWwpSJGioFyJkfAI3crXWTnyb?table=tblXKIWDjaTx7Lkl&view=vewYE1Jfjg)
2. 登录您的飞书账号
3. 在多维表格右上角点击「...」菜单
4. 选择「导出」→「导出为 CSV」
5. 保存文件到项目的 `data` 目录，命名为 `waytoagi-tools.csv`

### 步骤 2: 准备 CSV 文件

确保 CSV 文件包含以下列（至少需要前两列）：

- **name**（必填）：工具名称
- **category**（必填）：工具分类（如：对话、画图、编程、视频、笔记、助理等）
- **description**（可选）：工具描述
- **url**（可选）：工具官网链接
- **tags**（可选）：标签，用逗号分隔

### 步骤 3: 运行导入脚本

```bash
# 使用默认路径 (data/waytoagi-tools.csv)
npm run import:csv

# 或指定自定义CSV文件路径
npm run import:csv -- path/to/your-file.csv
```

### CSV 格式示例

查看 `data/waytoagi-tools-example.csv` 获取格式参考：

```csv
name,category,description,url,tags
Gamma,演示文稿PPT,最棒的AI幻灯片工具,https://gamma.app,办公,PPT,AI
Tome,演示文稿PPT,非常好的AI幻灯片工具,https://beta.tome.app,办公,PPT,AI
ChatGPT,对话,OpenAI开发的强大对话AI,https://chat.openai.com,对话,AI
```

## 分类映射

脚本会自动将以下中文分类映射到数据库分类：

| 中文分类 | 数据库分类 |
|---------|----------|
| 对话、语言、AI对话 | language |
| 画图、图像、图像生成 | image |
| 编程、代码、开发 | code |
| 视频、音频 | video |
| 笔记、写作、办公、PPT、文档 | note |
| 助理、智能助手 | assistant |

## 注意事项

1. **数据去重**：如果工具已存在（根据名称生成的 slug），脚本会更新而不是重复创建
2. **分类要求**：确保分类名称能匹配上述映射表，否则会默认归类为「语言」分类
3. **UTF-8 编码**：确保 CSV 文件使用 UTF-8 编码保存
4. **必填字段**：至少需要提供工具名称和分类

## 故障排查

### 导入失败

如果导入失败，检查：
- CSV 文件是否存在且路径正确
- CSV 文件编码是否为 UTF-8
- 数据库是否正常运行
- 分类表是否包含所需的分类数据

### 查看数据

导入后可以运行以下命令查看数据：

```bash
npm run check:data
```

## 更新数据

定期更新 WaytoAGI 数据：

1. 从飞书重新导出 CSV
2. 覆盖 `data/waytoagi-tools.csv`
3. 重新运行 `npm run import:csv`

脚本会自动识别已存在的工具并更新，新工具则会被添加。
