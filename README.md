# AI工具大全

> 一个AI工具目录网站，提供分类展示、排名推荐、使用案例，并支持用户互动功能。

## 功能特性

- 🔍 **分类展示**: 按照语言、画图、编程、视频等分类展示AI工具
- 📊 **智能排名**: 基于GitHub Stars、Product Hunt投票等多维度综合排名
- 🏷️ **团队标签**: 标注国内团队、出海团队、海外团队
- 💰 **付费信息**: 显示工具的付费类型和定价详情
- 📱 **平台支持**: 标注PC、iOS、Android、Web等平台可用性
- 📝 **使用案例**: 提供优秀的操作案例展示
- 👤 **用户系统**: 支持登录、收藏、评论等互动功能
- 🔄 **自动更新**: 每周自动采集最新的AI工具数据

## 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Ant Design
- **后端**: Next.js API Routes + Prisma ORM
- **数据库**: MySQL 8.0
- **数据采集**: Puppeteer + Cheerio + GitHub API
- **部署**: 腾讯云

## 快速开始

### 环境要求

- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

### 安装

\`\`\`bash
# 克隆项目
git clone <repository-url>

# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 配置数据库连接
# 编辑 .env 文件，填入你的数据库连接信息

# 初始化数据库
npx prisma migrate dev

# 运行开发服务器
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 查看网站。

## 项目结构

\`\`\`
src/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页
│   ├── category/          # 分类页面
│   ├── tool/              # 工具详情页
│   ├── admin/             # 管理后台
│   └── api/               # API 路由
├── components/            # React 组件
│   ├── layout/           # 布局组件
│   ├── tool/             # 工具相关组件
│   └── common/           # 通用组件
├── lib/                   # 工具库
│   ├── prisma.ts         # Prisma 客户端
│   ├── scrapers/         # 数据爬虫
│   └── utils/            # 工具函数
├── types/                 # TypeScript 类型定义
└── styles/               # 全局样式

prisma/
└── schema.prisma         # 数据库模型定义

scripts/
└── scrape.ts            # 数据采集脚本
\`\`\`

## 开发任务

### 第一阶段（2-3周）- MVP
- [x] 项目初始化
- [ ] 数据库设计
- [ ] 数据采集系统
- [ ] 前端页面开发
- [ ] 基础管理后台
- [ ] 部署上线

### 第二阶段（+2周）- 用户系统
- [ ] 用户认证
- [ ] 收藏功能
- [ ] 评论系统

### 第三阶段（+2周）- 高级功能
- [ ] 使用案例
- [ ] 搜索筛选
- [ ] 工具对比

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT
